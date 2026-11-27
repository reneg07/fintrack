import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";
import { listCategoriesWithUsage } from "@/services/categories.service";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Administra tus categorías de ingresos y gastos en FinTrack.",
};

export default async function CategoriesPage() {
  const categories = await listCategoriesWithUsage().catch(() => []);
  return <CategoriesView initialCategories={categories} />;
}
