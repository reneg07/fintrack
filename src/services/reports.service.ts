import "server-only";

import { buildTransactionsCsv } from "@/lib/csv";
import {
  addCalendarDays,
  formatDateShort,
  getCurrentDateInElSalvador,
  resolvePeriodRange,
} from "@/lib/dates";
import {
  buildExactExpenseBreakdown,
  buildExactMonthlySeries,
  computeExactWindowTotals,
} from "@/lib/financial-aggregations";
import {
  calculateComparisonPercentage,
  serializeExactCents,
} from "@/lib/money";
import { requireAuthenticatedContext } from "@/services/_auth";
import {
  fetchAllUserTransactions,
  type TransactionFilterOptions,
} from "@/services/transactions.service";
import type {
  PeriodComparisonMetric,
  ReportsPayload,
  TransactionType,
} from "@/types/domain";

function buildComparison(
  current: bigint,
  previous: bigint,
): PeriodComparisonMetric {
  return {
    currentCents: serializeExactCents(current),
    previousCents: serializeExactCents(previous),
    deltaCents: serializeExactCents(current - previous),
    changePct: calculateComparisonPercentage(current, previous),
  };
}

function diffCalendarDaysInclusive(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const startMs = Date.UTC(fy, fm - 1, fd);
  const endMs = Date.UTC(ty, tm - 1, td);
  return Math.round((endMs - startMs) / 86_400_000) + 1;
}

export interface ReportsInput {
  period?: string;
  from?: string;
  to?: string;
}

/**
 * Generates exact financial reports using the same BigInt aggregation engine as Dashboard.
 * Supports standardized periods (`current_month`, `last_3_months`, `last_6_months`,
 * `current_year`, `YYYY-MM`) as well as inclusive custom calendar ranges (`from`..`to`).
 */
export async function getReportsData(
  input?: ReportsInput,
): Promise<ReportsPayload> {
  const { supabase } = await requireAuthenticatedContext();

  let periodKey: string;
  let periodLabel: string;
  let start: string;
  let endInclusive: string;
  let endExclusive: string;
  let chartStartMonth: string;
  let chartEndMonth: string;
  let previousRange: {
    start: string;
    endInclusive: string;
    endExclusive: string;
  } | null = null;

  if (input?.from && input?.to) {
    periodKey = "custom";
    periodLabel = `${formatDateShort(input.from)} – ${formatDateShort(input.to)}`;
    start = input.from;
    endInclusive = input.to;
    endExclusive = addCalendarDays(input.to, 1);
    chartStartMonth = input.from.slice(0, 7);
    chartEndMonth = input.to.slice(0, 7);

    const spanDays = diffCalendarDaysInclusive(input.from, input.to);
    const prevEndInclusive = addCalendarDays(input.from, -1);
    const prevStart = addCalendarDays(input.from, -spanDays);
    previousRange = {
      start: prevStart,
      endInclusive: prevEndInclusive,
      endExclusive: input.from,
    };
  } else {
    const resolved = resolvePeriodRange(input?.period ?? "last_6_months");
    periodKey = resolved.periodKey;
    periodLabel = resolved.label;
    start = resolved.start;
    endInclusive = resolved.endInclusive;
    endExclusive = resolved.endExclusive;
    chartStartMonth = resolved.chartStartMonth;
    chartEndMonth = resolved.chartEndMonth;
    previousRange = resolved.previousRange;
  }

  // Compute widest date boundary needed across current window, chart months, and previous comparison window
  const candidatesStart = [start, `${chartStartMonth}-01`];
  if (previousRange) candidatesStart.push(previousRange.start);
  candidatesStart.sort();
  const minFetchDate = candidatesStart[0];

  const { transactions } = await fetchAllUserTransactions(supabase, {
    from: minFetchDate,
    to: endInclusive,
  });

  const currentWindow = { start, endExclusive };
  const currentTotals = computeExactWindowTotals(transactions, currentWindow);

  const previousTotals = previousRange
    ? computeExactWindowTotals(transactions, {
        start: previousRange.start,
        endExclusive: previousRange.endExclusive,
      })
    : null;

  const monthlySeries = buildExactMonthlySeries(
    transactions,
    chartStartMonth,
    chartEndMonth,
  );

  const expenseBreakdown = buildExactExpenseBreakdown(
    transactions,
    currentWindow,
  );

  return {
    period: periodKey,
    periodLabel,
    range: {
      start,
      endInclusive,
      endExclusive,
    },
    previousRange: previousRange
      ? {
          start: previousRange.start,
          endInclusive: previousRange.endInclusive,
        }
      : null,
    summary: {
      incomeCents: serializeExactCents(currentTotals.income),
      expenseCents: serializeExactCents(currentTotals.expense),
      netCents: serializeExactCents(currentTotals.net),
      transactionCount: currentTotals.count,
    },
    comparisons: {
      income: previousTotals
        ? buildComparison(currentTotals.income, previousTotals.income)
        : null,
      expense: previousTotals
        ? buildComparison(currentTotals.expense, previousTotals.expense)
        : null,
      net: previousTotals
        ? buildComparison(currentTotals.net, previousTotals.net)
        : null,
    },
    monthlySeries,
    expenseBreakdown,
  };
}

export interface CsvExportInput {
  period?: string;
  from?: string;
  to?: string;
  type?: "all" | TransactionType;
  categoryId?: string;
  q?: string;
}

/**
 * Exports ALL matching authenticated user transactions as a UTF-8 BOM, RFC 4180 CSV
 * sanitized against Formula Injection. Never truncates at pagination limits.
 */
export async function exportTransactionsCsv(input?: CsvExportInput): Promise<{
  csvContent: string;
  filename: string;
  count: number;
}> {
  const { supabase } = await requireAuthenticatedContext();

  let from = input?.from;
  let to = input?.to;

  if (!from && !to && input?.period) {
    const resolved = resolvePeriodRange(input.period);
    from = resolved.start;
    to = resolved.endInclusive;
  }

  const filters: TransactionFilterOptions = {
    from,
    to,
    type: input?.type ?? "all",
    categoryId: input?.categoryId ?? "all",
    q: input?.q,
  };

  const { transactions } = await fetchAllUserTransactions(supabase, filters);

  const csvContent = buildTransactionsCsv(
    transactions.map((tx) => ({
      occurredOn: tx.occurredOn,
      type: tx.type,
      categoryName: tx.category.name,
      description: tx.description,
      notes: tx.notes,
      amountCents: tx.amountCents,
    })),
  );

  const today = getCurrentDateInElSalvador();
  return {
    csvContent,
    filename: `fintrack-transacciones-${today}.csv`,
    count: transactions.length,
  };
}
