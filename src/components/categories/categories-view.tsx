import { ShieldAlert, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import type { Category } from "@/types/domain";

interface CategoriesViewProps {
  categories: Category[];
}

export function CategoriesView({ categories }: CategoriesViewProps) {
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Categorías reales cargadas desde tu cuenta en PostgreSQL. La creación, edición y borrado personalizado se conectarán en la Fase 04."
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <ShieldAlert
          className="mt-0.5 size-4 shrink-0 text-success-text"
          aria-hidden="true"
        />
        <p>
          Al registrarte, PostgreSQL crea automáticamente{" "}
          <strong className="text-foreground">12 categorías iniciales</strong>{" "}
          (4 de ingresos y 8 de gastos) protegidas por Row Level Security e
          integridad referencial contra borrado si tienen movimientos o
          presupuestos vinculados.
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Aún no hay categorías registradas"
          description="Cuando tu cuenta se inicializa en Supabase con las migraciones aplicadas, tus 12 categorías base aparecerán aquí automáticamente."
        />
      ) : (
        <>
          <section
            aria-labelledby="expense-categories-heading"
            className="space-y-3"
          >
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
              {expenseCategories.map((category) => (
                <Card
                  key={category.id}
                  className="border-border/80 bg-card shadow-none"
                >
                  <CardContent className="flex items-center justify-between gap-3 p-4">
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
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {category.color}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="income-categories-heading"
            className="space-y-3"
          >
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
              {incomeCategories.map((category) => (
                <Card
                  key={category.id}
                  className="border-border/80 bg-card shadow-none"
                >
                  <CardContent className="flex items-center justify-between gap-3 p-4">
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
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {category.color}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
