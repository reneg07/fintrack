import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Landmark,
  Tags,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatMonthLabel, getCurrentMonthKey } from "@/lib/dates";
import { getUserCategories } from "@/services/categories.service";
import { getAuthenticatedProfile } from "@/services/profile.service";

export const metadata: Metadata = {
  title: "Resumen",
  description: "Panel financiero principal de FinTrack.",
};

export default async function DashboardPage() {
  const [profile, categories] = await Promise.all([
    getAuthenticatedProfile(),
    getUserCategories(),
  ]);

  const currentMonthLabel = formatMonthLabel(getCurrentMonthKey());
  const firstName = profile?.fullName.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Resumen financiero"}
        description={`Panorama de tu cuenta para ${currentMonthLabel.toLowerCase()} en dólares estadounidenses (USD).`}
        actions={
          <Link
            href="/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            <Tags className="size-4" aria-hidden="true" />
            Ver tus {categories.length} categorías
          </Link>
        }
      />

      <section
        aria-label="Indicadores financieros iniciales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Balance acumulado"
          amountCents={0}
          tone="neutral"
          icon={Landmark}
          accent="dark"
          helperText="Sin movimientos registrados todavía"
        />
        <KpiCard
          label="Ingresos del mes"
          amountCents={0}
          tone="income"
          icon={ArrowDownLeft}
          accent="emerald"
          helperText={currentMonthLabel}
        />
        <KpiCard
          label="Gastos del mes"
          amountCents={0}
          tone="expense"
          icon={ArrowUpRight}
          accent="danger"
          helperText={currentMonthLabel}
        />
        <KpiCard
          label="Flujo de efectivo"
          amountCents={0}
          tone="neutral"
          icon={TrendingUp}
          accent="default"
          helperText="0 movimientos en el período"
        />
      </section>

      <EmptyState
        icon={BarChart3}
        title="Tu cuenta está lista — aún no hay movimientos registrados"
        description="Tu perfil y tus categorías iniciales ya están protegidos en Supabase. El registro de transacciones, presupuestos mensuales y gráficos conectados a datos reales se habilitarán en la Fase 04."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/categories"
              className={buttonVariants({ variant: "default" })}
            >
              Revisar categorías iniciales
            </Link>
            <Link
              href="/settings"
              className={buttonVariants({ variant: "outline" })}
            >
              Administrar perfil
            </Link>
          </div>
        }
      />
    </div>
  );
}
