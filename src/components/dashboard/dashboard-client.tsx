"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Landmark,
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ExactCashflowBarChart,
  ExactExpenseCategoryChart,
  ExactNetFlowAreaChart,
} from "@/components/shared/financial-chart";
import { KpiCard } from "@/components/shared/kpi-card";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateShort } from "@/lib/dates";
import type { DashboardPayload } from "@/types/domain";

interface DashboardClientProps {
  initialData: DashboardPayload;
  firstName: string;
  monthOptions: Array<{ value: string; label: string }>;
}

export function DashboardClient({
  initialData,
  firstName,
  monthOptions,
}: DashboardClientProps) {
  const [period, setPeriod] = useState(initialData.period);
  const [data, setData] = useState<DashboardPayload>(initialData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = `${period}|${reloadToken}`;
  const [settledKey, setSettledKey] = useState(requestKey);
  const isLoading = settledKey !== requestKey;

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const controller = new AbortController();

    fetch(`/api/dashboard?period=${encodeURIComponent(period)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json()) as {
          data: DashboardPayload | null;
          error: { message: string } | null;
        };
        if (!res.ok || !body.data) {
          throw new Error(
            body.error?.message ??
              "No fue posible actualizar el resumen financiero.",
          );
        }
        setFetchError(null);
        setData(body.data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setFetchError(
          err instanceof Error
            ? err.message
            : "Error al cargar el resumen financiero.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSettledKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [period, requestKey]);

  const hasSeriesActivity = data.monthlySeries.some(
    (point) => point.incomeCents !== "0" || point.expenseCents !== "0",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Resumen financiero"}
        description={`${data.periodDescription} · Moneda USD (America/El_Salvador).`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="dashboard-period" className="sr-only">
                Período del dashboard
              </Label>
              <select
                id="dashboard-period"
                aria-label="Seleccionar período del resumen"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="flex h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <optgroup label="Períodos predefinidos">
                  <option value="current_month">Mes actual</option>
                  <option value="last_3_months">Últimos 3 meses</option>
                  <option value="last_6_months">Últimos 6 meses</option>
                  <option value="current_year">Año en curso</option>
                </optgroup>
                <optgroup label="Meses específicos">
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <Link
              href="/transactions?new=1"
              className={buttonVariants({ variant: "default" })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nueva transacción
            </Link>
          </div>
        }
      />

      {fetchError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger-text"
        >
          <span>{fetchError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setReloadToken((n) => n + 1)}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <section
          aria-label="Indicadores financieros principales"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <KpiCard
            label="Balance acumulado"
            amountCents={data.kpis.accumulatedBalanceCents}
            tone="neutral"
            icon={Landmark}
            accent="dark"
            helperText={`Histórico total (${data.kpis.totalTransactionCount} mov., independiente del período)`}
          />
          <KpiCard
            label="Ingresos del período"
            amountCents={data.kpis.periodIncomeCents}
            tone="income"
            icon={ArrowDownLeft}
            accent="emerald"
            helperText={data.periodLabel}
          />
          <KpiCard
            label="Gastos del período"
            amountCents={data.kpis.periodExpenseCents}
            tone="expense"
            icon={ArrowUpRight}
            accent="danger"
            helperText={data.periodLabel}
          />
          <KpiCard
            label="Flujo neto del período"
            amountCents={data.kpis.periodNetCents}
            tone="auto"
            showSign
            icon={TrendingUp}
            accent="default"
            helperText={`${data.kpis.periodTransactionCount} ${data.kpis.periodTransactionCount === 1 ? "movimiento" : "movimientos"} en el período`}
          />
        </section>
      )}

      {/* Empty account onboarding state */}
      {!isLoading && data.kpis.totalTransactionCount === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Tu cuenta está lista — aún no hay movimientos registrados"
          description="Registra tu primer ingreso o gasto para ver tu balance real, gráficos interactivos y el progreso de tus presupuestos."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/transactions?new=1"
                className={buttonVariants({ variant: "default" })}
              >
                Registrar primera transacción
              </Link>
              <Link
                href="/budgets"
                className={buttonVariants({ variant: "outline" })}
              >
                Configurar presupuestos
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="border-border/80 bg-card shadow-none xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Ingresos vs. gastos mensuales
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Evolución comparativa en USD durante los meses del gráfico.
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-[280px] w-full rounded-lg" />
                ) : hasSeriesActivity ? (
                  <ExactCashflowBarChart
                    data={data.monthlySeries}
                    height={280}
                  />
                ) : (
                  <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                    <BarChart3
                      className="mb-2 size-7 opacity-40"
                      aria-hidden="true"
                    />
                    <p>Sin movimientos en el rango de meses graficado.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Gastos por categoría
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Distribución real para {data.periodLabel.toLowerCase()}.
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full rounded-lg" />
                ) : data.expenseBreakdown.length > 0 ? (
                  <ExactExpenseCategoryChart
                    data={data.expenseBreakdown}
                    height={220}
                  />
                ) : (
                  <div className="flex h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
                    <PieChartIcon
                      className="mb-2 size-7 opacity-40"
                      aria-hidden="true"
                    />
                    <p>Sin gastos registrados en {data.periodLabel.toLowerCase()}.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Net Cashflow + Recent Transactions Row */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/80 bg-card shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Evolución del flujo neto
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Diferencia mensual entre ingresos y gastos.
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full rounded-lg" />
                ) : hasSeriesActivity ? (
                  <ExactNetFlowAreaChart
                    data={data.monthlySeries}
                    height={240}
                  />
                ) : (
                  <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    Sin actividad en este rango.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card shadow-none">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Movimientos recientes
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Últimas 5 transacciones de {data.periodLabel.toLowerCase()}.
                  </p>
                </div>
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                >
                  Ver todas
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : data.recentTransactions.length === 0 ? (
                  <div className="flex h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay transacciones en {data.periodLabel.toLowerCase()}.
                    </p>
                    <Link
                      href="/transactions?new=1"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Registrar movimiento
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {data.recentTransactions.map((tx) => (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <CategoryIcon
                            icon={tx.category.icon}
                            color={tx.category.color}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {tx.description}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {tx.category.name} ·{" "}
                              {formatDateShort(tx.occurredOn)}
                            </p>
                          </div>
                        </div>
                        <MoneyDisplay
                          cents={tx.amountCents}
                          tone={tx.type === "income" ? "income" : "expense"}
                          className="shrink-0 text-sm font-semibold"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
