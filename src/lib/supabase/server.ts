import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Creates a fresh per-request Supabase Server Client bound to the current
 * Next.js 16 async cookie store. Never cache or share across requests.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called inside a Server Component where mutating response cookies is disallowed;
          // src/proxy.ts handles session cookie refresh on every request.
        }
      },
    },
  });
}
