import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import {
  getRecentMonthOptions,
  resolvePeriodRange,
} from "@/lib/dates";
import { getDashboardData } from "@/services/dashboard.service";
import { getAuthenticatedProfile } from "@/services/profile.service";
import type { DashboardPayload } from "@/types/domain";

export const metadata: Metadata = {
  title: "Resumen",
  description: "Panel financiero principal de FinTrack.",
};

export default async function DashboardPage() {
  const defaultResolved = resolvePeriodRange("current_month");
  const fallbackDashboard: DashboardPayload = {
    period: defaultResolved.periodKey,
    periodLabel: defaultResolved.label,
    periodDescription: defaultResolved.description,
    range: {
      start: defaultResolved.start,
      endExclusive: defaultResolved.endExclusive,
      endInclusive: defaultResolved.endInclusive,
    },
    kpis: {
      accumulatedBalanceCents: "0",
      periodIncomeCents: "0",
      periodExpenseCents: "0",
      periodNetCents: "0",
      periodTransactionCount: 0,
      totalTransactionCount: 0,
    },
    monthlySeries: [],
    expenseBreakdown: [],
    recentTransactions: [],
  };

  let initialData: DashboardPayload = fallbackDashboard;
  let initialError: string | null = null;

  const [profile, dashResult] = await Promise.all([
    getAuthenticatedProfile(),
    getDashboardData("current_month").then(
      (data) => ({ ok: true as const, data }),
      () => ({
        ok: false as const,
        message:
          "No fue posible cargar tu resumen financiero desde el servidor. Intenta nuevamente.",
      }),
    ),
  ]);

  if (dashResult.ok) {
    initialData = dashResult.data;
  } else {
    initialError = dashResult.message;
  }

  const firstName = profile?.fullName.split(" ")[0] ?? "";
  const monthOptions = getRecentMonthOptions(6);

  return (
    <DashboardClient
      initialData={initialData}
      initialError={initialError}
      firstName={firstName}
      monthOptions={monthOptions}
    />
  );
}
