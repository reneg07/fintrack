import type { Metadata } from "next";
import { TransactionsManager } from "@/components/transactions/transactions-manager";
import { listCategoriesWithUsage } from "@/services/categories.service";
import { listTransactions } from "@/services/transactions.service";
import type { PaginatedTransactionsResult } from "@/types/domain";

export const metadata: Metadata = {
  title: "Transacciones",
  description: "Gestión de ingresos y gastos en FinTrack.",
};

const EMPTY_TRANSACTIONS: PaginatedTransactionsResult = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  },
  totals: {
    incomeCents: "0",
    expenseCents: "0",
    netCents: "0",
    count: 0,
  },
};

interface TransactionsPageProps {
  searchParams: Promise<{ new?: string }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const [initialData, categories] = await Promise.all([
    listTransactions({ page: 1, pageSize: 10 }).catch(() => EMPTY_TRANSACTIONS),
    listCategoriesWithUsage().catch(() => []),
  ]);

  return (
    <TransactionsManager
      initialData={initialData}
      categories={categories}
      defaultOpenCreate={params.new === "1"}
    />
  );
}
