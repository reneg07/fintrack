"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/shared/category-icon";
import { DemoNotice } from "@/components/shared/demo-notice";
import {
  CashflowBarChart,
  ExpenseCategoryChart,
} from "@/components/shared/financial-chart";
import { KpiCard } from "@/components/shared/kpi-card";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateShort, formatMonthLabel } from "@/lib/dates";
import {
  DEMO_ACTIVE_MONTH,
  DEMO_MONTHS,
  getDemoExpenseBreakdown,
  getDemoMonthlyCashflowSeries,
  getDemoPeriodMetrics,
  type DemoMonth,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type PeriodOption = DemoMonth | "all";

const PERIOD_LABELS: Record<PeriodOption, string> = {
  "2026-11": formatMonthLabel("2026-11"),
  "2026-10": formatMonthLabel("2026-10"),
  "2026-09": formatMonthLabel("2026-09"),
  all: "Últimos 3 meses",
};

export function DashboardView() {
  const [period, setPeriod] = useState<PeriodOption>(DEMO_ACTIVE_MONTH);

  const metrics = getDemoPeriodMetrics(period);
  const cashflowSeries = getDemoMonthlyCashflowSeries();
  const expenseBreakdown = getDemoExpenseBreakdown(period);
  const periodLabel = PERIOD_LABELS[period];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen financiero"
        description={`Panorama consolidado para ${periodLabel.toLowerCase()} en dólares estadounidenses (USD).`}
        actions={
          <>
            <Select
              value={period}
              onValueChange={(value) => {
                if (value) setPeriod(value as PeriodOption);
              }}
            >
              <SelectTrigger
                aria-label="Seleccionar período"
                className="h-9 min-w-[175px] bg-card"
              >
                <SelectValue>{periodLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {[...DEMO_MONTHS].reverse().map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthLabel(month)}
                  </SelectItem>
                ))}
                <SelectItem value="all">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>

            <Link
              href="/transactions"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-9 px-3.5",
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nueva transacción
            </Link>
          </>
        }
      />

      <DemoNotice />

      {/* KPI Grid */}
      <section
        aria-label="Indicadores financieros principales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Balance acumulado"
          amountCents={metrics.accumulatedBalanceCents}
          tone="neutral"
          icon={Landmark}
          accent="dark"
          helperText="Saldo histórico neto de todos los períodos"
        />
        <KpiCard
          label="Ingresos del período"
          amountCents={metrics.periodIncomeCents}
          tone="income"
          icon={ArrowDownLeft}
          accent="emerald"
          helperText={`Total percibido en ${periodLabel.toLowerCase()}`}
        />
        <KpiCard
          label="Gastos del período"
          amountCents={metrics.periodExpenseCents}
          tone="expense"
          icon={ArrowUpRight}
          accent="danger"
          helperText={`Total egresado en ${periodLabel.toLowerCase()}`}
        />
        <KpiCard
          label="Flujo de efectivo"
          amountCents={metrics.cashflowCents}
          tone="auto"
          showSign
          icon={TrendingUp}
          accent={metrics.cashflowCents >= 0 ? "emerald" : "danger"}
          helperText={`${metrics.transactionCount} movimientos en el período`}
        />
      </section>

      {/* Charts */}
      <section
        aria-label="Gráficos financieros"
        className="grid gap-5 xl:grid-cols-2"
      >
        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Ingresos vs. Gastos
              </CardTitle>
              <CardDescription>
                Comparativa mensual del trimestre de demostración
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-brand-primary"
                />
                Ingresos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-danger"
                />
                Gastos
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <CashflowBarChart data={cashflowSeries} />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Distribución de gastos por categoría
            </CardTitle>
            <CardDescription>
              Proporción del gasto en {periodLabel.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ExpenseCategoryChart data={expenseBreakdown} />
          </CardContent>
        </Card>
      </section>

      {/* Recent Transactions */}
      <Card className="border-border/80 bg-card shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Transacciones recientes
            </CardTitle>
            <CardDescription>
              Últimos movimientos registrados en {periodLabel.toLowerCase()}
            </CardDescription>
          </div>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-success-text hover:underline"
          >
            Ver todas
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/80">
            {metrics.recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryIcon
                    icon={tx.category.icon}
                    color={tx.category.color}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.description}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{tx.category.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateShort(tx.occurredOn)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <Badge
                    variant="secondary"
                    className="hidden text-[11px] font-medium sm:inline-flex"
                  >
                    {tx.type === "income" ? "Ingreso" : "Gasto"}
                  </Badge>
                  <MoneyDisplay
                    cents={tx.amountCents}
                    tone={tx.type === "income" ? "income" : "expense"}
                    className="text-sm font-semibold"
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
