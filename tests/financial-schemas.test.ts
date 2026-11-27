import { describe, expect, it } from "vitest";
import {
  buildExactExpenseBreakdown,
  buildExactMonthlySeries,
  computeExactWindowTotals,
} from "@/lib/financial-aggregations";
import { MAX_SAFE_CENTS } from "@/lib/money";
import {
  createBudgetApiSchema,
  updateBudgetApiSchema,
} from "@/schemas/budget.schema";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/schemas/category.schema";
import {
  exportQuerySchema,
  reportsQuerySchema,
} from "@/schemas/reports.schema";
import {
  createTransactionApiSchema,
  transactionQuerySchema,
} from "@/schemas/transaction.schema";
import type { Category, TransactionWithCategory } from "@/types/domain";

const SAMPLE_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("Phase 04 Zod schemas and exact aggregation engine", () => {
  it("validates category create and update schemas", () => {
    const created = createCategorySchema.safeParse({
      name: "  Mascotas   domésticas ",
      type: "expense",
      color: "#059669",
      icon: "tag",
    });
    expect(created.success).toBe(true);
    if (created.success) {
      expect(created.data.name).toBe("Mascotas domésticas");
    }

    expect(
      createCategorySchema.safeParse({
        name: "",
        type: "expense",
        color: "red",
        icon: "invalid-icon",
      }).success,
    ).toBe(false);

    expect(updateCategorySchema.safeParse({}).success).toBe(false);
  });

  it("validates transaction schemas and query range constraints", () => {
    expect(
      createTransactionApiSchema.safeParse({
        type: "expense",
        categoryId: SAMPLE_UUID,
        amountCents: 1999,
        occurredOn: "2026-07-10",
        description: "Supermercado",
        notes: "   ",
      }).success,
    ).toBe(true);

    expect(
      createTransactionApiSchema.safeParse({
        type: "expense",
        categoryId: SAMPLE_UUID,
        amountCents: 0,
        occurredOn: "2026-07-10",
        description: "Cero",
      }).success,
    ).toBe(false);

    expect(
      transactionQuerySchema.safeParse({
        from: "2026-07-20",
        to: "2026-07-01",
      }).success,
    ).toBe(false);
  });

  it("validates budget and reports schemas", () => {
    expect(
      createBudgetApiSchema.safeParse({
        categoryId: SAMPLE_UUID,
        month: "2026-07",
        limitCents: 15_000,
        alertThresholdPct: 80,
      }).success,
    ).toBe(true);

    expect(
      createBudgetApiSchema.safeParse({
        categoryId: SAMPLE_UUID,
        month: "2026-13",
        limitCents: 15_000,
        alertThresholdPct: 40,
      }).success,
    ).toBe(false);

    expect(updateBudgetApiSchema.safeParse({}).success).toBe(false);

    expect(
      reportsQuerySchema.safeParse({ from: "2026-07-01" }).success,
    ).toBe(false);
    expect(
      reportsQuerySchema.safeParse({
        from: "2026-07-01",
        to: "2026-07-31",
      }).success,
    ).toBe(true);
    expect(
      exportQuerySchema.safeParse({
        period: "2026-07",
        type: "expense",
      }).success,
    ).toBe(true);
  });

  it("computes exact dashboard/report aggregations without precision loss above MAX_SAFE_INTEGER", () => {
    const incomeCat: Category = {
      id: "cat-inc",
      name: "Salario",
      type: "income",
      color: "#059669",
      icon: "briefcase",
      isDefault: true,
    };
    const expenseCat: Category = {
      id: "cat-exp",
      name: "Alimentación",
      type: "expense",
      color: "#D97706",
      icon: "utensils",
      isDefault: true,
    };

    // 11 income entries at MAX_SAFE_CENTS -> 9,900,000,000,000,000 cents (> Number.MAX_SAFE_INTEGER)
    const txs: TransactionWithCategory[] = Array.from({ length: 11 }, (_, i) => ({
      id: `tx-inc-${i}`,
      categoryId: incomeCat.id,
      category: incomeCat,
      type: "income",
      amountCents: MAX_SAFE_CENTS,
      occurredOn: "2026-07-05",
      description: `Ingreso ${i}`,
    }));

    txs.push({
      id: "tx-exp-1",
      categoryId: expenseCat.id,
      category: expenseCat,
      type: "expense",
      amountCents: 12_000,
      occurredOn: "2026-07-10",
      description: "Compra",
    });

    const totals = computeExactWindowTotals(txs, {
      start: "2026-07-01",
      endExclusive: "2026-08-01",
    });

    expect(totals.income).toBe(BigInt(MAX_SAFE_CENTS) * BigInt(11));
    expect(totals.expense).toBe(BigInt(12_000));
    expect(totals.net).toBe(
      BigInt(MAX_SAFE_CENTS) * BigInt(11) - BigInt(12_000),
    );

    const series = buildExactMonthlySeries(txs, "2026-06", "2026-07");
    expect(series).toHaveLength(2);
    expect(series[0].incomeCents).toBe("0");
    expect(series[1].incomeCents).toBe("9900000000000000");
    expect(series[1].expenseCents).toBe("12000");

    const breakdown = buildExactExpenseBreakdown(txs, {
      start: "2026-07-01",
      endExclusive: "2026-08-01",
    });
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].amountCents).toBe("12000");
    expect(breakdown[0].percentage).toBe(100);
  });
});
