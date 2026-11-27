import "server-only";

import { CATEGORY_ICON_MAP } from "@/lib/category-icons";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryIconKey } from "@/types/domain";

function toCategoryIconKey(value: string): CategoryIconKey {
  if (value in CATEGORY_ICON_MAP) {
    return value as CategoryIconKey;
  }
  return "tag";
}

/**
 * Reads the authenticated user's real categories from PostgreSQL (subject to RLS).
 * Used in Phase 03 to display the 12 automatically seeded initial categories.
 */
export async function getUserCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, icon, is_default")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: toCategoryIconKey(row.icon),
    isDefault: row.is_default,
  }));
}
