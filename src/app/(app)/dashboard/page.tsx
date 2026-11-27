import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Resumen",
  description: "Panel financiero principal de FinTrack.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
