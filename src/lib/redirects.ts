const ALLOWED_REDIRECT_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/reports",
  "/settings",
] as const;

/**
 * Strictly validates an internal post-authentication redirect path to prevent
 * open redirects (rejects protocol-relative URLs, external origins, backslashes,
 * control characters, and paths outside FinTrack's private app routes).
 */
export function sanitizeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw || typeof raw !== "string") return fallback;

  const trimmed = raw.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("\r") ||
    trimmed.includes("\n") ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed, "http://fintrack.local");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "http://fintrack.local") {
    return fallback;
  }

  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) =>
      parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
  );

  if (!isAllowed) {
    return fallback;
  }

  return `${parsed.pathname}${parsed.search}`;
}
