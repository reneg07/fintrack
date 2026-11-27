import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Análisis financiero mensual y exportación CSV en FinTrack.",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Comparaciones mensuales, evolución de ingresos y gastos y exportación CSV."
      />

      <EmptyState
        icon={BarChart3}
        title="Sin datos suficientes para generar reportes"
        description="Cuando registres tus movimientos en la Fase 04, aquí verás comparaciones mensuales, evolución del flujo neto y la descarga de transacciones en formato CSV sanitizado."
        action={
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Volver al resumen
          </Link>
        }
      />
    </div>
  );
}
