import "server-only";

import {
  collectPaginatedBatches,
  DEFAULT_POSTGREST_BATCH_SIZE,
} from "@/lib/batch-pagination";
import { sanitizePostgrestSearch } from "@/lib/search";
import {
  parseExactCents,
  serializeExactCents,
} from "@/lib/money";
import {
  BadRequestError,
  NotFoundError,
  ServiceError,
} from "@/lib/service-errors";
import type {
  CreateTransactionApiValues,
  TransactionQueryValues,
  UpdateTransactionApiValues,
} from "@/schemas/transaction.schema";
import {
  type AuthenticatedSupabaseClient,
  requireAuthenticatedContext,
} from "@/services/_auth";
import { toCategoryIconKey } from "@/services/categories.service";
import type { CategoryRow, TransactionRow } from "@/types/database";
import type {
  Category,
  PaginatedTransactionsResult,
  TransactionType,
  TransactionWithCategory,
} from "@/types/domain";

const ZERO = BigInt(0);
const BATCH_SIZE = DEFAULT_POSTGREST_BATCH_SIZE;

export interface TransactionFilterOptions {
  q?: string;
  type?: "all" | TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
}

export { sanitizePostgrestSearch };

function mapCategoryMap(rows: CategoryRow[]): Map<string, Category> {
  const map = new Map<string, Category>();
  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: toCategoryIconKey(row.icon),
      isDefault: row.is_default,
    });
  }
  return map;
}

const FALLBACK_CATEGORY: Category = {
  id: "",
  name: "Sin categoría",
  type: "expense",
  color: "#475569",
  icon: "tag",
  isDefault: false,
};

function mapTransactionRow(
  row: TransactionRow,
  categoryMap: Map<string, Category>,
): TransactionWithCategory {
  const cat = categoryMap.get(row.category_id) ?? {
    ...FALLBACK_CATEGORY,
    id: row.category_id,
    type: row.type,
  };
  return {
    id: row.id,
    type: row.type,
    categoryId: row.category_id,
    category: cat,
    amountCents: row.amount_cents,
    occurredOn: row.occurred_on,
    description: row.description,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyTransactionFilters<Q extends Record<string, any>>(
  query: Q,
  filters?: TransactionFilterOptions,
): Q {
  let next = query;
  if (!filters) return next;

  if (filters.type && filters.type !== "all") {
    next = next.eq("type", filters.type);
  }
  if (filters.categoryId && filters.categoryId !== "all") {
    next = next.eq("category_id", filters.categoryId);
  }
  if (filters.from) {
    next = next.gte("occurred_on", filters.from);
  }
  if (filters.to) {
    next = next.lte("occurred_on", filters.to);
  }
  if (filters.q) {
    const safe = sanitizePostgrestSearch(filters.q);
    if (safe.length > 0) {
      next = next.or(`description.ilike.%${safe}%,notes.ilike.%${safe}%`);
    }
  }
  return next;
}

export async function fetchCategoryMap(
  supabase: AuthenticatedSupabaseClient,
): Promise<Map<string, Category>> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error || !data) {
    throw new ServiceError(
      "No fue posible cargar las categorías del usuario.",
      500,
      "CATEGORY_LOOKUP_FAILED",
    );
  }
  return mapCategoryMap(data);
}

/**
 * Fetches ALL matching user transactions across arbitrary result sizes by paginating
 * in 1000-row batches with deterministic ordering and ID deduplication.
 * Prevents silent truncation on dashboard aggregations, budgets, reports, and CSV exports.
 */
export async function fetchAllUserTransactions(
  supabase: AuthenticatedSupabaseClient,
  filters?: TransactionFilterOptions,
): Promise<{
  transactions: TransactionWithCategory[];
  categoryMap: Map<string, Category>;
}> {
  const [categoryMap, rows] = await Promise.all([
    fetchCategoryMap(supabase),
    collectPaginatedBatches<TransactionRow>(async (from, to) => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);

      query = applyTransactionFilters(query, filters);

      const { data, error } = await query;
      if (error) {
        throw new ServiceError(
          "No fue posible consultar tus transacciones.",
          500,
          "TRANSACTIONS_FETCH_FAILED",
        );
      }

      return data ?? [];
    }, BATCH_SIZE),
  ]);

  return {
    transactions: rows.map((row) => mapTransactionRow(row, categoryMap)),
    categoryMap,
  };
}

/**
 * Lightweight paginated fetcher strictly for expense totals per category (selects only
 * `id, category_id, amount_cents` without transferring descriptions/notes/timestamps).
 */
export async function fetchExpenseTotalsByCategory(
  supabase: AuthenticatedSupabaseClient,
  filters: { from: string; to: string; categoryId?: string },
): Promise<Map<string, bigint>> {
  const rows = await collectPaginatedBatches<{
    id: string;
    category_id: string;
    amount_cents: number;
  }>(async (from, to) => {
    let query = supabase
      .from("transactions")
      .select("id, category_id, amount_cents")
      .eq("type", "expense")
      .gte("occurred_on", filters.from)
      .lte("occurred_on", filters.to)
      .order("id", { ascending: true })
      .range(from, to);

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    const { data, error } = await query;
    if (error) {
      throw new ServiceError(
        "No fue posible calcular los gastos del período para tus presupuestos.",
        500,
        "BUDGET_EXPENSE_QUERY_FAILED",
      );
    }

    return data ?? [];
  }, BATCH_SIZE);

  const totals = new Map<string, bigint>();
  for (const row of rows) {
    const prev = totals.get(row.category_id) ?? ZERO;
    totals.set(row.category_id, prev + parseExactCents(row.amount_cents));
  }
  return totals;
}

function summarizeRowsToExactTotals(
  rows: readonly { type: TransactionType; amount_cents: number }[],
): {
  incomeCents: string;
  expenseCents: string;
  netCents: string;
  count: number;
} {
  let income = ZERO;
  let expense = ZERO;

  for (const row of rows) {
    const amount = parseExactCents(row.amount_cents);
    if (row.type === "income") {
      income += amount;
    } else {
      expense += amount;
    }
  }

  return {
    incomeCents: serializeExactCents(income),
    expenseCents: serializeExactCents(expense),
    netCents: serializeExactCents(income - expense),
    count: rows.length,
  };
}

/**
 * Computes exact arbitrary-precision BigInt totals over ALL matching transactions
 * (never truncated to the current UI page or 1000-row cap, deduplicated by id).
 */
async function computeFilteredExactTotals(
  supabase: AuthenticatedSupabaseClient,
  filters?: TransactionFilterOptions,
): Promise<{
  incomeCents: string;
  expenseCents: string;
  netCents: string;
  count: number;
}> {
  const rows = await collectPaginatedBatches<{
    id: string;
    type: TransactionType;
    amount_cents: number;
  }>(async (from, to) => {
    let query = supabase
      .from("transactions")
      .select("id, type, amount_cents")
      .order("id", { ascending: true })
      .range(from, to);

    query = applyTransactionFilters(query, filters);

    const { data, error } = await query;
    if (error) {
      throw new ServiceError(
        "No fue posible calcular los totales filtrados.",
        500,
        "TRANSACTION_TOTALS_FAILED",
      );
    }

    return data ?? [];
  }, BATCH_SIZE);

  return summarizeRowsToExactTotals(rows);
}

export async function listTransactions(
  queryInput?: Partial<TransactionQueryValues>,
): Promise<PaginatedTransactionsResult> {
  const { supabase } = await requireAuthenticatedContext();

  const page = Math.max(1, queryInput?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, queryInput?.pageSize ?? 10));
  const filters: TransactionFilterOptions = {
    q: queryInput?.q,
    type: queryInput?.type ?? "all",
    categoryId: queryInput?.categoryId ?? "all",
    from: queryInput?.from,
    to: queryInput?.to,
  };

  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  let pageQuery = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(fromIdx, toIdx);

  pageQuery = applyTransactionFilters(pageQuery, filters);

  const [pageResult, categoryMap] = await Promise.all([
    pageQuery,
    fetchCategoryMap(supabase),
  ]);

  if (pageResult.error) {
    throw new ServiceError(
      "No fue posible consultar el listado de transacciones.",
      500,
      "TRANSACTION_LIST_FAILED",
    );
  }

  const pageRows = pageResult.data ?? [];
  const exactCount = pageResult.count ?? pageRows.length;

  // Optimization: when page 1 already contains all matching rows, avoid an extra full-scan query
  const totals =
    page === 1 && exactCount <= pageSize
      ? summarizeRowsToExactTotals(pageRows)
      : await computeFilteredExactTotals(supabase, filters);

  const totalCount = pageResult.count ?? totals.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const items = pageRows.map((row) => mapTransactionRow(row, categoryMap));

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
    totals,
  };
}

export async function getTransactionById(
  id: string,
): Promise<TransactionWithCategory> {
  const { supabase } = await requireAuthenticatedContext();
  const [{ data, error }, categoryMap] = await Promise.all([
    supabase.from("transactions").select("*").eq("id", id).maybeSingle(),
    fetchCategoryMap(supabase),
  ]);

  if (error) {
    throw new ServiceError(
      "No fue posible consultar la transacción.",
      500,
      "TRANSACTION_FETCH_FAILED",
    );
  }

  if (!data) {
    throw new NotFoundError("La transacción solicitada no existe.");
  }

  return mapTransactionRow(data, categoryMap);
}

async function assertCompatibleUserCategory(
  supabase: AuthenticatedSupabaseClient,
  categoryId: string,
  expectedType: TransactionType,
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    throw new ServiceError(
      "No fue posible validar la categoría seleccionada.",
      500,
      "CATEGORY_VALIDATION_FAILED",
    );
  }

  if (!data) {
    throw new BadRequestError(
      "La categoría seleccionada no existe o no pertenece a tu cuenta.",
      "INVALID_CATEGORY",
    );
  }

  if (data.type !== expectedType) {
    throw new BadRequestError(
      expectedType === "income"
        ? "Para un ingreso debes seleccionar una categoría de tipo ingreso."
        : "Para un gasto debes seleccionar una categoría de tipo gasto.",
      "CATEGORY_TYPE_MISMATCH",
    );
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    color: data.color,
    icon: toCategoryIconKey(data.icon),
    isDefault: data.is_default,
  };
}

export async function createTransaction(
  input: CreateTransactionApiValues,
): Promise<TransactionWithCategory> {
  const { supabase, user } = await requireAuthenticatedContext();
  const category = await assertCompatibleUserCategory(
    supabase,
    input.categoryId,
    input.type,
  );

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: input.type,
      category_id: input.categoryId,
      amount_cents: input.amountCents,
      occurred_on: input.occurredOn,
      description: input.description,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23503") {
      throw new BadRequestError(
        "La categoría seleccionada no es compatible con el tipo de transacción.",
        "CATEGORY_TYPE_MISMATCH",
      );
    }
    throw new ServiceError(
      "No fue posible registrar la transacción.",
      500,
      "TRANSACTION_CREATE_FAILED",
    );
  }

  const categoryMap = new Map<string, Category>([[category.id, category]]);
  return mapTransactionRow(data, categoryMap);
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionApiValues,
): Promise<TransactionWithCategory> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar la transacción.",
      500,
      "TRANSACTION_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("La transacción solicitada no existe.");
  }

  const effectiveType = input.type ?? existing.type;
  const effectiveCategoryId = input.categoryId ?? existing.category_id;

  const category = await assertCompatibleUserCategory(
    supabase,
    effectiveCategoryId,
    effectiveType,
  );

  const updatePayload: {
    type?: TransactionType;
    category_id?: string;
    amount_cents?: number;
    occurred_on?: string;
    description?: string;
    notes?: string | null;
  } = {};

  if (input.type !== undefined) updatePayload.type = input.type;
  if (input.categoryId !== undefined)
    updatePayload.category_id = input.categoryId;
  if (input.amountCents !== undefined)
    updatePayload.amount_cents = input.amountCents;
  if (input.occurredOn !== undefined)
    updatePayload.occurred_on = input.occurredOn;
  if (input.description !== undefined)
    updatePayload.description = input.description;
  if (input.notes !== undefined) updatePayload.notes = input.notes;

  const { data: updated, error: updateError } = await supabase
    .from("transactions")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    if (updateError?.code === "23503") {
      throw new BadRequestError(
        "La categoría seleccionada no es compatible con el tipo de transacción.",
        "CATEGORY_TYPE_MISMATCH",
      );
    }
    throw new ServiceError(
      "No fue posible actualizar la transacción.",
      500,
      "TRANSACTION_UPDATE_FAILED",
    );
  }

  const categoryMap = new Map<string, Category>([[category.id, category]]);
  return mapTransactionRow(updated, categoryMap);
}

export async function deleteTransaction(id: string): Promise<{
  id: string;
  deleted: true;
}> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar la transacción.",
      500,
      "TRANSACTION_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("La transacción solicitada no existe.");
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new ServiceError(
      "No fue posible eliminar la transacción.",
      500,
      "TRANSACTION_DELETE_FAILED",
    );
  }

  return { id, deleted: true };
}
