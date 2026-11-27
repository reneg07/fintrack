"use client";

import { useState } from "react";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryIcon } from "@/components/shared/category-icon";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import {
  CATEGORY_COLOR_SWATCHES,
  CATEGORY_ICON_MAP,
} from "@/lib/category-icons";
import {
  DEMO_CATEGORIES,
  getDemoCategoryUsageCount,
} from "@/lib/demo-data";
import type { CategoryIconKey, TransactionType } from "@/types/domain";
import { cn } from "@/lib/utils";

const ICON_KEYS = Object.keys(CATEGORY_ICON_MAP) as CategoryIconKey[];

export function CategoriesView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftType, setDraftType] = useState<TransactionType>("expense");
  const [selectedColor, setSelectedColor] = useState<string>(
    CATEGORY_COLOR_SWATCHES[0].hex,
  );
  const [selectedIcon, setSelectedIcon] =
    useState<CategoryIconKey>("shopping-bag");

  const incomeCategories = DEMO_CATEGORIES.filter((c) => c.type === "income");
  const expenseCategories = DEMO_CATEGORIES.filter((c) => c.type === "expense");

  function handleSavePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalOpen(false);
    toast.info("Interfaz de categoría verificada (Fase 02)", {
      description:
        "La creación y edición real contra Supabase se conectará en la Fase 04.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Administra tus categorías de ingresos y gastos con colores e iconos personalizados."
        actions={
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger
              render={<Button type="button" className="h-9 px-3.5" />}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nueva categoría
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva categoría personalizada</DialogTitle>
                <DialogDescription>
                  Personaliza nombre, tipo, color e icono. El guardado real se
                  habilitará en la Fase 04.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSavePreview} className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={draftType === "expense" ? "default" : "outline"}
                    onClick={() => setDraftType("expense")}
                    className="h-9"
                  >
                    Gasto
                  </Button>
                  <Button
                    type="button"
                    variant={draftType === "income" ? "default" : "outline"}
                    onClick={() => setDraftType("income")}
                    className="h-9"
                  >
                    Ingreso
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-name">Nombre de categoría</Label>
                  <Input
                    id="cat-name"
                    type="text"
                    placeholder="Ej. Mascotas o Ahorro"
                    required
                    className="h-9 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color distintivo</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setSelectedColor(swatch.hex)}
                        aria-label={`Color ${swatch.label}`}
                        aria-pressed={selectedColor === swatch.hex}
                        className={cn(
                          "size-8 rounded-full border-2 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          selectedColor === swatch.hex
                            ? "scale-110 border-foreground"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icono</Label>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                    {ICON_KEYS.map((iconKey) => {
                      const entry = CATEGORY_ICON_MAP[iconKey];
                      const Icon = entry.icon;
                      const isSelected = selectedIcon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setSelectedIcon(iconKey)}
                          aria-label={entry.label}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                            isSelected
                              ? "border-primary bg-emerald-50 text-success-text"
                              : "border-border bg-white text-muted-foreground hover:bg-secondary",
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </button>
                      );
                    })}
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
                  <Button type="submit">Guardar categoría</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DemoNotice />

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <ShieldAlert
          className="mt-0.5 size-4 shrink-0 text-warning-text"
          aria-hidden="true"
        />
        <p>
          <strong>Política de eliminación segura:</strong> las categorías con
          transacciones o presupuestos vinculados no podrán eliminarse
          (integridad referencial en PostgreSQL + respuesta HTTP 409 en Fase
          04).
        </p>
      </div>

      {/* Expense Categories */}
      <section aria-labelledby="expense-categories-heading" className="space-y-3">
        <div className="flex items-center justify-between">
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {expenseCategories.map((category) => {
            const usage = getDemoCategoryUsageCount(category.id);
            const inUse = usage.transactions > 0 || usage.budgets > 0;
            return (
              <Card
                key={category.id}
                className="border-border/80 bg-card shadow-none"
              >
                <CardContent className="flex h-full flex-col justify-between gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.isDefault ? "Inicial" : "Personalizada"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => setModalOpen(true)}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Eliminar ${category.name}`}
                        className="text-danger-text hover:bg-red-50 hover:text-danger-text"
                        onClick={() =>
                          inUse
                            ? toast.warning(
                                `No se puede eliminar "${category.name}"`,
                                {
                                  description: `Tiene ${usage.transactions} transacciones y ${usage.budgets} presupuestos asociados (HTTP 409 en Fase 04).`,
                                },
                              )
                            : toast.info(
                                "Eliminación disponible a partir de la Fase 04",
                              )
                        }
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
                    <span>{usage.transactions} mov.</span>
                    <span>{usage.budgets} presup.</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Income Categories */}
      <section aria-labelledby="income-categories-heading" className="space-y-3">
        <div className="flex items-center justify-between">
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {incomeCategories.map((category) => {
            const usage = getDemoCategoryUsageCount(category.id);
            return (
              <Card
                key={category.id}
                className="border-border/80 bg-card shadow-none"
              >
                <CardContent className="flex h-full flex-col justify-between gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.isDefault ? "Inicial" : "Personalizada"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Editar ${category.name}`}
                      onClick={() => setModalOpen(true)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
                    <span>{usage.transactions} mov.</span>
                    <span className="font-mono text-[11px]">
                      {category.color}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
