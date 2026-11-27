import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";
import { getUserCategories } from "@/services/categories.service";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Tus categorías de ingresos y gastos en FinTrack.",
};

export default async function CategoriesPage() {
  const categories = await getUserCategories();
  return <CategoriesView categories={categories} />;
}
