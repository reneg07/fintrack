import type { Metadata } from "next";
import { BudgetsView } from "@/components/budgets/budgets-view";

export const metadata: Metadata = {
  title: "Presupuestos",
  description: "Control mensual de presupuestos por categoría en FinTrack.",
};

export default function BudgetsPage() {
  return <BudgetsView />;
}
