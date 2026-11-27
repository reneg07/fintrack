import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Administración de categorías de ingresos y gastos en FinTrack.",
};

export default function CategoriesPage() {
  return <CategoriesView />;
}
