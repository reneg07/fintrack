import "server-only";

import type { User } from "@supabase/supabase-js";
import {
  ServiceUnavailableError,
  UnauthorizedError,
} from "@/lib/service-errors";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedSupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

/**
 * Authoritatively verifies the current user via supabase.auth.getUser()
 * (never trusts getSession() on the server) and returns the RLS-scoped client.
 */
export async function requireAuthenticatedContext(): Promise<{
  supabase: AuthenticatedSupabaseClient;
  user: User;
}> {
  if (!isSupabaseConfigured()) {
    throw new ServiceUnavailableError();
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return { supabase, user };
}
