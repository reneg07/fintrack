import type { Metadata } from "next";
import { TransactionsView } from "@/components/transactions/transactions-view";

export const metadata: Metadata = {
  title: "Transacciones",
  description: "Gestión de ingresos y gastos en FinTrack.",
};

export default function TransactionsPage() {
  return <TransactionsView />;
}
