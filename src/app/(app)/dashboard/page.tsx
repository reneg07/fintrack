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
  const emptyDashboard: DashboardPayload = {
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

  const [profile, initialData] = await Promise.all([
    getAuthenticatedProfile(),
    getDashboardData("current_month").catch(() => emptyDashboard),
  ]);

  const firstName = profile?.fullName.split(" ")[0] ?? "";
  const monthOptions = getRecentMonthOptions(6);

  return (
    <DashboardClient
      initialData={initialData}
      firstName={firstName}
      monthOptions={monthOptions}
    />
  );
}
