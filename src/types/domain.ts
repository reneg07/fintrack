export type TransactionType = "income" | "expense";

/**
 * Canonical exact integer cents serialized as a base-10 string (e.g. "120000", "-5000", "18000000000000000").
 * Preserves full arbitrary precision across JSON boundaries even above Number.MAX_SAFE_INTEGER (ADR-011).
 */
export type ExactCents = string;

export type CategoryIconKey =
  | "briefcase"
  | "laptop"
  | "trending-up"
  | "wallet"
  | "utensils"
  | "home"
  | "car"
  | "zap"
  | "heart-pulse"
  | "film"
  | "graduation-cap"
  | "shopping-bag"
  | "tag";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: CategoryIconKey;
  isDefault: boolean;
}

export interface CategoryWithUsage extends Category {
  transactionsCount: number;
  budgetsCount: number;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  type: TransactionType;
  amountCents: number;
  occurredOn: string; // YYYY-MM-DD in America/El_Salvador
  description: string;
  notes?: string | null;
  createdAt?: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface PaginatedTransactionsResult {
  items: TransactionWithCategory[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  totals: {
    incomeCents: ExactCents;
    expenseCents: ExactCents;
    netCents: ExactCents;
    count: number;
  };
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM
  limitCents: number;
  alertThresholdPct: number;
}

export type BudgetStatus = "healthy" | "warning" | "limit_reached" | "exceeded";

export interface BudgetSummary extends Budget {
  category: Category;
  spentCents: number;
  remainingCents: number;
  percentage: number;
  status: BudgetStatus;
}

export interface ExactBudgetSummary extends Budget {
  category: Category;
  spentCents: ExactCents;
  remainingCents: ExactCents;
  exceededCents: ExactCents;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetsMonthPayload {
  month: string; // YYYY-MM
  monthLabel: string;
  items: ExactBudgetSummary[];
  summary: {
    totalLimitCents: ExactCents;
    totalSpentCents: ExactCents;
    totalRemainingCents: ExactCents;
    globalPercentage: number;
    healthyCount: number;
    warningCount: number;
    limitReachedCount: number;
    exceededCount: number;
  };
}

export interface MonthlyCashflowPoint {
  month: string; // YYYY-MM
  label: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
}

export interface ExactMonthlyCashflowPoint {
  month: string; // YYYY-MM
  label: string;
  incomeCents: ExactCents;
  expenseCents: ExactCents;
  netCents: ExactCents;
  /** Numeric plotting projections strictly for Recharts rendering — never source of truth */
  chartIncome: number;
  chartExpense: number;
  chartNet: number;
}

export interface CategoryExpensePoint {
  categoryId: string;
  name: string;
  color: string;
  icon: CategoryIconKey;
  amountCents: number;
  percentage: number;
}

export interface ExactCategoryExpensePoint {
  categoryId: string;
  name: string;
  color: string;
  icon: CategoryIconKey;
  amountCents: ExactCents;
  percentage: number;
  /** Numeric plotting projection strictly for Recharts rendering — never source of truth */
  chartAmount: number;
}

export type DashboardPeriodKey =
  | "current_month"
  | "last_3_months"
  | "last_6_months"
  | "current_year"
  | `${number}-${number}`;

export interface PeriodComparisonMetric {
  currentCents: ExactCents;
  previousCents: ExactCents;
  deltaCents: ExactCents;
  /** Percentage variation vs previous period, or null when previous base is 0 */
  changePct: number | null;
}

export interface DashboardPayload {
  period: string;
  periodLabel: string;
  periodDescription: string;
  range: {
    start: string;
    endExclusive: string;
    endInclusive: string;
  };
  kpis: {
    accumulatedBalanceCents: ExactCents;
    periodIncomeCents: ExactCents;
    periodExpenseCents: ExactCents;
    periodNetCents: ExactCents;
    periodTransactionCount: number;
    totalTransactionCount: number;
  };
  monthlySeries: ExactMonthlyCashflowPoint[];
  expenseBreakdown: ExactCategoryExpensePoint[];
  recentTransactions: TransactionWithCategory[];
}

export interface ReportsPayload {
  period: string;
  periodLabel: string;
  range: {
    start: string;
    endInclusive: string;
    endExclusive: string;
  };
  previousRange: {
    start: string;
    endInclusive: string;
  } | null;
  summary: {
    incomeCents: ExactCents;
    expenseCents: ExactCents;
    netCents: ExactCents;
    transactionCount: number;
  };
  comparisons: {
    income: PeriodComparisonMetric | null;
    expense: PeriodComparisonMetric | null;
    net: PeriodComparisonMetric | null;
  };
  monthlySeries: ExactMonthlyCashflowPoint[];
  expenseBreakdown: ExactCategoryExpensePoint[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  currency: "USD";
  timezone: "America/El_Salvador";
}
