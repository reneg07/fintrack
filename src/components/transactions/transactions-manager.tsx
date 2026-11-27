"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Loader2,
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
} from "@/components/ui/dialog";
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
import { CategoryIcon } from "@/components/shared/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { MoneyDisplay } from "@/components/shared/money-display";
import { PageHeader } from "@/components/shared/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateShort, getCurrentDateInElSalvador } from "@/lib/dates";
import {
  centsToInputValue,
  parsePositiveDollarsToCents,
} from "@/lib/money";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "@/schemas/transaction.schema";
import type {
  CategoryWithUsage,
  PaginatedTransactionsResult,
  TransactionType,
  TransactionWithCategory,
} from "@/types/domain";

interface TransactionsManagerProps {
  initialData: PaginatedTransactionsResult;
  initialError?: string | null;
  categories: CategoryWithUsage[];
  defaultOpenCreate?: boolean;
}

const PAGE_SIZE = 10;

export function TransactionsManager({
  initialData,
  initialError = null,
  categories,
  defaultOpenCreate = false,
}: TransactionsManagerProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedTransactionsResult>(initialData);

  // Interactive filter & pagination state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [fetchError, setFetchError] = useState<string | null>(initialError);
  const [reloadToken, setReloadToken] = useState(0);

  // Create / Edit dialog state
  const [isFormOpen, setIsFormOpen] = useState(defaultOpenCreate);
  const [editingTx, setEditingTx] = useState<TransactionWithCategory | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation dialog state
  const [deletingTx, setDeletingTx] = useState<TransactionWithCategory | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const isFirstRender = useRef(true);

  const dateRangeError =
    fromDate && toDate && fromDate > toDate
      ? "La fecha final no puede ser anterior a la fecha inicial."
      : null;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    return params.toString();
  }, [debouncedSearch, typeFilter, categoryFilter, fromDate, toDate, page]);

  const requestKey = `${queryString}|${reloadToken}`;
  const [settledKey, setSettledKey] = useState(requestKey);
  const isLoading = !dateRangeError && settledKey !== requestKey;
  const activeError = dateRangeError ?? fetchError;

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories],
  );

  const defaultExpenseId = expenseCategories[0]?.id ?? "";
  const defaultIncomeId = incomeCategories[0]?.id ?? "";

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      categoryId: defaultExpenseId,
      amount: "",
      occurredOn: getCurrentDateInElSalvador(),
      description: "",
      notes: "",
    },
  });

  const watchedType = useWatch({ control: form.control, name: "type" });
  const watchedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  const selectableCategories =
    watchedType === "income" ? incomeCategories : expenseCategories;

  // Keep categoryId compatible whenever the user switches transaction type in the modal
  useEffect(() => {
    if (!isFormOpen) return;
    const validForType = selectableCategories.some(
      (c) => c.id === watchedCategoryId,
    );
    if (!validForType) {
      form.setValue("categoryId", selectableCategories[0]?.id ?? "", {
        shouldValidate: false,
      });
    }
  }, [isFormOpen, selectableCategories, watchedCategoryId, form]);

  const filterCategoryOptions = useMemo(() => {
    if (typeFilter === "all") return categories;
    return categories.filter((c) => c.type === typeFilter);
  }, [categories, typeFilter]);

  // Fetch filtered & paginated transactions from internal Route Handler with AbortController
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (dateRangeError) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/transactions?${queryString}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 401) {
          toast.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
          router.replace("/login?next=/transactions");
          return;
        }
        const body = (await res.json().catch(() => null)) as {
          data: PaginatedTransactionsResult | null;
          error: { message: string } | null;
        } | null;
        if (!res.ok || !body?.data) {
          throw new Error(
            body?.error?.message ?? "No fue posible cargar tus transacciones.",
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
            : "Error al cargar las transacciones.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSettledKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [dateRangeError, queryString, requestKey, router]);

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    fromDate.length > 0 ||
    toDate.length > 0;

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
    setPage(1);
    setFetchError(null);
  }, []);

  function openCreateDialog() {
    setEditingTx(null);
    form.reset({
      type: "expense",
      categoryId: defaultExpenseId || defaultIncomeId,
      amount: "",
      occurredOn: getCurrentDateInElSalvador(),
      description: "",
      notes: "",
    });
    setIsFormOpen(true);
  }

  function openEditDialog(tx: TransactionWithCategory) {
    setEditingTx(tx);
    form.reset({
      type: tx.type,
      categoryId: tx.categoryId,
      amount: centsToInputValue(tx.amountCents),
      occurredOn: tx.occurredOn,
      description: tx.description,
      notes: tx.notes ?? "",
    });
    setIsFormOpen(true);
  }

  async function onSubmit(values: TransactionFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const amountCents = parsePositiveDollarsToCents(values.amount);
      const isEditing = editingTx !== null;
      const endpoint = isEditing
        ? `/api/transactions/${editingTx.id}`
        : "/api/transactions";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: values.type,
          categoryId: values.categoryId,
          amountCents,
          occurredOn: values.occurredOn,
          description: values.description.trim(),
          notes: values.notes?.trim() ? values.notes.trim() : null,
        }),
      });

      const body = (await response.json()) as {
        data: TransactionWithCategory | null;
        error: { message: string } | null;
      };

      if (!response.ok || !body.data) {
        toast.error(
          body.error?.message ?? "No fue posible guardar la transacción.",
        );
        return;
      }

      toast.success(
        isEditing
          ? "Transacción actualizada correctamente."
          : "Transacción registrada correctamente.",
      );
      setIsFormOpen(false);
      setEditingTx(null);
      if (!isEditing) {
        setPage(1);
      }
      setReloadToken((n) => n + 1);
      router.refresh();
    } catch {
      toast.error("Error de conexión al guardar la transacción.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${deletingTx.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as {
        data: { id: string; deleted: true } | null;
        error: { message: string } | null;
      };

      if (!response.ok) {
        toast.error(
          body.error?.message ?? "No fue posible eliminar la transacción.",
        );
        return;
      }

      toast.success("Transacción eliminada correctamente.");
      setDeletingTx(null);
      if (data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setReloadToken((n) => n + 1);
      }
      router.refresh();
    } catch {
      toast.error("Error de conexión al eliminar la transacción.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacciones"
        description="Registra, busca y filtra tus ingresos y gastos en dólares estadounidenses (USD)."
        actions={
          <Button type="button" onClick={openCreateDialog} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Nueva transacción
          </Button>
        }
      />

      {/* Exact Totals Strip across ALL matching filtered records */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="flex items-center justify-between gap-2 p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Ingresos filtrados
            </span>
            <MoneyDisplay
              cents={data.totals.incomeCents}
              tone="income"
              className="text-base font-semibold"
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="flex items-center justify-between gap-2 p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Gastos filtrados
            </span>
            <MoneyDisplay
              cents={data.totals.expenseCents}
              tone="expense"
              className="text-base font-semibold"
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="flex items-center justify-between gap-2 p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Flujo neto ({data.totals.count} mov.)
            </span>
            <MoneyDisplay
              cents={data.totals.netCents}
              tone="auto"
              showSign
              className="text-base font-semibold"
            />
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card className="border-border/80 bg-card shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Label htmlFor="tx-search" className="sr-only">
                Buscar por descripción o notas
              </Label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="tx-search"
                type="search"
                placeholder="Buscar por descripción o notas..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div>
              <Label htmlFor="tx-filter-type" className="sr-only">
                Filtrar por tipo
              </Label>
              <select
                id="tx-filter-type"
                aria-label="Filtrar por tipo"
                value={typeFilter}
                onChange={(e) => {
                  const nextType = e.target.value as "all" | TransactionType;
                  setTypeFilter(nextType);
                  setCategoryFilter("all");
                  setPage(1);
                }}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Todos los tipos</option>
                <option value="income">Solo ingresos</option>
                <option value="expense">Solo gastos</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tx-filter-category" className="sr-only">
                Filtrar por categoría
              </Label>
              <select
                id="tx-filter-category"
                aria-label="Filtrar por categoría"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Todas las categorías</option>
                {filterCategoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full gap-1.5"
                >
                  <FilterX className="size-4" aria-hidden="true" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
            <div className="space-y-1">
              <Label
                htmlFor="tx-filter-from"
                className="text-xs text-muted-foreground"
              >
                Desde
              </Label>
              <Input
                id="tx-filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="tx-filter-to"
                className="text-xs text-muted-foreground"
              >
                Hasta
              </Label>
              <Input
                id="tx-filter-to"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {activeError && !isLoading ? (
        <ErrorAlert
          title="No fue posible obtener tus transacciones"
          message={activeError}
          onRetry={
            !dateRangeError ? () => setReloadToken((n) => n + 1) : undefined
          }
        />
      ) : isLoading ? (
        <Card className="border-border/80 bg-card shadow-none">
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={
            hasActiveFilters
              ? "Sin resultados para los filtros actuales"
              : "Aún no tienes transacciones registradas"
          }
          description={
            hasActiveFilters
              ? "Prueba ampliando el rango de fechas o limpiando los filtros de búsqueda."
              : "Registra tu primer ingreso o gasto para activar tus balances, presupuestos y reportes reales."
          }
          action={
            hasActiveFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button type="button" onClick={openCreateDialog}>
                Registrar primera transacción
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <Card className="hidden border-border/80 bg-card shadow-none md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="pr-4 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                        {formatDateShort(tx.occurredOn)}
                      </TableCell>
                      <TableCell className="max-w-[260px] whitespace-normal">
                        <p className="truncate font-medium text-foreground">
                          {tx.description}
                        </p>
                        {tx.notes && (
                          <p className="truncate text-xs text-muted-foreground">
                            {tx.notes}
                          </p>
                        )}
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
                      <TableCell className="pr-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar transacción ${tx.description}`}
                            onClick={() => openEditDialog(tx)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar transacción ${tx.description}`}
                            className="text-muted-foreground hover:text-danger-text"
                            onClick={() => setDeletingTx(tx)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {data.items.map((tx) => (
              <Card
                key={tx.id}
                className="border-border/80 bg-card shadow-none"
              >
                <CardContent className="space-y-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <CategoryIcon
                        icon={tx.category.icon}
                        color={tx.category.color}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {tx.description}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
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
                  {tx.notes && (
                    <p className="text-xs text-muted-foreground">{tx.notes}</p>
                  )}
                  <div className="flex items-center justify-between border-t border-border/60 pt-2">
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
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tx)}
                      >
                        <Pencil className="mr-1 size-3.5" aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-danger-text hover:text-danger-text"
                        onClick={() => setDeletingTx(tx)}
                      >
                        <Trash2 className="mr-1 size-3.5" aria-hidden="true" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card px-4 py-3 text-xs text-muted-foreground">
            <span>
              Mostrando{" "}
              <strong className="text-foreground">{data.items.length}</strong>{" "}
              de{" "}
              <strong className="text-foreground">
                {data.pagination.totalCount}
              </strong>{" "}
              transacciones · Página{" "}
              <strong className="text-foreground">
                {data.pagination.page}
              </strong>{" "}
              de{" "}
              <strong className="text-foreground">
                {data.pagination.totalPages}
              </strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.pagination.page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 size-4" aria-hidden="true" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  data.pagination.page >= data.pagination.totalPages ||
                  isLoading
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="ml-1 size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Transaction Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setIsFormOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTx ? "Editar transacción" : "Nueva transacción"}
            </DialogTitle>
            <DialogDescription>
              {editingTx
                ? "Actualiza los detalles de este movimiento financiero."
                : "Registra un nuevo ingreso o gasto en dólares estadounidenses (USD)."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tx-type">Tipo</Label>
                <select
                  id="tx-type"
                  disabled={isSubmitting}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...form.register("type")}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Importe (USD)</Label>
                <Input
                  id="tx-amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.amount)}
                  aria-describedby={
                    form.formState.errors.amount ? "tx-amount-error" : undefined
                  }
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p
                    id="tx-amount-error"
                    role="alert"
                    className="text-xs text-danger-text"
                  >
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tx-category">Categoría</Label>
                <select
                  id="tx-category"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.categoryId)}
                  aria-describedby={
                    form.formState.errors.categoryId
                      ? "tx-category-error"
                      : undefined
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...form.register("categoryId")}
                >
                  {selectableCategories.length === 0 ? (
                    <option value="">Sin categorías disponibles</option>
                  ) : (
                    selectableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {form.formState.errors.categoryId && (
                  <p
                    id="tx-category-error"
                    role="alert"
                    className="text-xs text-danger-text"
                  >
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-date">Fecha</Label>
                <Input
                  id="tx-date"
                  type="date"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.occurredOn)}
                  aria-describedby={
                    form.formState.errors.occurredOn
                      ? "tx-date-error"
                      : undefined
                  }
                  {...form.register("occurredOn")}
                />
                {form.formState.errors.occurredOn && (
                  <p
                    id="tx-date-error"
                    role="alert"
                    className="text-xs text-danger-text"
                  >
                    {form.formState.errors.occurredOn.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-description">Descripción</Label>
              <Input
                id="tx-description"
                placeholder="Ej. Supermercado semanal, Pago de salario"
                maxLength={200}
                disabled={isSubmitting}
                aria-invalid={Boolean(form.formState.errors.description)}
                aria-describedby={
                  form.formState.errors.description
                    ? "tx-description-error"
                    : undefined
                }
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p
                  id="tx-description-error"
                  role="alert"
                  className="text-xs text-danger-text"
                >
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-notes">Notas (opcional)</Label>
              <Input
                id="tx-notes"
                placeholder="Detalles adicionales o referencia"
                maxLength={500}
                disabled={isSubmitting}
                aria-invalid={Boolean(form.formState.errors.notes)}
                aria-describedby={
                  form.formState.errors.notes ? "tx-notes-error" : undefined
                }
                {...form.register("notes")}
              />
              {form.formState.errors.notes && (
                <p
                  id="tx-notes-error"
                  role="alert"
                  className="text-xs text-danger-text"
                >
                  {form.formState.errors.notes.message}
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
                disabled={isSubmitting || selectableCategories.length === 0}
              >
                {isSubmitting && (
                  <Loader2
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editingTx ? "Guardar cambios" : "Registrar transacción"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingTx !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingTx(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar transacción</DialogTitle>
            <DialogDescription>
              {deletingTx
                ? `¿Confirmas que deseas eliminar "${deletingTx.description}"? Esta acción actualizará tu balance, presupuestos y reportes inmediatamente.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingTx(null)}
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
              Eliminar transacción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
