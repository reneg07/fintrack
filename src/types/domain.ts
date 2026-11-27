export type TransactionType = "income" | "expense";

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

export interface Transaction {
  id: string;
  categoryId: string;
  type: TransactionType;
  amountCents: number;
  occurredOn: string; // YYYY-MM-DD in America/El_Salvador
  description: string;
  notes?: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM
  limitCents: number;
  alertThresholdPct: number;
}

export type BudgetStatus = "healthy" | "warning" | "exceeded";

export interface BudgetSummary extends Budget {
  category: Category;
  spentCents: number;
  remainingCents: number;
  percentage: number;
  status: BudgetStatus;
}

export interface MonthlyCashflowPoint {
  month: string; // YYYY-MM
  label: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
}

export interface CategoryExpensePoint {
  categoryId: string;
  name: string;
  color: string;
  icon: CategoryIconKey;
  amountCents: number;
  percentage: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  currency: "USD";
  timezone: "America/El_Salvador";
}
