import type { Metadata } from "next";
import { CategoriesView } from "@/components/categories/categories-view";
import { listCategoriesWithUsage } from "@/services/categories.service";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Administra tus categorías de ingresos y gastos en FinTrack.",
};

export default async function CategoriesPage() {
  const result = await listCategoriesWithUsage().then(
    (data) => ({ ok: true as const, data }),
    () => ({
      ok: false as const,
      message:
        "No fue posible cargar tus categorías desde el servidor. Intenta nuevamente.",
    }),
  );

  return (
    <CategoriesView
      initialCategories={result.ok ? result.data : []}
      initialError={result.ok ? null : result.message}
    />
  );
}
