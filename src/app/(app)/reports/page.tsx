import type { Metadata } from "next";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Análisis financiero mensual y exportación CSV en FinTrack.",
};

export default function ReportsPage() {
  return <ReportsView />;
}
