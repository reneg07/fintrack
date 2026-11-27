import type { Metadata } from "next";
import { BudgetsManager } from "@/components/budgets/budgets-manager";
import { formatMonthLabel, getCurrentMonthKey } from "@/lib/dates";
import { listBudgetsForMonth } from "@/services/budgets.service";
import { listCategoriesWithUsage } from "@/services/categories.service";
import type { BudgetsMonthPayload } from "@/types/domain";

export const metadata: Metadata = {
  title: "Presupuestos",
  description: "Control mensual de presupuestos por categoría en FinTrack.",
};

export default async function BudgetsPage() {
  const currentMonth = getCurrentMonthKey();
  const emptyPayload: BudgetsMonthPayload = {
    month: currentMonth,
    monthLabel: formatMonthLabel(currentMonth),
    items: [],
    summary: {
      totalLimitCents: "0",
      totalSpentCents: "0",
      totalRemainingCents: "0",
      globalPercentage: 0,
      healthyCount: 0,
      warningCount: 0,
      limitReachedCount: 0,
      exceededCount: 0,
    },
  };

  const [budgetsResult, expenseCategories] = await Promise.all([
    listBudgetsForMonth(currentMonth).then(
      (data) => ({ ok: true as const, data }),
      () => ({
        ok: false as const,
        message:
          "No fue posible cargar tus presupuestos mensuales desde el servidor. Intenta nuevamente.",
      }),
    ),
    listCategoriesWithUsage({ type: "expense" }).catch(() => []),
  ]);

  return (
    <BudgetsManager
      initialData={budgetsResult.ok ? budgetsResult.data : emptyPayload}
      initialError={budgetsResult.ok ? null : budgetsResult.message}
      expenseCategories={expenseCategories}
    />
  );
}
