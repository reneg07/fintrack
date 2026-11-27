/**
 * Datos ficticios centralizados exclusivamente para validación visual en Fase 02.
 * Todos los totales, gráficos, balances y presupuestos se derivan matemáticamente
 * de este conjunto único de registros en centavos enteros.
 *
 * En las Fases 03 y 04 este módulo será sustituido por servicios reales de Supabase.
 */

import { formatShortMonthLabel } from "@/lib/dates";
import {
  calculateBudgetPercentage,
  getBudgetStatus,
  sumCents,
} from "@/lib/money";
import type {
  Budget,
  BudgetSummary,
  Category,
  CategoryExpensePoint,
  MonthlyCashflowPoint,
  Transaction,
  TransactionWithCategory,
  UserProfile,
} from "@/types/domain";

export const DEMO_USER: UserProfile = {
  fullName: "Elena Morales",
  email: "elena.demo@fintrack.local",
  currency: "USD",
  timezone: "America/El_Salvador",
};

export const DEMO_MONTHS = ["2026-09", "2026-10", "2026-11"] as const;
export type DemoMonth = (typeof DEMO_MONTHS)[number];

export const DEMO_ACTIVE_MONTH: DemoMonth = "2026-11";

export const DEMO_CATEGORIES: readonly Category[] = [
  // Income categories
  {
    id: "cat-inc-salary",
    name: "Salario",
    type: "income",
    color: "#059669",
    icon: "briefcase",
    isDefault: true,
  },
  {
    id: "cat-inc-freelance",
    name: "Freelance",
    type: "income",
    color: "#0D9488",
    icon: "laptop",
    isDefault: true,
  },
  {
    id: "cat-inc-investments",
    name: "Inversiones",
    type: "income",
    color: "#0284C7",
    icon: "trending-up",
    isDefault: true,
  },
  {
    id: "cat-inc-other",
    name: "Otros ingresos",
    type: "income",
    color: "#4F46E5",
    icon: "wallet",
    isDefault: true,
  },
  // Expense categories
  {
    id: "cat-exp-housing",
    name: "Vivienda",
    type: "expense",
    color: "#10251F",
    icon: "home",
    isDefault: true,
  },
  {
    id: "cat-exp-food",
    name: "Alimentación",
    type: "expense",
    color: "#D97706",
    icon: "utensils",
    isDefault: true,
  },
  {
    id: "cat-exp-transport",
    name: "Transporte",
    type: "expense",
    color: "#0284C7",
    icon: "car",
    isDefault: true,
  },
  {
    id: "cat-exp-utilities",
    name: "Servicios",
    type: "expense",
    color: "#4F46E5",
    icon: "zap",
    isDefault: true,
  },
  {
    id: "cat-exp-health",
    name: "Salud",
    type: "expense",
    color: "#DC5656",
    icon: "heart-pulse",
    isDefault: true,
  },
  {
    id: "cat-exp-entertainment",
    name: "Entretenimiento",
    type: "expense",
    color: "#EA580C",
    icon: "film",
    isDefault: true,
  },
  {
    id: "cat-exp-education",
    name: "Educación",
    type: "expense",
    color: "#0D9488",
    icon: "graduation-cap",
    isDefault: true,
  },
  {
    id: "cat-exp-shopping",
    name: "Compras personales",
    type: "expense",
    color: "#DB2777",
    icon: "shopping-bag",
    isDefault: false,
  },
] as const;

export const DEMO_TRANSACTIONS: readonly Transaction[] = [
  // ======================== NOVIEMBRE 2026 ========================
  {
    id: "tx-2026-11-01",
    categoryId: "cat-inc-salary",
    type: "income",
    amountCents: 240_000, // $2,400.00
    occurredOn: "2026-11-01",
    description: "Salario mensual neto",
    notes: "Depósito quincenal consolidado",
  },
  {
    id: "tx-2026-11-02",
    categoryId: "cat-exp-housing",
    type: "expense",
    amountCents: 65_000, // $650.00
    occurredOn: "2026-11-02",
    description: "Alquiler de apartamento",
  },
  {
    id: "tx-2026-11-03",
    categoryId: "cat-exp-utilities",
    type: "expense",
    amountCents: 11_850, // $118.50
    occurredOn: "2026-11-05",
    description: "Energía eléctrica, agua e internet",
  },
  {
    id: "tx-2026-11-04",
    categoryId: "cat-exp-food",
    type: "expense",
    amountCents: 18_425, // $184.25
    occurredOn: "2026-11-07",
    description: "Supermercado quincenal",
  },
  {
    id: "tx-2026-11-05",
    categoryId: "cat-exp-transport",
    type: "expense",
    amountCents: 8_500, // $85.00
    occurredOn: "2026-11-09",
    description: "Combustible y mantenimiento menor",
  },
  {
    id: "tx-2026-11-06",
    categoryId: "cat-inc-freelance",
    type: "income",
    amountCents: 48_500, // $485.00
    occurredOn: "2026-11-12",
    description: "Consultoría de diseño web",
    notes: "Entregable fase de prototipo",
  },
  {
    id: "tx-2026-11-07",
    categoryId: "cat-exp-education",
    type: "expense",
    amountCents: 9_500, // $95.00
    occurredOn: "2026-11-14",
    description: "Curso de arquitectura en la nube",
  },
  {
    id: "tx-2026-11-08",
    categoryId: "cat-exp-food",
    type: "expense",
    amountCents: 15_975, // $159.75
    occurredOn: "2026-11-18",
    description: "Mercado fresco y despensa",
  },
  {
    id: "tx-2026-11-09",
    categoryId: "cat-exp-entertainment",
    type: "expense",
    amountCents: 14_200, // $142.00
    occurredOn: "2026-11-20",
    description: "Cena con amigos y entradas al cine",
  },
  {
    id: "tx-2026-11-10",
    categoryId: "cat-exp-health",
    type: "expense",
    amountCents: 7_800, // $78.00
    occurredOn: "2026-11-21",
    description: "Consulta odontológica y farmacia",
  },
  {
    id: "tx-2026-11-11",
    categoryId: "cat-inc-investments",
    type: "income",
    amountCents: 12_500, // $125.00
    occurredOn: "2026-11-23",
    description: "Rendimiento de fondo de ahorro",
  },
  {
    id: "tx-2026-11-12",
    categoryId: "cat-exp-transport",
    type: "expense",
    amountCents: 6_450, // $64.50
    occurredOn: "2026-11-24",
    description: "Combustible semanal y parqueos",
  },
  {
    id: "tx-2026-11-13",
    categoryId: "cat-exp-shopping",
    type: "expense",
    amountCents: 11_200, // $112.00
    occurredOn: "2026-11-25",
    description: "Accesorios de escritorio",
  },

  // ======================== OCTUBRE 2026 ========================
  {
    id: "tx-2026-10-01",
    categoryId: "cat-inc-salary",
    type: "income",
    amountCents: 240_000, // $2,400.00
    occurredOn: "2026-10-01",
    description: "Salario mensual neto",
  },
  {
    id: "tx-2026-10-02",
    categoryId: "cat-exp-housing",
    type: "expense",
    amountCents: 65_000, // $650.00
    occurredOn: "2026-10-02",
    description: "Alquiler de apartamento",
  },
  {
    id: "tx-2026-10-03",
    categoryId: "cat-exp-utilities",
    type: "expense",
    amountCents: 11_200, // $112.00
    occurredOn: "2026-10-06",
    description: "Servicios básicos del hogar",
  },
  {
    id: "tx-2026-10-04",
    categoryId: "cat-exp-food",
    type: "expense",
    amountCents: 31_400, // $314.00
    occurredOn: "2026-10-12",
    description: "Compras de alimentación del mes",
  },
  {
    id: "tx-2026-10-05",
    categoryId: "cat-inc-freelance",
    type: "income",
    amountCents: 32_000, // $320.00
    occurredOn: "2026-10-15",
    description: "Auditoría UX de sitio corporativo",
  },
  {
    id: "tx-2026-10-06",
    categoryId: "cat-exp-transport",
    type: "expense",
    amountCents: 13_800, // $138.00
    occurredOn: "2026-10-19",
    description: "Combustible y transporte urbano",
  },
  {
    id: "tx-2026-10-07",
    categoryId: "cat-exp-entertainment",
    type: "expense",
    amountCents: 9_600, // $96.00
    occurredOn: "2026-10-22",
    description: "Streaming y salidas de fin de semana",
  },
  {
    id: "tx-2026-10-08",
    categoryId: "cat-exp-health",
    type: "expense",
    amountCents: 6_500, // $65.00
    occurredOn: "2026-10-27",
    description: "Exámenes preventivos",
  },

  // ======================== SEPTIEMBRE 2026 ========================
  {
    id: "tx-2026-09-01",
    categoryId: "cat-inc-salary",
    type: "income",
    amountCents: 240_000, // $2,400.00
    occurredOn: "2026-09-01",
    description: "Salario mensual neto",
  },
  {
    id: "tx-2026-09-02",
    categoryId: "cat-exp-housing",
    type: "expense",
    amountCents: 65_000, // $650.00
    occurredOn: "2026-09-02",
    description: "Alquiler de apartamento",
  },
  {
    id: "tx-2026-09-03",
    categoryId: "cat-exp-food",
    type: "expense",
    amountCents: 36_800, // $368.00
    occurredOn: "2026-09-14",
    description: "Supermercado y restaurantes",
  },
  {
    id: "tx-2026-09-04",
    categoryId: "cat-exp-utilities",
    type: "expense",
    amountCents: 12_100, // $121.00
    occurredOn: "2026-09-16",
    description: "Energía eléctrica e internet",
  },
  {
    id: "tx-2026-09-05",
    categoryId: "cat-exp-transport",
    type: "expense",
    amountCents: 14_500, // $145.00
    occurredOn: "2026-09-21",
    description: "Combustible mensual",
  },
  {
    id: "tx-2026-09-06",
    categoryId: "cat-inc-other",
    type: "income",
    amountCents: 18_000, // $180.00
    occurredOn: "2026-09-25",
    description: "Reembolso de gastos profesionales",
  },
  {
    id: "tx-2026-09-07",
    categoryId: "cat-exp-education",
    type: "expense",
    amountCents: 11_000, // $110.00
    occurredOn: "2026-09-28",
    description: "Libros técnicos y certificaciones",
  },
] as const;

export const DEMO_BUDGETS: readonly Budget[] = [
  // Noviembre 2026 — incluye estados saludable (<80%), advertencia (80%-99%) y superado (>=100%)
  {
    id: "bud-2026-11-housing",
    categoryId: "cat-exp-housing",
    month: "2026-11",
    limitCents: 70_000, // $700.00 (gastado $650.00 -> 92.9% advertencia)
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-11-food",
    categoryId: "cat-exp-food",
    month: "2026-11",
    limitCents: 40_000, // $400.00 (gastado $344.00 -> 86.0% advertencia)
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-11-transport",
    categoryId: "cat-exp-transport",
    month: "2026-11",
    limitCents: 20_000, // $200.00 (gastado $149.50 -> 74.8% saludable)
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-11-utilities",
    categoryId: "cat-exp-utilities",
    month: "2026-11",
    limitCents: 15_000, // $150.00 (gastado $118.50 -> 79.0% saludable)
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-11-entertainment",
    categoryId: "cat-exp-entertainment",
    month: "2026-11",
    limitCents: 12_000, // $120.00 (gastado $142.00 -> 118.3% superado)
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-11-health",
    categoryId: "cat-exp-health",
    month: "2026-11",
    limitCents: 15_000, // $150.00 (gastado $78.00 -> 52.0% saludable)
    alertThresholdPct: 80,
  },
  // Octubre 2026
  {
    id: "bud-2026-10-housing",
    categoryId: "cat-exp-housing",
    month: "2026-10",
    limitCents: 70_000,
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-10-food",
    categoryId: "cat-exp-food",
    month: "2026-10",
    limitCents: 40_000,
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-10-transport",
    categoryId: "cat-exp-transport",
    month: "2026-10",
    limitCents: 18_000,
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-10-entertainment",
    categoryId: "cat-exp-entertainment",
    month: "2026-10",
    limitCents: 12_000,
    alertThresholdPct: 80,
  },
  // Septiembre 2026
  {
    id: "bud-2026-09-housing",
    categoryId: "cat-exp-housing",
    month: "2026-09",
    limitCents: 70_000,
    alertThresholdPct: 80,
  },
  {
    id: "bud-2026-09-food",
    categoryId: "cat-exp-food",
    month: "2026-09",
    limitCents: 35_000, // gastado $368.00 -> superado
    alertThresholdPct: 80,
  },
] as const;

const CATEGORY_MAP = new Map<string, Category>(
  DEMO_CATEGORIES.map((category) => [category.id, category]),
);

export function getDemoCategoryById(id: string): Category {
  const category = CATEGORY_MAP.get(id);
  if (!category) {
    throw new Error(`Categoría de demostración no encontrada: ${id}`);
  }
  return category;
}

export function getDemoTransactionsWithCategories(): TransactionWithCategory[] {
  return [...DEMO_TRANSACTIONS]
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
    .map((tx) => ({
      ...tx,
      category: getDemoCategoryById(tx.categoryId),
    }));
}

export function getDemoPeriodMetrics(period: DemoMonth | "all") {
  const allTx = getDemoTransactionsWithCategories();
  const filteredTx =
    period === "all"
      ? allTx
      : allTx.filter((tx) => tx.occurredOn.startsWith(period));

  const accumulatedIncomeCents = sumCents(
    allTx.filter((t) => t.type === "income").map((t) => t.amountCents),
  );
  const accumulatedExpenseCents = sumCents(
    allTx.filter((t) => t.type === "expense").map((t) => t.amountCents),
  );
  const accumulatedBalanceCents =
    accumulatedIncomeCents - accumulatedExpenseCents;

  const periodIncomeCents = sumCents(
    filteredTx.filter((t) => t.type === "income").map((t) => t.amountCents),
  );
  const periodExpenseCents = sumCents(
    filteredTx.filter((t) => t.type === "expense").map((t) => t.amountCents),
  );
  const cashflowCents = periodIncomeCents - periodExpenseCents;

  return {
    accumulatedBalanceCents,
    periodIncomeCents,
    periodExpenseCents,
    cashflowCents,
    recentTransactions: filteredTx.slice(0, 6),
    transactionCount: filteredTx.length,
  };
}

export function getDemoMonthlyCashflowSeries(): MonthlyCashflowPoint[] {
  return DEMO_MONTHS.map((month) => {
    const monthTx = DEMO_TRANSACTIONS.filter((t) =>
      t.occurredOn.startsWith(month),
    );
    const incomeCents = sumCents(
      monthTx.filter((t) => t.type === "income").map((t) => t.amountCents),
    );
    const expenseCents = sumCents(
      monthTx.filter((t) => t.type === "expense").map((t) => t.amountCents),
    );

    return {
      month,
      label: formatShortMonthLabel(month),
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
    };
  });
}

export function getDemoExpenseBreakdown(
  period: DemoMonth | "all",
): CategoryExpensePoint[] {
  const expenses = DEMO_TRANSACTIONS.filter(
    (t) =>
      t.type === "expense" &&
      (period === "all" || t.occurredOn.startsWith(period)),
  );
  const totalExpenses = sumCents(expenses.map((t) => t.amountCents));

  const grouped = new Map<string, number>();
  for (const tx of expenses) {
    grouped.set(
      tx.categoryId,
      (grouped.get(tx.categoryId) ?? 0) + tx.amountCents,
    );
  }

  return Array.from(grouped.entries())
    .map(([categoryId, amountCents]) => {
      const category = getDemoCategoryById(categoryId);
      const percentage =
        totalExpenses > 0
          ? Math.round((amountCents / totalExpenses) * 1000) / 10
          : 0;
      return {
        categoryId,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amountCents,
        percentage,
      };
    })
    .sort((a, b) => b.amountCents - a.amountCents);
}

export function getDemoBudgetSummaries(month: DemoMonth): BudgetSummary[] {
  const monthBudgets = DEMO_BUDGETS.filter((b) => b.month === month);
  const monthExpenses = DEMO_TRANSACTIONS.filter(
    (t) => t.type === "expense" && t.occurredOn.startsWith(month),
  );

  return monthBudgets.map((budget) => {
    const spentCents = sumCents(
      monthExpenses
        .filter((t) => t.categoryId === budget.categoryId)
        .map((t) => t.amountCents),
    );
    const percentage = calculateBudgetPercentage(spentCents, budget.limitCents);
    const status = getBudgetStatus(
      spentCents,
      budget.limitCents,
      budget.alertThresholdPct,
    );
    return {
      ...budget,
      category: getDemoCategoryById(budget.categoryId),
      spentCents,
      remainingCents: budget.limitCents - spentCents,
      percentage,
      status,
    };
  });
}

export function getDemoCategoryUsageCount(categoryId: string): {
  transactions: number;
  budgets: number;
} {
  return {
    transactions: DEMO_TRANSACTIONS.filter((t) => t.categoryId === categoryId)
      .length,
    budgets: DEMO_BUDGETS.filter((b) => b.categoryId === categoryId).length,
  };
}
