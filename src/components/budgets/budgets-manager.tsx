"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetProgress } from "@/components/shared/budget-progress";
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { addMonths, formatMonthLabel } from "@/lib/dates";
import {
  centsToInputValue,
  parseExactCents,
  parsePositiveDollarsToCents,
} from "@/lib/money";
import {
  budgetFormSchema,
  type BudgetFormValues,
} from "@/schemas/budget.schema";
import type {
  BudgetsMonthPayload,
  CategoryWithUsage,
  ExactBudgetSummary,
} from "@/types/domain";

const ZERO = BigInt(0);

interface BudgetsManagerProps {
  initialData: BudgetsMonthPayload;
  expenseCategories: CategoryWithUsage[];
}

export function BudgetsManager({
  initialData,
  expenseCategories,
}: BudgetsManagerProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(initialData.month);
  const [data, setData] = useState<BudgetsMonthPayload>(initialData);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = `${selectedMonth}|${reloadToken}`;
  const [settledKey, setSettledKey] = useState(requestKey);
  const isLoading = settledKey !== requestKey;

  // Create / Edit dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] =
    useState<ExactBudgetSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation dialog state
  const [deletingBudget, setDeletingBudget] =
    useState<ExactBudgetSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFirstRender = useRef(true);

  const budgetedCategoryIds = useMemo(
    () => new Set(data.items.map((item) => item.categoryId)),
    [data.items],
  );

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: expenseCategories[0]?.id ?? "",
      month: selectedMonth,
      limit: "",
      alertThresholdPct: "80",
    },
  });

  // Fetch budgets for selected month with AbortController
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const controller = new AbortController();

    fetch(`/api/budgets?month=${encodeURIComponent(selectedMonth)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json()) as {
          data: BudgetsMonthPayload | null;
          error: { message: string } | null;
        };
        if (!res.ok || !body.data) {
          throw new Error(
            body.error?.message ?? "No fue posible cargar tus presupuestos.",
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
            : "Error al cargar los presupuestos.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSettledKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [selectedMonth, requestKey]);

  function openCreateDialog() {
    setEditingBudget(null);
    const firstAvailable =
      expenseCategories.find((c) => !budgetedCategoryIds.has(c.id)) ??
      expenseCategories[0];
    form.reset({
      categoryId: firstAvailable?.id ?? "",
      month: selectedMonth,
      limit: "",
      alertThresholdPct: "80",
    });
    setIsFormOpen(true);
  }

  function openEditDialog(budget: ExactBudgetSummary) {
    setEditingBudget(budget);
    form.reset({
      categoryId: budget.categoryId,
      month: budget.month,
      limit: centsToInputValue(budget.limitCents),
      alertThresholdPct: String(budget.alertThresholdPct),
    });
    setIsFormOpen(true);
  }

  async function onSubmit(values: BudgetFormValues) {
    setIsSubmitting(true);
    try {
      const limitCents = parsePositiveDollarsToCents(values.limit);
      const alertThresholdPct = Number.parseInt(values.alertThresholdPct, 10);
      const isEditing = editingBudget !== null;
      const endpoint = isEditing
        ? `/api/budgets/${editingBudget.id}`
        : "/api/budgets";
      const method = isEditing ? "PATCH" : "POST";

      const payload = isEditing
        ? { limitCents, alertThresholdPct }
        : {
            categoryId: values.categoryId,
            month: values.month,
            limitCents,
            alertThresholdPct,
          };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as {
        data: ExactBudgetSummary | null;
        error: { message: string } | null;
      };

      if (!response.ok || !body.data) {
        toast.error(
          body.error?.message ?? "No fue posible guardar el presupuesto.",
        );
        return;
      }

      toast.success(
        isEditing
          ? "Presupuesto actualizado correctamente."
          : "Presupuesto creado correctamente.",
      );
      setIsFormOpen(false);
      setEditingBudget(null);
      if (!isEditing && values.month !== selectedMonth) {
        setSelectedMonth(values.month);
      } else {
        setReloadToken((n) => n + 1);
      }
      router.refresh();
    } catch {
      toast.error("Error de conexión al guardar el presupuesto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingBudget) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/budgets/${deletingBudget.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as {
        data: { id: string; deleted: true } | null;
        error: { message: string } | null;
      };

      if (!response.ok) {
        toast.error(
          body.error?.message ?? "No fue posible eliminar el presupuesto.",
        );
        return;
      }

      toast.success("Presupuesto eliminado correctamente.");
      setDeletingBudget(null);
      setReloadToken((n) => n + 1);
      router.refresh();
    } catch {
      toast.error("Error de conexión al eliminar el presupuesto.");
    } finally {
      setIsDeleting(false);
    }
  }

  const totalRemainingExact = parseExactCents(data.summary.totalRemainingCents);
  const alertsCount =
    data.summary.warningCount +
    data.summary.limitReachedCount +
    data.summary.exceededCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description={`Control mensual de límites de gasto para ${data.monthLabel.toLowerCase()}.`}
        actions={
          <Button type="button" onClick={openCreateDialog} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Nuevo presupuesto
          </Button>
        }
      />

      {/* Month Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Mes anterior"
            onClick={() => setSelectedMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">
            {formatMonthLabel(selectedMonth)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Mes siguiente"
            onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor="budget-month-picker"
            className="text-xs text-muted-foreground"
          >
            Ir al mes:
          </Label>
          <Input
            id="budget-month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              if (/^\d{4}-\d{2}$/.test(e.target.value)) {
                setSelectedMonth(e.target.value);
              }
            }}
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total presupuestado
            </p>
            <MoneyDisplay
              cents={data.summary.totalLimitCents}
              tone="neutral"
              className="text-xl font-semibold"
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total consumido ({data.summary.globalPercentage.toFixed(1)}%)
            </p>
            <MoneyDisplay
              cents={data.summary.totalSpentCents}
              tone="expense"
              className="text-xl font-semibold"
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              {totalRemainingExact < ZERO
                ? "Excedente global"
                : "Disponible global"}
            </p>
            <MoneyDisplay
              cents={
                totalRemainingExact < ZERO
                  ? -totalRemainingExact
                  : totalRemainingExact
              }
              tone={totalRemainingExact < ZERO ? "expense" : "income"}
              className="text-xl font-semibold"
            />
          </CardContent>
        </Card>
      </div>

      {alertsCount > 0 && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-warning-text"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            Tienes <strong className="font-semibold">{alertsCount}</strong>{" "}
            {alertsCount === 1
              ? "presupuesto que requiere atención"
              : "presupuestos que requieren atención"}{" "}
            en {data.monthLabel.toLowerCase()} (
            {data.summary.warningCount} cerca del límite,{" "}
            {data.summary.limitReachedCount} en el límite exacto,{" "}
            {data.summary.exceededCount} superados).
          </p>
        </div>
      )}

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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Target}
          title={`Sin presupuestos para ${data.monthLabel.toLowerCase()}`}
          description="Define límites mensuales para tus categorías de gasto y recibe alertas visuales automáticas al acercarte o superar el tope."
          action={
            <Button type="button" onClick={openCreateDialog}>
              Crear primer presupuesto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.items.map((budget) => (
            <Card
              key={budget.id}
              className="border-border/80 bg-card shadow-none transition-colors hover:border-border"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon
                      icon={budget.category.icon}
                      color={budget.category.color}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-foreground">
                        {budget.category.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Alerta al {budget.alertThresholdPct}% ·{" "}
                        {formatMonthLabel(budget.month)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar presupuesto de ${budget.category.name}`}
                      onClick={() => openEditDialog(budget)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar presupuesto de ${budget.category.name}`}
                      className="text-muted-foreground hover:text-danger-text"
                      onClick={() => setDeletingBudget(budget)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

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
      )}

      {/* Create / Edit Budget Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}
            </DialogTitle>
            <DialogDescription>
              {editingBudget
                ? `Ajusta el límite mensual y el umbral de alerta para ${editingBudget.category.name}.`
                : "Asigna un límite de gasto mensual a una de tus categorías de gasto."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="budget-category">Categoría de gasto</Label>
              <select
                id="budget-category"
                disabled={isSubmitting || editingBudget !== null}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                {...form.register("categoryId")}
              >
                {expenseCategories.length === 0 ? (
                  <option value="">Sin categorías de gasto disponibles</option>
                ) : (
                  expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                      {!editingBudget && budgetedCategoryIds.has(cat.id)
                        ? " (ya presupuestada este mes)"
                        : ""}
                    </option>
                  ))
                )}
              </select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="budget-month">Mes</Label>
                <Input
                  id="budget-month"
                  type="month"
                  disabled={isSubmitting || editingBudget !== null}
                  {...form.register("month")}
                />
                {form.formState.errors.month && (
                  <p className="text-xs text-danger-text">
                    {form.formState.errors.month.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget-limit">Límite mensual (USD)</Label>
                <Input
                  id="budget-limit"
                  inputMode="decimal"
                  placeholder="150.00"
                  disabled={isSubmitting}
                  {...form.register("limit")}
                />
                {form.formState.errors.limit && (
                  <p className="text-xs text-danger-text">
                    {form.formState.errors.limit.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget-threshold">
                Umbral de alerta preventiva (%)
              </Label>
              <Input
                id="budget-threshold"
                type="number"
                min={50}
                max={99}
                step={1}
                disabled={isSubmitting}
                {...form.register("alertThresholdPct")}
              />
              <p className="text-xs text-muted-foreground">
                Recibirás aviso visual al alcanzar este porcentaje (entre 50% y
                99%, recomendado 80%).
              </p>
              {form.formState.errors.alertThresholdPct && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.alertThresholdPct.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || expenseCategories.length === 0}
              >
                {isSubmitting && (
                  <Loader2
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editingBudget ? "Guardar cambios" : "Crear presupuesto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingBudget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingBudget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar presupuesto</DialogTitle>
            <DialogDescription>
              {deletingBudget
                ? `¿Confirmas que deseas eliminar el presupuesto de "${deletingBudget.category.name}" para ${formatMonthLabel(deletingBudget.month)}? Tus transacciones no se verán afectadas.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingBudget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting && (
                <Loader2
                  className="mr-1.5 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Eliminar presupuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
