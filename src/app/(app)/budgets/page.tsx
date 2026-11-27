import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatMonthLabel, getCurrentMonthKey } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Presupuestos",
  description: "Control mensual de presupuestos por categoría en FinTrack.",
};

export default function BudgetsPage() {
  const monthLabel = formatMonthLabel(getCurrentMonthKey());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description={`Límites mensuales por categoría de gasto para ${monthLabel.toLowerCase()}.`}
      />

      <EmptyState
        icon={Target}
        title="Aún no tienes presupuestos configurados"
        description="Los presupuestos mensuales se asociarán exclusivamente a tus categorías de gastos y calcularán el avance real de forma automática en la Fase 04."
        action={
          <Link
            href="/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            Explorar categorías de gasto
          </Link>
        }
      />
    </div>
  );
}
