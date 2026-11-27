import "server-only";

import { collectPaginatedBatches } from "@/lib/batch-pagination";
import { CATEGORY_ICON_MAP } from "@/lib/category-icons";
import {
  ConflictError,
  NotFoundError,
  ServiceError,
} from "@/lib/service-errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  CreateCategoryValues,
  UpdateCategoryValues,
} from "@/schemas/category.schema";
import {
  type AuthenticatedSupabaseClient,
  requireAuthenticatedContext,
} from "@/services/_auth";
import type { CategoryRow } from "@/types/database";
import type {
  Category,
  CategoryIconKey,
  CategoryWithUsage,
  TransactionType,
} from "@/types/domain";

const PAGE_BATCH_SIZE = 1000;

export function toCategoryIconKey(value: string): CategoryIconKey {
  if (value in CATEGORY_ICON_MAP) {
    return value as CategoryIconKey;
  }
  return "tag";
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: toCategoryIconKey(row.icon),
    isDefault: row.is_default,
  };
}

/**
 * Paginates through all rows of a user's table to count usage per category
 * without ever hitting PostgREST's default 1000-row cap or double-counting under concurrent writes.
 */
async function countUsageByCategory(
  supabase: AuthenticatedSupabaseClient,
  table: "transactions" | "budgets",
): Promise<Map<string, number>> {
  const rows = await collectPaginatedBatches<{ id: string; category_id: string }>(
    async (from, to) => {
      const { data, error } = await supabase
        .from(table)
        .select("id, category_id")
        .order("id", { ascending: true })
        .range(from, to);

      if (error) {
        throw new ServiceError(
          "No fue posible verificar los registros asociados a tus categorías.",
          500,
          "CATEGORY_USAGE_QUERY_FAILED",
        );
      }

      return data ?? [];
    },
    PAGE_BATCH_SIZE,
  );

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return counts;
}

async function getSingleCategoryUsage(
  supabase: AuthenticatedSupabaseClient,
  categoryId: string,
): Promise<{ transactionsCount: number; budgetsCount: number }> {
  const [txResult, budgetResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId),
    supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId),
  ]);

  if (txResult.error || budgetResult.error) {
    throw new ServiceError(
      "No fue posible validar las relaciones de la categoría.",
      500,
      "CATEGORY_USAGE_CHECK_FAILED",
    );
  }

  return {
    transactionsCount: txResult.count ?? 0,
    budgetsCount: budgetResult.count ?? 0,
  };
}

/**
 * Lists the authenticated user's categories along with exact transaction and budget usage counts.
 */
export async function listCategoriesWithUsage(options?: {
  type?: TransactionType;
}): Promise<CategoryWithUsage[]> {
  const { supabase } = await requireAuthenticatedContext();

  let query = supabase
    .from("categories")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  const [{ data, error }, txCounts, budgetCounts] = await Promise.all([
    query,
    countUsageByCategory(supabase, "transactions"),
    countUsageByCategory(supabase, "budgets"),
  ]);

  if (error || !data) {
    throw new ServiceError(
      "No fue posible obtener tus categorías.",
      500,
      "CATEGORY_LIST_FAILED",
    );
  }

  return data.map((row) => ({
    ...mapCategoryRow(row),
    transactionsCount: txCounts.get(row.id) ?? 0,
    budgetsCount: budgetCounts.get(row.id) ?? 0,
  }));
}

/**
 * Safe Server Component helper that returns categories (or empty list if unauthenticated/unconfigured).
 */
export async function getUserCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const categories = await listCategoriesWithUsage();
    return categories.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color,
      icon: item.icon,
      isDefault: item.isDefault,
    }));
  } catch {
    return [];
  }
}

export async function createCategory(
  input: CreateCategoryValues,
): Promise<CategoryWithUsage> {
  const { supabase, user } = await requireAuthenticatedContext();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
      is_default: false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ConflictError(
        "Ya existe una categoría con ese nombre y tipo.",
        "CATEGORY_DUPLICATE",
      );
    }
    throw new ServiceError(
      "No fue posible crear la categoría.",
      500,
      "CATEGORY_CREATE_FAILED",
    );
  }

  return {
    ...mapCategoryRow(data),
    transactionsCount: 0,
    budgetsCount: 0,
  };
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryValues,
): Promise<CategoryWithUsage> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar la categoría.",
      500,
      "CATEGORY_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("La categoría solicitada no existe.");
  }

  const usage = await getSingleCategoryUsage(supabase, categoryId);

  if (
    input.type !== undefined &&
    input.type !== existing.type &&
    (usage.transactionsCount > 0 || usage.budgetsCount > 0)
  ) {
    throw new ConflictError(
      "No puedes cambiar el tipo de esta categoría porque ya tiene transacciones o presupuestos asociados.",
      "CATEGORY_TYPE_IN_USE",
      {
        transactionsCount: [String(usage.transactionsCount)],
        budgetsCount: [String(usage.budgetsCount)],
      },
    );
  }

  const updatePayload: {
    name?: string;
    type?: TransactionType;
    color?: string;
    icon?: string;
  } = {};

  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.type !== undefined) updatePayload.type = input.type;
  if (input.color !== undefined) updatePayload.color = input.color;
  if (input.icon !== undefined) updatePayload.icon = input.icon;

  const { data: updated, error: updateError } = await supabase
    .from("categories")
    .update(updatePayload)
    .eq("id", categoryId)
    .select("*")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      throw new ConflictError(
        "Ya existe otra categoría con ese nombre y tipo.",
        "CATEGORY_DUPLICATE",
      );
    }
    if (updateError.code === "23503") {
      throw new ConflictError(
        "No puedes cambiar el tipo de esta categoría porque tiene registros asociados.",
        "CATEGORY_TYPE_IN_USE",
      );
    }
    throw new ServiceError(
      "No fue posible actualizar la categoría.",
      500,
      "CATEGORY_UPDATE_FAILED",
    );
  }

  return {
    ...mapCategoryRow(updated),
    transactionsCount: usage.transactionsCount,
    budgetsCount: usage.budgetsCount,
  };
}

export async function deleteCategory(categoryId: string): Promise<{
  id: string;
  deleted: true;
}> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar la categoría.",
      500,
      "CATEGORY_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("La categoría solicitada no existe.");
  }

  const usage = await getSingleCategoryUsage(supabase, categoryId);
  if (usage.transactionsCount > 0 || usage.budgetsCount > 0) {
    const parts: string[] = [];
    if (usage.transactionsCount > 0) {
      parts.push(
        `${usage.transactionsCount} ${usage.transactionsCount === 1 ? "transacción" : "transacciones"}`,
      );
    }
    if (usage.budgetsCount > 0) {
      parts.push(
        `${usage.budgetsCount} ${usage.budgetsCount === 1 ? "presupuesto" : "presupuestos"}`,
      );
    }
    throw new ConflictError(
      `No puedes eliminar esta categoría porque tiene ${parts.join(" y ")} asociados.`,
      "CATEGORY_IN_USE",
      {
        transactionsCount: [String(usage.transactionsCount)],
        budgetsCount: [String(usage.budgetsCount)],
      },
    );
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (deleteError) {
    if (deleteError.code === "23503") {
      throw new ConflictError(
        "No puedes eliminar esta categoría porque tiene transacciones o presupuestos asociados.",
        "CATEGORY_IN_USE",
      );
    }
    throw new ServiceError(
      "No fue posible eliminar la categoría.",
      500,
      "CATEGORY_DELETE_FAILED",
    );
  }

  return { id: categoryId, deleted: true };
}
