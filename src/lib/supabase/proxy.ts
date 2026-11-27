import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNextPath } from "@/lib/redirects";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
] as const;

const AUTH_ROUTES = ["/login", "/register"] as const;

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function buildRedirectWithCookies(
  targetUrl: URL,
  sourceResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(targetUrl);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  redirectResponse.headers.set("Cache-Control", "no-store, private");
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedPath = isProtectedRoute(pathname);
  const authPath = isAuthRoute(pathname);
  const apiPath = isApiRoute(pathname);

  // If Supabase env variables are not configured yet, protect private routes
  // gracefully without crashing public pages or returning HTML on /api/*.
  if (!isSupabaseConfigured()) {
    if (protectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "service_unavailable");
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("Cache-Control", "no-store, private");
      return res;
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Verify JWT signature & refresh expired cookies safely (never trust getSession() on server)
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);

  // API routes handle their own HTTP 401/403 JSON responses — never HTML redirect them
  if (apiPath) {
    supabaseResponse.headers.set("Cache-Control", "no-store, private");
    return supabaseResponse;
  }

  if (protectedPath && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const safeNext = sanitizeNextPath(`${pathname}${search}`);
    loginUrl.searchParams.set("next", safeNext);
    return buildRedirectWithCookies(loginUrl, supabaseResponse);
  }

  if (authPath && isAuthenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return buildRedirectWithCookies(dashboardUrl, supabaseResponse);
  }

  if (protectedPath) {
    supabaseResponse.headers.set("Cache-Control", "no-store, private");
  }

  return supabaseResponse;
}
