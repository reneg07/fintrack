"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  CATEGORY_COLOR_SWATCHES,
  CATEGORY_ICON_MAP,
} from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import {
  createCategorySchema,
  type CreateCategoryValues,
} from "@/schemas/category.schema";
import type {
  CategoryIconKey,
  CategoryWithUsage,
  TransactionType,
} from "@/types/domain";

interface CategoriesViewProps {
  initialCategories: CategoryWithUsage[];
}

const ICON_ENTRIES = Object.entries(CATEGORY_ICON_MAP) as [
  CategoryIconKey,
  (typeof CATEGORY_ICON_MAP)[CategoryIconKey],
][];

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const router = useRouter();
  const [categories, setCategories] =
    useState<CategoryWithUsage[]>(initialCategories);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithUsage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation dialog state
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithUsage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const form = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: CATEGORY_COLOR_SWATCHES[0].hex,
      icon: "tag",
    },
  });

  const watchedColor = useWatch({ control: form.control, name: "color" });
  const watchedIcon = useWatch({ control: form.control, name: "icon" });

  const editingHasUsage =
    editingCategory !== null &&
    (editingCategory.transactionsCount > 0 || editingCategory.budgetsCount > 0);

  function openCreateDialog() {
    setEditingCategory(null);
    form.reset({
      name: "",
      type: typeFilter === "income" ? "income" : "expense",
      color: CATEGORY_COLOR_SWATCHES[0].hex,
      icon: "tag",
    });
    setIsFormOpen(true);
  }

  function openEditDialog(category: CategoryWithUsage) {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      type: category.type,
      color: category.color.toUpperCase(),
      icon: category.icon,
    });
    setIsFormOpen(true);
  }

  function openDeleteDialog(category: CategoryWithUsage) {
    setDeleteError(null);
    setDeletingCategory(category);
  }

  async function onSubmit(values: CreateCategoryValues) {
    setIsSubmitting(true);
    try {
      const isEditing = editingCategory !== null;
      const endpoint = isEditing
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = isEditing ? "PATCH" : "POST";

      const payload =
        isEditing && editingHasUsage
          ? { name: values.name, color: values.color, icon: values.icon }
          : values;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as {
        data: CategoryWithUsage | null;
        error: { message: string } | null;
      };

      if (!response.ok || !body.data) {
        toast.error(
          body.error?.message ?? "No fue posible guardar la categoría.",
        );
        return;
      }

      const saved = body.data;
      setCategories((prev) => {
        if (isEditing) {
          return prev
            .map((item) => (item.id === saved.id ? saved : item))
            .sort((a, b) => a.name.localeCompare(b.name, "es"));
        }
        return [...prev, saved].sort((a, b) =>
          a.name.localeCompare(b.name, "es"),
        );
      });

      toast.success(
        isEditing
          ? "Categoría actualizada correctamente."
          : "Categoría creada correctamente.",
      );
      setIsFormOpen(false);
      setEditingCategory(null);
      router.refresh();
    } catch {
      toast.error("Error de conexión al guardar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as {
        data: { id: string; deleted: true } | null;
        error: { message: string } | null;
      };

      if (!response.ok) {
        const message =
          body.error?.message ?? "No fue posible eliminar la categoría.";
        setDeleteError(message);
        toast.error(message);
        return;
      }

      setCategories((prev) =>
        prev.filter((item) => item.id !== deletingCategory.id),
      );
      toast.success("Categoría eliminada correctamente.");
      setDeletingCategory(null);
      router.refresh();
    } catch {
      const message = "Error de conexión al eliminar la categoría.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const showExpenses = typeFilter === "all" || typeFilter === "expense";
  const showIncome = typeFilter === "all" || typeFilter === "income";

  function renderCategoryCard(category: CategoryWithUsage) {
    const totalLinked = category.transactionsCount + category.budgetsCount;
    return (
      <Card
        key={category.id}
        className="border-border/80 bg-card shadow-none transition-colors hover:border-border"
      >
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.isDefault ? "Inicial" : "Personalizada"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Editar categoría ${category.name}`}
                onClick={() => openEditDialog(category)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Eliminar categoría ${category.name}`}
                className="text-muted-foreground hover:text-danger-text"
                onClick={() => openDeleteDialog(category)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
            <span>
              {totalLinked === 0
                ? "Sin registros asociados"
                : `${category.transactionsCount} mov. · ${category.budgetsCount} pres.`}
            </span>
            <span className="font-mono">{category.color}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Organiza tus fuentes de ingreso y categorías de gasto. Las categorías en uso están protegidas contra eliminación."
        actions={
          <Button type="button" onClick={openCreateDialog} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Nueva categoría
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filtrar categorías por tipo"
          className="inline-flex rounded-lg border border-border bg-card p-1"
        >
          {(
            [
              { key: "all", label: `Todas (${categories.length})` },
              { key: "expense", label: `Gastos (${expenseCategories.length})` },
              {
                key: "income",
                label: `Ingresos (${incomeCategories.length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                typeFilter === tab.key
                  ? "bg-brand-primary text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="size-4 shrink-0 text-success-text"
            aria-hidden="true"
          />
          <span>Integridad protegida por PostgreSQL + RLS</span>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Aún no hay categorías registradas"
          description="Crea tu primera categoría personalizada para clasificar tus ingresos y gastos."
          action={
            <Button type="button" onClick={openCreateDialog}>
              Crear primera categoría
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {showExpenses && (
            <section
              aria-labelledby="expense-categories-heading"
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="expense-categories-heading"
                  className="text-base font-semibold text-foreground"
                >
                  Categorías de gastos ({expenseCategories.length})
                </h2>
                <Badge
                  variant="outline"
                  className="border-red-200 bg-red-50 text-danger-text"
                >
                  Elegibles para presupuestos
                </Badge>
              </div>
              {expenseCategories.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No tienes categorías de gastos creadas todavía.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {expenseCategories.map(renderCategoryCard)}
                </div>
              )}
            </section>
          )}

          {showIncome && (
            <section
              aria-labelledby="income-categories-heading"
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="income-categories-heading"
                  className="text-base font-semibold text-foreground"
                >
                  Categorías de ingresos ({incomeCategories.length})
                </h2>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-success-text"
                >
                  Fuentes de ingreso
                </Badge>
              </div>
              {incomeCategories.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  No tienes categorías de ingresos creadas todavía.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {incomeCategories.map(renderCategoryCard)}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Create / Edit Category Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Actualiza el nombre, color o icono de esta categoría."
                : "Crea una categoría personalizada para tus registros financieros."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                placeholder="Ej. Mascotas, Bonos, Gimnasio"
                maxLength={60}
                disabled={isSubmitting}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-type">Tipo</Label>
              <select
                id="category-type"
                disabled={isSubmitting || editingHasUsage}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                {...form.register("type")}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
              {editingHasUsage && (
                <p className="text-xs text-muted-foreground">
                  El tipo no puede modificarse porque la categoría ya tiene
                  transacciones o presupuestos asociados.
                </p>
              )}
              {form.formState.errors.type && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color distintivo</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLOR_SWATCHES.map((swatch) => {
                  const isSelected =
                    watchedColor?.toUpperCase() === swatch.hex.toUpperCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      disabled={isSubmitting}
                      aria-label={`Color ${swatch.label}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        form.setValue("color", swatch.hex, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "size-7 rounded-full border-2 transition-transform",
                        isSelected
                          ? "scale-110 border-foreground ring-2 ring-brand-primary/30"
                          : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}
              </div>
              {form.formState.errors.color && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                {ICON_ENTRIES.map(([iconKey, meta]) => {
                  const IconComp = meta.icon;
                  const isSelected = watchedIcon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      disabled={isSubmitting}
                      aria-label={`Icono ${meta.label}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        form.setValue("icon", iconKey, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border transition-colors",
                        isSelected
                          ? "border-brand-primary bg-emerald-50 text-brand-primary"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      <IconComp className="size-4" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.icon && (
                <p className="text-xs text-danger-text">
                  {form.formState.errors.icon.message}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editingCategory ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingCategory(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              {deletingCategory
                ? `¿Deseas eliminar permanentemente la categoría "${deletingCategory.name}"?`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {deletingCategory &&
            (deletingCategory.transactionsCount > 0 ||
              deletingCategory.budgetsCount > 0) && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-warning-text">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p>
                  Esta categoría tiene{" "}
                  <strong>
                    {deletingCategory.transactionsCount} transacciones
                  </strong>{" "}
                  y{" "}
                  <strong>{deletingCategory.budgetsCount} presupuestos</strong>{" "}
                  asociados. El servidor impedirá su eliminación para preservar
                  la integridad de tu historial.
                </p>
              </div>
            )}

          {deleteError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-danger-text"
            >
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                setDeletingCategory(null);
                setDeleteError(null);
              }}
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
              Confirmar eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
