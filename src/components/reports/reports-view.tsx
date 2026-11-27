"use client";

import { useState } from "react";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemoNotice } from "@/components/shared/demo-notice";
import {
  CashflowBarChart,
  ExpenseCategoryChart,
  NetFlowAreaChart,
} from "@/components/shared/financial-chart";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { formatMonthLabel } from "@/lib/dates";
import {
  DEMO_ACTIVE_MONTH,
  DEMO_MONTHS,
  getDemoExpenseBreakdown,
  getDemoMonthlyCashflowSeries,
  type DemoMonth,
} from "@/lib/demo-data";
import { formatCurrency } from "@/lib/money";

type ReportPeriod = DemoMonth | "all";

const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  all: "Trimestre completo (Sep – Nov 2026)",
  "2026-11": formatMonthLabel("2026-11"),
  "2026-10": formatMonthLabel("2026-10"),
  "2026-09": formatMonthLabel("2026-09"),
};

export function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>("all");

  const monthlySeries = getDemoMonthlyCashflowSeries();
  const expenseBreakdown = getDemoExpenseBreakdown(period);
  const currentMonth = monthlySeries[monthlySeries.length - 1];
  const previousMonth = monthlySeries[monthlySeries.length - 2];

  const incomeDeltaCents =
    currentMonth.incomeCents - previousMonth.incomeCents;
  const expenseDeltaCents =
    currentMonth.expenseCents - previousMonth.expenseCents;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Comparaciones mensuales, evolución de ingresos y gastos y preparación de exportación CSV."
        actions={
          <>
            <Select
              value={period}
              onValueChange={(value) => {
                if (value) setPeriod(value as ReportPeriod);
              }}
            >
              <SelectTrigger
                aria-label="Seleccionar período del reporte"
                className="h-9 min-w-[215px] bg-card"
              >
                <SelectValue>{REPORT_PERIOD_LABELS[period]}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">
                  Trimestre completo (Sep – Nov 2026)
                </SelectItem>
                {[...DEMO_MONTHS].reverse().map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="h-9 bg-card"
              onClick={() =>
                toast.info("Exportación CSV disponible en Fase 04", {
                  description:
                    "El endpoint /api/reports/export descargará tus transacciones filtradas en UTF-8 sanitizado.",
                })
              }
            >
              <Download className="size-4" aria-hidden="true" />
              Exportar CSV
            </Button>
          </>
        }
      />

      <DemoNotice />

      {/* Month-over-Month Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Variación de ingresos (Nov vs. Oct)
              </p>
              <MoneyDisplay
                cents={incomeDeltaCents}
                tone="auto"
                showSign
                className="text-2xl font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(currentMonth.incomeCents)} en noviembre frente a{" "}
                {formatCurrency(previousMonth.incomeCents)} en octubre.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-success-text"
            >
              <TrendingUp className="size-5" />
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Variación de gastos (Nov vs. Oct)
              </p>
              <MoneyDisplay
                cents={expenseDeltaCents}
                tone={expenseDeltaCents > 0 ? "expense" : "income"}
                showSign
                className="text-2xl font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(currentMonth.expenseCents)} en noviembre frente
                a {formatCurrency(previousMonth.expenseCents)} en octubre.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger-text"
            >
              <TrendingDown className="size-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Evolución de ingresos y gastos
            </CardTitle>
            <CardDescription>
              Comparativa mensual en dólares (USD)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <CashflowBarChart data={monthlySeries} />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Tendencia de flujo neto mensual
            </CardTitle>
            <CardDescription>
              Ahorro neto resultante (ingresos menos gastos) por mes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <NetFlowAreaChart data={monthlySeries} />
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution + Monthly Summary Table */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Distribución de gastos por categoría
            </CardTitle>
            <CardDescription>{REPORT_PERIOD_LABELS[period]}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ExpenseCategoryChart data={expenseBreakdown} />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Resumen comparativo mensual
            </CardTitle>
            <CardDescription>
              Totales exactos derivados de los registros de demostración (
              {formatMonthLabel(DEMO_ACTIVE_MONTH)} activo)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabla comparativa mensual"
              className="table-scroll-region"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-background/70 hover:bg-background/70">
                    <TableHead scope="col" className="pl-6">
                      Mes
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Ingresos
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Gastos
                    </TableHead>
                    <TableHead scope="col" className="pr-6 text-right">
                      Neto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...monthlySeries].reverse().map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="pl-6 font-medium">
                        {formatMonthLabel(row.month)}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay cents={row.incomeCents} tone="income" />
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay cents={row.expenseCents} tone="expense" />
                      </TableCell>
                      <TableCell className="pr-6 text-right font-semibold">
                        <MoneyDisplay
                          cents={row.netCents}
                          tone="auto"
                          showSign
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
