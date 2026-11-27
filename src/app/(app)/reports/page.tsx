import type { Metadata } from "next";
import { ReportsClient } from "@/components/reports/reports-client";
import { getRecentMonthOptions, resolvePeriodRange } from "@/lib/dates";
import { listCategoriesWithUsage } from "@/services/categories.service";
import { getReportsData } from "@/services/reports.service";
import type { ReportsPayload } from "@/types/domain";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Análisis financiero mensual y exportación CSV en FinTrack.",
};

export default async function ReportsPage() {
  const defaultResolved = resolvePeriodRange("last_6_months");
  const emptyReport: ReportsPayload = {
    period: defaultResolved.periodKey,
    periodLabel: defaultResolved.label,
    range: {
      start: defaultResolved.start,
      endInclusive: defaultResolved.endInclusive,
      endExclusive: defaultResolved.endExclusive,
    },
    previousRange: defaultResolved.previousRange
      ? {
          start: defaultResolved.previousRange.start,
          endInclusive: defaultResolved.previousRange.endInclusive,
        }
      : null,
    summary: {
      incomeCents: "0",
      expenseCents: "0",
      netCents: "0",
      transactionCount: 0,
    },
    comparisons: {
      income: null,
      expense: null,
      net: null,
    },
    monthlySeries: [],
    expenseBreakdown: [],
  };

  const [reportResult, categories] = await Promise.all([
    getReportsData({ period: "last_6_months" }).then(
      (data) => ({ ok: true as const, data }),
      () => ({
        ok: false as const,
        message:
          "No fue posible generar tus reportes financieros desde el servidor. Intenta nuevamente.",
      }),
    ),
    listCategoriesWithUsage().catch(() => []),
  ]);

  const monthOptions = getRecentMonthOptions(6);

  return (
    <ReportsClient
      initialData={reportResult.ok ? reportResult.data : emptyReport}
      initialError={reportResult.ok ? null : reportResult.message}
      categories={categories}
      monthOptions={monthOptions}
    />
  );
}
