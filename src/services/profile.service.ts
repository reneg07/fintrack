import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { UserProfile } from "@/types/domain";

export interface AuthenticatedUserProfile extends UserProfile {
  id: string;
  createdAt?: string;
}

/**
 * Authoritatively verifies the user on the server with supabase.auth.getUser()
 * (never getSession()) and reads the corresponding row from public.profiles.
 */
export async function getAuthenticatedProfile(): Promise<AuthenticatedUserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, currency, timezone, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  return {
    id: user.id,
    fullName: profile?.full_name || metaName || "Usuario FinTrack",
    email: user.email ?? "",
    currency: "USD",
    timezone: "America/El_Salvador",
    createdAt: profile?.created_at,
  };
}

export async function updateAuthenticatedProfileName(
  fullName: string,
): Promise<AuthenticatedUserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const cleanedName = fullName.trim();
  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: cleanedName })
    .eq("id", user.id)
    .select("id, full_name, currency, timezone, created_at")
    .single();

  if (updateError || !updated) {
    throw new Error("No se pudo actualizar el perfil en la base de datos.");
  }

  return {
    id: updated.id,
    fullName: updated.full_name,
    email: user.email ?? "",
    currency: "USD",
    timezone: "America/El_Salvador",
    createdAt: updated.created_at,
  };
}
