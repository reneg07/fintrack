import { describe, expect, it } from "vitest";
import { isValidSameOrigin } from "@/lib/api-response";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { sanitizeNextPath } from "@/lib/redirects";
import { updateProfileSchema } from "@/schemas/profile.schema";

describe("security, redirect, auth error, and profile helpers", () => {
  it("allows safe internal redirect paths and blocks open-redirect attempts", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeNextPath("/transactions?type=expense")).toBe(
      "/transactions?type=expense",
    );
    expect(sanitizeNextPath("/settings")).toBe("/settings");

    // Open redirect & protocol attacks
    expect(sanitizeNextPath("//evil.com/phish")).toBe("/dashboard");
    expect(sanitizeNextPath("https://evil.com/dashboard")).toBe("/dashboard");
    expect(sanitizeNextPath("http://evil.com")).toBe("/dashboard");
    expect(sanitizeNextPath("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeNextPath("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeNextPath("/dashboard\r\nSet-Cookie: a=b")).toBe("/dashboard");
    expect(sanitizeNextPath("/unlisted-path")).toBe("/dashboard");
    expect(sanitizeNextPath(undefined)).toBe("/dashboard");
  });

  it("maps Supabase Auth errors to safe Spanish messages without leaking accounts", () => {
    const loginErr = mapAuthErrorMessage(
      { code: "invalid_credentials", message: "Invalid login credentials" },
      "login",
    );
    expect(loginErr).toContain("Correo o contraseña incorrectos");

    const unconfirmed = mapAuthErrorMessage(
      { code: "email_not_confirmed" },
      "login",
    );
    expect(unconfirmed.toLowerCase()).toContain("confirmar tu correo");

    const rateLimit = mapAuthErrorMessage({ status: 429 }, "login");
    expect(rateLimit.toLowerCase()).toContain("demasiados intentos");

    const callbackErr = mapAuthErrorMessage(
      { code: "callback_failed" },
      "callback",
    );
    expect(callbackErr.toLowerCase()).toContain("enlace de confirmación");
  });

  it("validates profile update payloads strictly with Zod", () => {
    expect(
      updateProfileSchema.safeParse({ fullName: "  Sofía Ramírez  " }).success,
    ).toBe(true);
    expect(updateProfileSchema.safeParse({ fullName: "A" }).success).toBe(
      false,
    );
    expect(
      updateProfileSchema.safeParse({ fullName: "a".repeat(101) }).success,
    ).toBe(false);
  });

  it("enforces same-origin checks for mutating cookie-authenticated requests", () => {
    const sameOriginReq = new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });
    expect(isValidSameOrigin(sameOriginReq)).toBe(true);

    const crossOriginReq = new Request("http://localhost:3000/api/profile", {
      method: "PATCH",
      headers: {
        host: "localhost:3000",
        origin: "https://attacker.example",
      },
    });
    expect(isValidSameOrigin(crossOriginReq)).toBe(false);

    const crossSiteFetchMetaReq = new Request(
      "http://localhost:3000/api/profile",
      {
        method: "PATCH",
        headers: {
          host: "localhost:3000",
          "sec-fetch-site": "cross-site",
        },
      },
    );
    expect(isValidSameOrigin(crossSiteFetchMetaReq)).toBe(false);
  });
});
