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

  const [initialData, expenseCategories] = await Promise.all([
    listBudgetsForMonth(currentMonth).catch(() => emptyPayload),
    listCategoriesWithUsage({ type: "expense" }).catch(() => []),
  ]);

  return (
    <BudgetsManager
      initialData={initialData}
      expenseCategories={expenseCategories}
    />
  );
}
