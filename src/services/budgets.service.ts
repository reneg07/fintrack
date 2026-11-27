import "server-only";

import {
  formatMonthLabel,
  getCurrentMonthKey,
  getMonthRangeExclusiveEnd,
} from "@/lib/dates";
import {
  calculateExactBudgetMetrics,
  calculateExactBudgetPercentage,
  parseExactCents,
  serializeExactCents,
} from "@/lib/money";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceError,
} from "@/lib/service-errors";
import type {
  CreateBudgetApiValues,
  UpdateBudgetApiValues,
} from "@/schemas/budget.schema";
import {
  type AuthenticatedSupabaseClient,
  requireAuthenticatedContext,
} from "@/services/_auth";
import { toCategoryIconKey } from "@/services/categories.service";
import {
  fetchCategoryMap,
  fetchExpenseTotalsByCategory,
} from "@/services/transactions.service";
import type { BudgetRow } from "@/types/database";
import type {
  BudgetsMonthPayload,
  Category,
  ExactBudgetSummary,
} from "@/types/domain";

const ZERO = BigInt(0);

const FALLBACK_EXPENSE_CATEGORY: Category = {
  id: "",
  name: "Sin categoría",
  type: "expense",
  color: "#475569",
  icon: "tag",
  isDefault: false,
};

function monthDateToKey(monthDate: string): string {
  return monthDate.slice(0, 7);
}

async function computeExpenseSpentForCategoryInMonth(
  supabase: AuthenticatedSupabaseClient,
  categoryId: string,
  monthKey: string,
): Promise<bigint> {
  const { start, endInclusive } = getMonthRangeExclusiveEnd(monthKey);
  const totals = await fetchExpenseTotalsByCategory(supabase, {
    categoryId,
    from: start,
    to: endInclusive,
  });
  return totals.get(categoryId) ?? ZERO;
}

function buildBudgetSummary(
  row: BudgetRow,
  category: Category,
  spent: bigint,
): ExactBudgetSummary {
  const metrics = calculateExactBudgetMetrics(
    spent,
    row.limit_cents,
    row.alert_threshold_pct,
  );
  return {
    id: row.id,
    categoryId: row.category_id,
    month: monthDateToKey(row.month),
    limitCents: row.limit_cents,
    alertThresholdPct: row.alert_threshold_pct,
    category,
    spentCents: metrics.spentCents,
    remainingCents: metrics.remainingCents,
    exceededCents: metrics.exceededCents,
    percentage: metrics.percentage,
    status: metrics.status,
  };
}

/**
 * Lists all monthly budgets for a given YYYY-MM month along with exact BigInt
 * real spending aggregated over ALL expense transactions of that month.
 */
export async function listBudgetsForMonth(
  monthParam?: string,
): Promise<BudgetsMonthPayload> {
  const { supabase } = await requireAuthenticatedContext();
  const monthKey = monthParam ?? getCurrentMonthKey();
  const monthDate = `${monthKey}-01`;
  const { start, endInclusive } = getMonthRangeExclusiveEnd(monthKey);

  const [budgetsResult, categoryMap, spentByCategory] = await Promise.all([
    supabase
      .from("budgets")
      .select("*")
      .eq("month", monthDate)
      .order("created_at", { ascending: true }),
    fetchCategoryMap(supabase),
    fetchExpenseTotalsByCategory(supabase, {
      from: start,
      to: endInclusive,
    }),
  ]);

  if (budgetsResult.error) {
    throw new ServiceError(
      "No fue posible consultar tus presupuestos mensuales.",
      500,
      "BUDGET_LIST_FAILED",
    );
  }

  let totalLimit = ZERO;
  let totalSpent = ZERO;
  let healthyCount = 0;
  let warningCount = 0;
  let limitReachedCount = 0;
  let exceededCount = 0;

  const items: ExactBudgetSummary[] = (budgetsResult.data ?? []).map((row) => {
    const category = categoryMap.get(row.category_id) ?? {
      ...FALLBACK_EXPENSE_CATEGORY,
      id: row.category_id,
    };
    const spent = spentByCategory.get(row.category_id) ?? ZERO;
    const summary = buildBudgetSummary(row, category, spent);

    totalLimit += parseExactCents(row.limit_cents);
    totalSpent += spent;

    if (summary.status === "healthy") healthyCount += 1;
    else if (summary.status === "warning") warningCount += 1;
    else if (summary.status === "limit_reached") limitReachedCount += 1;
    else exceededCount += 1;

    return summary;
  });

  items.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return a.category.name.localeCompare(b.category.name, "es");
  });

  const totalRemaining = totalLimit - totalSpent;
  const globalPercentage =
    totalLimit > ZERO
      ? calculateExactBudgetPercentage(totalSpent, totalLimit)
      : 0;

  return {
    month: monthKey,
    monthLabel: formatMonthLabel(monthKey),
    items,
    summary: {
      totalLimitCents: serializeExactCents(totalLimit),
      totalSpentCents: serializeExactCents(totalSpent),
      totalRemainingCents: serializeExactCents(totalRemaining),
      globalPercentage,
      healthyCount,
      warningCount,
      limitReachedCount,
      exceededCount,
    },
  };
}

export async function createBudget(
  input: CreateBudgetApiValues,
): Promise<ExactBudgetSummary> {
  const { supabase, user } = await requireAuthenticatedContext();

  const { data: catRow, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", input.categoryId)
    .maybeSingle();

  if (catError) {
    throw new ServiceError(
      "No fue posible validar la categoría seleccionada.",
      500,
      "CATEGORY_VALIDATION_FAILED",
    );
  }

  if (!catRow) {
    throw new BadRequestError(
      "La categoría seleccionada no existe o no pertenece a tu cuenta.",
      "INVALID_CATEGORY",
    );
  }

  if (catRow.type !== "expense") {
    throw new BadRequestError(
      "Los presupuestos solo pueden asociarse a categorías de gasto.",
      "BUDGET_EXPENSE_CATEGORY_REQUIRED",
    );
  }

  const monthDate = `${input.month}-01`;
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category_id: input.categoryId,
      month: monthDate,
      limit_cents: input.limitCents,
      alert_threshold_pct: input.alertThresholdPct,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new ConflictError(
        "Ya existe un presupuesto para esta categoría en el mes seleccionado.",
        "BUDGET_DUPLICATE",
      );
    }
    if (error?.code === "23503") {
      throw new BadRequestError(
        "Los presupuestos solo pueden asociarse a categorías de gasto propias.",
        "BUDGET_EXPENSE_CATEGORY_REQUIRED",
      );
    }
    throw new ServiceError(
      "No fue posible crear el presupuesto.",
      500,
      "BUDGET_CREATE_FAILED",
    );
  }

  const category: Category = {
    id: catRow.id,
    name: catRow.name,
    type: catRow.type,
    color: catRow.color,
    icon: toCategoryIconKey(catRow.icon),
    isDefault: catRow.is_default,
  };

  const spent = await computeExpenseSpentForCategoryInMonth(
    supabase,
    input.categoryId,
    input.month,
  );

  return buildBudgetSummary(data, category, spent);
}

export async function updateBudget(
  id: string,
  input: UpdateBudgetApiValues,
): Promise<ExactBudgetSummary> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar el presupuesto.",
      500,
      "BUDGET_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("El presupuesto solicitado no existe.");
  }

  const updatePayload: {
    limit_cents?: number;
    alert_threshold_pct?: number;
  } = {};

  if (input.limitCents !== undefined)
    updatePayload.limit_cents = input.limitCents;
  if (input.alertThresholdPct !== undefined)
    updatePayload.alert_threshold_pct = input.alertThresholdPct;

  const { data: updated, error: updateError } = await supabase
    .from("budgets")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new ServiceError(
      "No fue posible actualizar el presupuesto.",
      500,
      "BUDGET_UPDATE_FAILED",
    );
  }

  const monthKey = monthDateToKey(updated.month);
  const [categoryMap, spent] = await Promise.all([
    fetchCategoryMap(supabase),
    computeExpenseSpentForCategoryInMonth(
      supabase,
      updated.category_id,
      monthKey,
    ),
  ]);

  const category = categoryMap.get(updated.category_id) ?? {
    ...FALLBACK_EXPENSE_CATEGORY,
    id: updated.category_id,
  };

  return buildBudgetSummary(updated, category, spent);
}

export async function deleteBudget(id: string): Promise<{
  id: string;
  deleted: true;
}> {
  const { supabase } = await requireAuthenticatedContext();

  const { data: existing, error: fetchError } = await supabase
    .from("budgets")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError(
      "No fue posible consultar el presupuesto.",
      500,
      "BUDGET_FETCH_FAILED",
    );
  }

  if (!existing) {
    throw new NotFoundError("El presupuesto solicitado no existe.");
  }

  const { error: deleteError } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new ServiceError(
      "No fue posible eliminar el presupuesto.",
      500,
      "BUDGET_DELETE_FAILED",
    );
  }

  return { id, deleted: true };
}
