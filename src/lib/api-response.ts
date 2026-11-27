import { NextResponse } from "next/server";

export interface ApiEnvelope<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  } | null;
  meta?: Record<string, unknown>;
}

const PRIVATE_API_HEADERS = {
  "Cache-Control": "no-store, private, max-age=0",
  Vary: "Cookie",
} as const;

export function apiSuccess<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
): NextResponse<ApiEnvelope<T>> {
  const body: ApiEnvelope<T> = {
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status, headers: PRIVATE_API_HEADERS });
}

export function apiError(
  message: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>,
): NextResponse<ApiEnvelope<null>> {
  return NextResponse.json(
    {
      data: null,
      error: {
        message,
        ...(code ? { code } : {}),
        ...(details ? { details } : {}),
      },
    },
    { status, headers: PRIVATE_API_HEADERS },
  );
}

/**
 * Validates that a mutating Route Handler request originates from the same origin
 * as the application (CSRF defense-in-depth for cookie-authenticated endpoints).
 */
export function isValidSameOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    // Allow non-browser / same-origin clients that omit Origin, unless Sec-Fetch-Site says cross-site
    const fetchSite = request.headers.get("sec-fetch-site");
    return fetchSite !== "cross-site";
  }

  let originUrl: URL;
  try {
    originUrl = new URL(originHeader);
  } catch {
    return false;
  }

  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (hostHeader && originUrl.host === hostHeader) {
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      if (originUrl.origin === new URL(appUrl).origin) {
        return true;
      }
    } catch {
      // Ignore malformed env URL
    }
  }

  return false;
}
