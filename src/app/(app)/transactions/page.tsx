import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Transacciones",
  description: "Gestión de ingresos y gastos en FinTrack.",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacciones"
        description="Registra, busca y filtra tus ingresos y gastos en dólares estadounidenses (USD)."
      />

      <EmptyState
        icon={ArrowLeftRight}
        title="Aún no tienes transacciones registradas"
        description="Tu cuenta comienza limpia sin datos ficticios. El registro, edición, eliminación y búsqueda de movimientos contra PostgreSQL mediante Route Handlers se habilitarán en la Fase 04."
        action={
          <Link
            href="/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            Ver tus categorías disponibles
          </Link>
        }
      />
    </div>
  );
}
