"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Filter,
  Pencil,
  Plus,
  Search,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryIcon } from "@/components/shared/category-icon";
import { DemoNotice } from "@/components/shared/demo-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateShort } from "@/lib/dates";
import {
  DEMO_CATEGORIES,
  getDemoTransactionsWithCategories,
} from "@/lib/demo-data";
import { formatCurrency, sumCents } from "@/lib/money";
import type { TransactionType } from "@/types/domain";

export function TransactionsView() {
  const allTransactions = useMemo(
    () => getDemoTransactionsWithCategories(),
    [],
  );

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [draftType, setDraftType] = useState<TransactionType>("expense");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.categoryId !== categoryFilter) {
        return false;
      }
      if (normalized) {
        const haystack =
          `${tx.description} ${tx.category.name} ${tx.notes ?? ""}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [allTransactions, query, typeFilter, categoryFilter]);

  const filteredIncomeCents = sumCents(
    filtered.filter((t) => t.type === "income").map((t) => t.amountCents),
  );
  const filteredExpenseCents = sumCents(
    filtered.filter((t) => t.type === "expense").map((t) => t.amountCents),
  );

  const categoriesForDraft = DEMO_CATEGORIES.filter(
    (c) => c.type === draftType,
  );

  const selectedCategoryName =
    categoryFilter === "all"
      ? "Todas las categorías"
      : (DEMO_CATEGORIES.find((c) => c.id === categoryFilter)?.name ??
        "Categoría");

  const typeFilterLabel =
    typeFilter === "all"
      ? "Todos los tipos"
      : typeFilter === "income"
        ? "Solo ingresos"
        : "Solo gastos";

  function handlePreliminarySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalOpen(false);
    toast.info("Interfaz de registro verificada (Fase 02)", {
      description:
        "El guardado real mediante Route Handlers y Supabase se habilitará en la Fase 04.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacciones"
        description="Consulta, busca y filtra tus ingresos y gastos registrados en USD."
        actions={
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger
              render={
                <Button type="button" className="h-9 px-3.5" />
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Nueva transacción
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar transacción</DialogTitle>
                <DialogDescription>
                  Interfaz preliminar del formulario de movimientos. La
                  persistencia en base de datos se conectará en la Fase 04.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handlePreliminarySubmit}
                className="space-y-4 pt-1"
              >
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-amount">Importe (USD)</Label>
                    <Input
                      id="tx-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      required
                      className="h-9 bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-date">Fecha</Label>
                    <Input
                      id="tx-date"
                      type="date"
                      defaultValue="2026-11-26"
                      required
                      className="h-9 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tx-category">Categoría</Label>
                  <select
                    id="tx-category"
                    className="flex h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {categoriesForDraft.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tx-description">Descripción</Label>
                  <Input
                    id="tx-description"
                    type="text"
                    placeholder="Ej. Supermercado semanal"
                    required
                    className="h-9 bg-white"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar movimiento</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DemoNotice />

      {/* Filters Toolbar */}
      <Card className="border-border/80 bg-card shadow-none">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_210px_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por descripción, categoría o nota..."
                aria-label="Buscar transacciones"
                className="h-9 bg-white pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                if (value) setTypeFilter(value as "all" | TransactionType);
              }}
            >
              <SelectTrigger
                aria-label="Filtrar por tipo"
                className="h-9 w-full bg-white"
              >
                <SelectValue>{typeFilterLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="income">Solo ingresos</SelectItem>
                <SelectItem value="expense">Solo gastos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                if (value) setCategoryFilter(value);
              }}
            >
              <SelectTrigger
                aria-label="Filtrar por categoría"
                className="h-9 w-full bg-white"
              >
                <SelectValue>{selectedCategoryName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {DEMO_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(query || typeFilter !== "all" || categoryFilter !== "all") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
                className="h-9"
              >
                Limpiar
              </Button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Filter className="size-3.5" aria-hidden="true" />
              Mostrando <strong className="text-foreground">{filtered.length}</strong> de{" "}
              {allTransactions.length} movimientos
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
              <span className="text-success-text">
                Ingresos: +{formatCurrency(filteredIncomeCents)}
              </span>
              <span className="text-danger-text">
                Gastos: -{formatCurrency(filteredExpenseCents)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Listing */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No encontramos movimientos con esos filtros"
          description="Prueba ajustando tu búsqueda o limpiando los filtros activos para volver a ver todos los registros de demostración."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setTypeFilter("all");
                setCategoryFilter("all");
              }}
            >
              Restablecer filtros
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop / Tablet semantic keyboard-scrollable table */}
          <Card className="hidden border-border/80 bg-card shadow-none md:block">
            <div
              tabIndex={0}
              role="region"
              aria-label="Tabla de transacciones financieras"
              className="table-scroll-region"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-background/70 hover:bg-background/70">
                    <TableHead scope="col" className="pl-5">
                      Descripción
                    </TableHead>
                    <TableHead scope="col">Categoría</TableHead>
                    <TableHead scope="col">Fecha</TableHead>
                    <TableHead scope="col">Tipo</TableHead>
                    <TableHead scope="col" className="text-right">
                      Importe
                    </TableHead>
                    <TableHead scope="col" className="pr-5 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="pl-5 font-medium text-foreground">
                        <div className="max-w-[280px]">
                          <p className="truncate">{tx.description}</p>
                          {tx.notes && (
                            <p className="truncate text-xs font-normal text-muted-foreground">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            icon={tx.category.icon}
                            color={tx.category.color}
                            size="sm"
                          />
                          <span className="text-sm text-foreground">
                            {tx.category.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateShort(tx.occurredOn)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tx.type === "income"
                              ? "border-emerald-200 bg-emerald-50 text-success-text"
                              : "border-red-200 bg-red-50 text-danger-text"
                          }
                        >
                          {tx.type === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay
                          cents={tx.amountCents}
                          tone={tx.type === "income" ? "income" : "expense"}
                          className="font-semibold"
                        />
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${tx.description}`}
                            onClick={() =>
                              toast.info(
                                "Edición disponible a partir de la Fase 04",
                              )
                            }
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${tx.description}`}
                            className="text-danger-text hover:bg-red-50 hover:text-danger-text"
                            onClick={() =>
                              toast.info(
                                "Eliminación disponible a partir de la Fase 04",
                              )
                            }
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile responsive card stack (zero horizontal scroll) */}
          <div className="space-y-3 md:hidden">
            {filtered.map((tx) => (
              <Card key={tx.id} className="border-border/80 bg-card shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon
                        icon={tx.category.icon}
                        color={tx.category.color}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category.name} · {formatDateShort(tx.occurredOn)}
                        </p>
                      </div>
                    </div>
                    <MoneyDisplay
                      cents={tx.amountCents}
                      tone={tx.type === "income" ? "income" : "expense"}
                      className="shrink-0 text-sm font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
