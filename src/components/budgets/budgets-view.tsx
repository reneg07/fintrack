"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Target, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetProgress } from "@/components/shared/budget-progress";
import { CategoryIcon } from "@/components/shared/category-icon";
import { DemoNotice } from "@/components/shared/demo-notice";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { formatMonthLabel } from "@/lib/dates";
import {
  DEMO_ACTIVE_MONTH,
  DEMO_CATEGORIES,
  DEMO_MONTHS,
  getDemoBudgetSummaries,
  type DemoMonth,
} from "@/lib/demo-data";
import { calculateBudgetPercentage, sumCents } from "@/lib/money";

export function BudgetsView() {
  const [month, setMonth] = useState<DemoMonth>(DEMO_ACTIVE_MONTH);
  const [modalOpen, setModalOpen] = useState(false);

  const budgets = getDemoBudgetSummaries(month);
  const expenseCategories = DEMO_CATEGORIES.filter((c) => c.type === "expense");
  const totalLimitCents = sumCents(budgets.map((b) => b.limitCents));
  const totalSpentCents = sumCents(budgets.map((b) => b.spentCents));
  const remainingCents = totalLimitCents - totalSpentCents;
  const globalPct =
    totalLimitCents > 0
      ? calculateBudgetPercentage(totalSpentCents, totalLimitCents)
      : 0;
  const warningCount = budgets.filter((b) => b.status === "warning").length;
  const exceededCount = budgets.filter((b) => b.status === "exceeded").length;

  function handleCreatePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalOpen(false);
    toast.info("Interfaz de presupuesto verificada (Fase 02)", {
      description:
        "Los presupuestos mensuales reales con unicidad por mes se conectarán en la Fase 04.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description={`Control mensual de límites por categoría de gasto para ${formatMonthLabel(month).toLowerCase()}.`}
        actions={
          <>
            <Select
              value={month}
              onValueChange={(value) => {
                if (value) setMonth(value as DemoMonth);
              }}
            >
              <SelectTrigger
                aria-label="Seleccionar mes de presupuesto"
                className="h-9 min-w-[170px] bg-card"
              >
                <SelectValue>{formatMonthLabel(month)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {[...DEMO_MONTHS].reverse().map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatMonthLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger
                render={<Button type="button" className="h-9 px-3.5" />}
              >
                <Plus className="size-4" aria-hidden="true" />
                Nuevo presupuesto
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Definir presupuesto mensual</DialogTitle>
                  <DialogDescription>
                    Solo las categorías de gasto pueden tener presupuesto
                    asignado. Guardado real en Fase 04.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleCreatePreview}
                  className="space-y-4 pt-1"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="budget-category">Categoría de gasto</Label>
                    <select
                      id="budget-category"
                      className="flex h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="budget-month">Mes</Label>
                      <Input
                        id="budget-month"
                        type="month"
                        defaultValue={month}
                        required
                        className="h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="budget-limit">Límite mensual (USD)</Label>
                      <Input
                        id="budget-limit"
                        type="text"
                        inputMode="decimal"
                        placeholder="250.00"
                        required
                        className="h-9 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar presupuesto</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <DemoNotice />

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total presupuestado"
          amountCents={totalLimitCents}
          tone="neutral"
          icon={Target}
          accent="dark"
          helperText={`${budgets.length} categorías monitoreadas en ${formatMonthLabel(month)}`}
        />
        <KpiCard
          label="Total consumido"
          amountCents={totalSpentCents}
          tone="expense"
          icon={Wallet}
          accent="danger"
          helperText={`${globalPct.toFixed(1)}% del presupuesto total del mes`}
        />
        <KpiCard
          label={remainingCents >= 0 ? "Saldo disponible" : "Exceso acumulado"}
          amountCents={remainingCents}
          tone="auto"
          icon={AlertTriangle}
          accent={remainingCents >= 0 ? "emerald" : "danger"}
          helperText={`${exceededCount} superado(s) · ${warningCount} cerca del límite`}
        />
      </div>

      {/* Warning banner when budgets are exceeded or near limit */}
      {(exceededCount > 0 || warningCount > 0) && (
        <Alert className="border-amber-200 bg-amber-50/80 text-foreground">
          <AlertTriangle
            className="size-4 text-warning-text"
            aria-hidden="true"
          />
          <AlertTitle className="text-sm font-semibold text-foreground">
            Atención en tus límites de {formatMonthLabel(month)}
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            {exceededCount > 0 &&
              `${exceededCount} categoría(s) ya superaron el 100% de su presupuesto asignado. `}
            {warningCount > 0 &&
              `${warningCount} categoría(s) han superado el 80% del límite configurado.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((budget) => (
          <Card
            key={budget.id}
            className="border-border/80 bg-card shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryIcon
                  icon={budget.category.icon}
                  color={budget.category.color}
                />
                <div className="min-w-0">
                  <CardTitle className="truncate text-base font-semibold">
                    {budget.category.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Alerta preventiva al {budget.alertThresholdPct}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BudgetProgress
                label={budget.category.name}
                spentCents={budget.spentCents}
                limitCents={budget.limitCents}
                percentage={budget.percentage}
                status={budget.status}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
