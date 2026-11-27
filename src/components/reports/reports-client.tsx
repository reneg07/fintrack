"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Download,
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ExactCashflowBarChart,
  ExactExpenseCategoryChart,
  ExactNetFlowAreaChart,
} from "@/components/shared/financial-chart";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateShort } from "@/lib/dates";
import { formatExactCurrency } from "@/lib/money";
import type {
  CategoryWithUsage,
  PeriodComparisonMetric,
  ReportsPayload,
  TransactionType,
} from "@/types/domain";

interface ReportsClientProps {
  initialData: ReportsPayload;
  categories: CategoryWithUsage[];
  monthOptions: Array<{ value: string; label: string }>;
}

function renderComparisonBadge(
  metric: PeriodComparisonMetric | null,
  invertColors = false,
) {
  if (!metric) return null;
  if (metric.changePct === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Sin base previa
      </Badge>
    );
  }

  const isPositive = metric.changePct > 0;
  const isZero = metric.changePct === 0;
  const good = invertColors ? !isPositive : isPositive;

  return (
    <Badge
      variant="outline"
      className={
        isZero
          ? "text-muted-foreground"
          : good
            ? "border-emerald-200 bg-emerald-50 text-success-text"
            : "border-red-200 bg-red-50 text-danger-text"
      }
    >
      {metric.changePct > 0 ? "+" : ""}
      {metric.changePct.toFixed(1)}% vs. período anterior
    </Badge>
  );
}

export function ReportsClient({
  initialData,
  categories,
  monthOptions,
}: ReportsClientProps) {
  const [period, setPeriod] = useState(initialData.period);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [fromDate, setFromDate] = useState(initialData.range.start);
  const [toDate, setToDate] = useState(initialData.range.endInclusive);

  // Additional export-only filters
  const [exportType, setExportType] = useState<"all" | TransactionType>("all");
  const [exportCategoryId, setExportCategoryId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const [data, setData] = useState<ReportsPayload>(initialData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const isFirstRender = useRef(true);

  const customRangeError = useMemo(() => {
    if (!useCustomRange) return null;
    if (!fromDate || !toDate) {
      return "Selecciona ambas fechas para consultar un rango personalizado.";
    }
    if (fromDate > toDate) {
      return "La fecha final no puede ser anterior a la fecha inicial.";
    }
    return null;
  }, [useCustomRange, fromDate, toDate]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (useCustomRange) {
      params.set("from", fromDate);
      params.set("to", toDate);
    } else {
      params.set("period", period);
    }
    return params.toString();
  }, [useCustomRange, fromDate, toDate, period]);

  const requestKey = `${queryString}|${reloadToken}`;
  const [settledKey, setSettledKey] = useState(requestKey);
  const isLoading = !customRangeError && settledKey !== requestKey;
  const activeError = customRangeError ?? fetchError;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (customRangeError) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/reports?${queryString}`, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as {
          data: ReportsPayload | null;
          error: { message: string } | null;
        };
        if (!res.ok || !body.data) {
          throw new Error(
            body.error?.message ?? "No fue posible actualizar el reporte.",
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
            : "Error al generar el reporte financiero.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSettledKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [customRangeError, queryString, requestKey]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (useCustomRange && fromDate && toDate && fromDate <= toDate) {
      params.set("from", fromDate);
      params.set("to", toDate);
    } else {
      params.set("period", period);
    }
    if (exportType !== "all") params.set("type", exportType);
    if (exportCategoryId !== "all") params.set("categoryId", exportCategoryId);
    return `/api/reports/export?${params.toString()}`;
  }, [
    useCustomRange,
    fromDate,
    toDate,
    period,
    exportType,
    exportCategoryId,
  ]);

  async function handleCsvExport() {
    if (customRangeError) {
      toast.error(customRangeError);
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch(exportUrl);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(
          body?.error?.message ?? "No fue posible exportar el archivo CSV.",
        );
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const filenameMatch = /filename="([^"]+)"/.exec(disposition);
      const filename = filenameMatch?.[1] ?? "fintrack-transacciones.csv";

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Archivo ${filename} descargado correctamente.`);
    } catch {
      toast.error("Error de conexión al exportar las transacciones.");
    } finally {
      setIsExporting(false);
    }
  }

  const exportCategoryOptions = useMemo(() => {
    if (exportType === "all") return categories;
    return categories.filter((c) => c.type === exportType);
  }, [categories, exportType]);

  const hasActivity = data.summary.transactionCount > 0;
  const hasSeriesActivity = data.monthlySeries.some(
    (point) => point.incomeCents !== "0" || point.expenseCents !== "0",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description={`Análisis financiero para ${data.periodLabel} (${formatDateShort(data.range.start)} – ${formatDateShort(data.range.endInclusive)}).`}
        actions={
          <Button
            type="button"
            onClick={handleCsvExport}
            disabled={isExporting || Boolean(customRangeError)}
            className="gap-1.5"
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Exportar CSV
          </Button>
        }
      />

      {/* Period & Export Controls */}
      <Card className="border-border/80 bg-card shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="report-mode" className="text-xs">
                Modo de consulta
              </Label>
              <select
                id="report-mode"
                value={useCustomRange ? "custom" : "preset"}
                onChange={(e) => setUseCustomRange(e.target.value === "custom")}
                className="flex h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="preset">Período predefinido</option>
                <option value="custom">Rango de fechas personalizado</option>
              </select>
            </div>

            {!useCustomRange ? (
              <div className="space-y-1">
                <Label htmlFor="report-period" className="text-xs">
                  Período
                </Label>
                <select
                  id="report-period"
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
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="report-from" className="text-xs">
                    Desde
                  </Label>
                  <Input
                    id="report-from"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="report-to" className="text-xs">
                    Hasta
                  </Label>
                  <Input
                    id="report-to"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="export-type" className="text-xs">
                Tipo (exportación CSV)
              </Label>
              <select
                id="export-type"
                value={exportType}
                onChange={(e) => {
                  setExportType(e.target.value as "all" | TransactionType);
                  setExportCategoryId("all");
                }}
                className="flex h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Ingresos y gastos</option>
                <option value="income">Solo ingresos</option>
                <option value="expense">Solo gastos</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="export-category" className="text-xs">
                Categoría (exportación CSV)
              </Label>
              <select
                id="export-category"
                value={exportCategoryId}
                onChange={(e) => setExportCategoryId(e.target.value)}
                className="flex h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Todas las categorías</option>
                {exportCategoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger-text"
        >
          <span>{activeError}</span>
          {!customRangeError && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReloadToken((n) => n + 1)}
            >
              Reintentar
            </Button>
          )}
        </div>
      )}

      {/* Comparison KPI Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ingresos
                </span>
                <ArrowDownLeft
                  className="size-4 text-success-text"
                  aria-hidden="true"
                />
              </div>
              <MoneyDisplay
                cents={data.summary.incomeCents}
                tone="income"
                className="block text-2xl font-semibold"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {renderComparisonBadge(data.comparisons.income, false)}
                {data.comparisons.income && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Prev:{" "}
                    {formatExactCurrency(data.comparisons.income.previousCents)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Gastos
                </span>
                <ArrowUpRight
                  className="size-4 text-danger-text"
                  aria-hidden="true"
                />
              </div>
              <MoneyDisplay
                cents={data.summary.expenseCents}
                tone="expense"
                className="block text-2xl font-semibold"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {renderComparisonBadge(data.comparisons.expense, true)}
                {data.comparisons.expense && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Prev:{" "}
                    {formatExactCurrency(
                      data.comparisons.expense.previousCents,
                    )}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Flujo neto ({data.summary.transactionCount} mov.)
                </span>
                <TrendingUp
                  className="size-4 text-brand-primary"
                  aria-hidden="true"
                />
              </div>
              <MoneyDisplay
                cents={data.summary.netCents}
                tone="auto"
                showSign
                className="block text-2xl font-semibold"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {renderComparisonBadge(data.comparisons.net, false)}
                {data.comparisons.net && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Prev:{" "}
                    {formatExactCurrency(data.comparisons.net.previousCents, {
                      showSign: true,
                    })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !hasActivity ? (
        <EmptyState
          icon={BarChart3}
          title="Sin transacciones en el período seleccionado"
          description="Registra movimientos o amplía el rango de fechas para visualizar comparativas, gráficos y la tabla mensual detallada."
          action={
            <Link
              href="/transactions?new=1"
              className={buttonVariants({ variant: "default" })}
            >
              Registrar transacción
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="border-border/80 bg-card shadow-none xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Comparativa mensual de ingresos y gastos
                </CardTitle>
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
                  <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    Sin movimientos en este rango.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Distribución de gastos
                </CardTitle>
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
                    <p>No hubo gastos en el período analizado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Tendencia del flujo neto mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : hasSeriesActivity ? (
                <ExactNetFlowAreaChart data={data.monthlySeries} height={240} />
              ) : (
                <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  Sin datos para graficar.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary Table */}
          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Resumen mensual exacto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Mes</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Gastos</TableHead>
                    <TableHead className="pr-4 text-right">
                      Flujo neto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.monthlySeries.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="pl-4 font-medium">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay
                          cents={row.incomeCents}
                          tone="income"
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay
                          cents={row.expenseCents}
                          tone="expense"
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <MoneyDisplay
                          cents={row.netCents}
                          tone="auto"
                          showSign
                          className="text-sm font-semibold"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
