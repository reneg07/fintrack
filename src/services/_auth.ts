import "server-only";

import { cache } from "react";
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
 * Per-request memoized authentication verification via React.cache().
 * Scoped strictly to a single Next.js server request (never shared across users/requests),
 * avoiding duplicate remote supabase.auth.getUser() round-trips between Route Handlers,
 * layouts, Server Components, and Services while preserving authoritative verification.
 */
const getCachedAuthenticatedContext = cache(async (): Promise<{
  supabase: AuthenticatedSupabaseClient;
  user: User;
}> => {
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
});

/**
 * Authoritatively verifies the current user via supabase.auth.getUser()
 * (never trusts getSession() on the server) and returns the RLS-scoped client.
 */
export async function requireAuthenticatedContext(): Promise<{
  supabase: AuthenticatedSupabaseClient;
  user: User;
}> {
  return getCachedAuthenticatedContext();
}
