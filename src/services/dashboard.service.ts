import "server-only";

import { resolvePeriodRange } from "@/lib/dates";
import {
  buildExactExpenseBreakdown,
  buildExactMonthlySeries,
  computeExactWindowTotals,
  isInDateWindow,
} from "@/lib/financial-aggregations";
import { serializeExactCents } from "@/lib/money";
import { requireAuthenticatedContext } from "@/services/_auth";
import { fetchAllUserTransactions } from "@/services/transactions.service";
import type { DashboardPayload } from "@/types/domain";

/**
 * Computes the complete real financial dashboard for the authenticated user.
 * - `accumulatedBalanceCents` is ALWAYS computed across ALL historical user transactions
 *   (independent of the selected period).
 * - Period KPIs, expense breakdown, and the 5 recent transactions reflect the selected period.
 * - Monthly series covers `chartStartMonth..chartEndMonth` with exact BigInt sums.
 */
export async function getDashboardData(
  periodParam = "current_month",
): Promise<DashboardPayload> {
  const { supabase } = await requireAuthenticatedContext();
  const resolved = resolvePeriodRange(periodParam);

  const { transactions } = await fetchAllUserTransactions(supabase);

  const historicalTotals = computeExactWindowTotals(transactions);
  const window = {
    start: resolved.start,
    endExclusive: resolved.endExclusive,
  };
  const periodTotals = computeExactWindowTotals(transactions, window);

  const monthlySeries = buildExactMonthlySeries(
    transactions,
    resolved.chartStartMonth,
    resolved.chartEndMonth,
  );

  const expenseBreakdown = buildExactExpenseBreakdown(transactions, window);

  const recentTransactions = transactions
    .filter((tx) => isInDateWindow(tx.occurredOn, window))
    .slice(0, 5);

  return {
    period: resolved.periodKey,
    periodLabel: resolved.label,
    periodDescription: resolved.description,
    range: {
      start: resolved.start,
      endExclusive: resolved.endExclusive,
      endInclusive: resolved.endInclusive,
    },
    kpis: {
      accumulatedBalanceCents: serializeExactCents(historicalTotals.net),
      periodIncomeCents: serializeExactCents(periodTotals.income),
      periodExpenseCents: serializeExactCents(periodTotals.expense),
      periodNetCents: serializeExactCents(periodTotals.net),
      periodTransactionCount: periodTotals.count,
      totalTransactionCount: historicalTotals.count,
    },
    monthlySeries,
    expenseBreakdown,
    recentTransactions,
  };
}
