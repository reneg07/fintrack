import { describe, expect, it } from "vitest";
import {
  DEMO_ACTIVE_MONTH,
  DEMO_BUDGETS,
  DEMO_TRANSACTIONS,
  getDemoBudgetSummaries,
  getDemoCategoryById,
  getDemoExpenseBreakdown,
  getDemoMonthlyCashflowSeries,
  getDemoPeriodMetrics,
} from "@/lib/demo-data";
import { sumCents } from "@/lib/money";

describe("demo-data mathematical and relational consistency", () => {
  it("enforces category type compatibility on all demo transactions and budgets", () => {
    for (const tx of DEMO_TRANSACTIONS) {
      const category = getDemoCategoryById(tx.categoryId);
      expect(tx.type).toBe(category.type);
      expect(tx.amountCents).toBeGreaterThan(0);
    }

    for (const budget of DEMO_BUDGETS) {
      const category = getDemoCategoryById(budget.categoryId);
      expect(category.type).toBe("expense");
      expect(budget.limitCents).toBeGreaterThan(0);
    }
  });

  it("matches KPI totals with monthly cashflow series and category breakdown", () => {
    const activeMetrics = getDemoPeriodMetrics(DEMO_ACTIVE_MONTH);
    const series = getDemoMonthlyCashflowSeries();
    const breakdown = getDemoExpenseBreakdown(DEMO_ACTIVE_MONTH);

    expect(sumCents(series.map((m) => m.netCents))).toBe(
      activeMetrics.accumulatedBalanceCents,
    );
    expect(sumCents(breakdown.map((b) => b.amountCents))).toBe(
      activeMetrics.periodExpenseCents,
    );
  });

  it("exposes healthy, warning, and exceeded budget states in active demo month", () => {
    const summaries = getDemoBudgetSummaries(DEMO_ACTIVE_MONTH);
    const statuses = new Set(summaries.map((b) => b.status));
    expect(statuses.has("healthy")).toBe(true);
    expect(statuses.has("warning")).toBe(true);
    expect(statuses.has("exceeded")).toBe(true);
  });
});
