import { enumerateMonths, formatShortMonthLabel } from "@/lib/dates";
import {
  calculateExactBudgetPercentage,
  exactCentsToChartNumber,
  parseExactCents,
  serializeExactCents,
} from "@/lib/money";
import type {
  ExactCategoryExpensePoint,
  ExactMonthlyCashflowPoint,
  TransactionWithCategory,
} from "@/types/domain";

const ZERO = BigInt(0);

export interface DateWindow {
  start: string; // inclusive YYYY-MM-DD
  endExclusive: string; // exclusive YYYY-MM-DD
}

export function isInDateWindow(occurredOn: string, window: DateWindow): boolean {
  return occurredOn >= window.start && occurredOn < window.endExclusive;
}

export function computeExactWindowTotals(
  transactions: readonly TransactionWithCategory[],
  window?: DateWindow,
): {
  income: bigint;
  expense: bigint;
  net: bigint;
  count: number;
} {
  let income = ZERO;
  let expense = ZERO;
  let count = 0;

  for (const tx of transactions) {
    if (window && !isInDateWindow(tx.occurredOn, window)) {
      continue;
    }
    const amount = parseExactCents(tx.amountCents);
    if (tx.type === "income") {
      income += amount;
    } else {
      expense += amount;
    }
    count += 1;
  }

  return {
    income,
    expense,
    net: income - expense,
    count,
  };
}

export function buildExactMonthlySeries(
  transactions: readonly TransactionWithCategory[],
  startMonth: string,
  endMonth: string,
): ExactMonthlyCashflowPoint[] {
  const months = enumerateMonths(startMonth, endMonth);
  const buckets = new Map<string, { income: bigint; expense: bigint }>();

  for (const m of months) {
    buckets.set(m, { income: ZERO, expense: ZERO });
  }

  for (const tx of transactions) {
    const monthKey = tx.occurredOn.slice(0, 7);
    const bucket = buckets.get(monthKey);
    if (!bucket) continue;
    const amount = parseExactCents(tx.amountCents);
    if (tx.type === "income") {
      bucket.income += amount;
    } else {
      bucket.expense += amount;
    }
  }

  return months.map((month) => {
    const bucket = buckets.get(month) ?? { income: ZERO, expense: ZERO };
    const net = bucket.income - bucket.expense;
    return {
      month,
      label: formatShortMonthLabel(month),
      incomeCents: serializeExactCents(bucket.income),
      expenseCents: serializeExactCents(bucket.expense),
      netCents: serializeExactCents(net),
      chartIncome: exactCentsToChartNumber(bucket.income),
      chartExpense: exactCentsToChartNumber(bucket.expense),
      chartNet: exactCentsToChartNumber(net),
    };
  });
}

export function buildExactExpenseBreakdown(
  transactions: readonly TransactionWithCategory[],
  window: DateWindow,
): ExactCategoryExpensePoint[] {
  const byCategory = new Map<
    string,
    {
      categoryId: string;
      name: string;
      color: string;
      icon: TransactionWithCategory["category"]["icon"];
      amount: bigint;
    }
  >();

  let totalExpense = ZERO;

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (!isInDateWindow(tx.occurredOn, window)) continue;

    const amount = parseExactCents(tx.amountCents);
    totalExpense += amount;

    const existing = byCategory.get(tx.categoryId);
    if (existing) {
      existing.amount += amount;
    } else {
      byCategory.set(tx.categoryId, {
        categoryId: tx.categoryId,
        name: tx.category.name,
        color: tx.category.color,
        icon: tx.category.icon,
        amount,
      });
    }
  }

  if (totalExpense <= ZERO) {
    return [];
  }

  return Array.from(byCategory.values())
    .sort((a, b) => {
      if (b.amount > a.amount) return 1;
      if (b.amount < a.amount) return -1;
      return a.name.localeCompare(b.name, "es");
    })
    .map((entry) => ({
      categoryId: entry.categoryId,
      name: entry.name,
      color: entry.color,
      icon: entry.icon,
      amountCents: serializeExactCents(entry.amount),
      percentage: calculateExactBudgetPercentage(entry.amount, totalExpense),
      chartAmount: exactCentsToChartNumber(entry.amount),
    }));
}
