import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNextPath } from "@/lib/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isAllowedOtpType(value: string | null): value is EmailOtpType {
  return Boolean(
    value && ALLOWED_OTP_TYPES.includes(value as EmailOtpType),
  );
}

function redirectToLoginError(request: NextRequest, errorCode: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("error", errorCode);
  const res = NextResponse.redirect(url);
  res.headers.set("Cache-Control", "no-store, private");
  return res;
}

/**
 * Handles Supabase Auth email confirmation & PKCE code exchange securely.
 * Supports both `?code=...` (PKCE) and `?token_hash=...&type=...` (OTP link).
 * Strictly sanitizes `?next=` to prevent open redirects.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return redirectToLoginError(request, "service_unavailable");
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const nextPath = sanitizeNextPath(searchParams.get("next"), "/dashboard");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = new URL(nextPath, request.nextUrl.origin);
      const res = NextResponse.redirect(target);
      res.headers.set("Cache-Control", "no-store, private");
      return res;
    }
    return redirectToLoginError(request, "callback_failed");
  }

  if (tokenHash && isAllowedOtpType(typeParam)) {
    const { error } = await supabase.auth.verifyOtp({
      type: typeParam,
      token_hash: tokenHash,
    });
    if (!error) {
      const target = new URL(nextPath, request.nextUrl.origin);
      const res = NextResponse.redirect(target);
      res.headers.set("Cache-Control", "no-store, private");
      return res;
    }
    return redirectToLoginError(request, "callback_failed");
  }

  return redirectToLoginError(request, "callback_invalid");
}
