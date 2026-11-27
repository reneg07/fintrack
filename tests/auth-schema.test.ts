import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

describe("authentication Zod schemas", () => {
  it("validates a correct login payload and trims email whitespace", () => {
    const result = loginSchema.safeParse({
      email: "  usuario@ejemplo.com  ",
      password: "Password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("usuario@ejemplo.com");
    }
  });

  it("rejects invalid login emails and short passwords", () => {
    const badEmail = loginSchema.safeParse({
      email: "correo-invalido",
      password: "Password123",
    });
    expect(badEmail.success).toBe(false);

    const shortPass = loginSchema.safeParse({
      email: "usuario@ejemplo.com",
      password: "123",
    });
    expect(shortPass.success).toBe(false);
  });

  it("validates register payload with Unicode names and matching passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "María José Ñúñez",
      email: "maria@ejemplo.com",
      password: "MiClave2026",
      confirmPassword: "MiClave2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched confirmation passwords and weak passwords", () => {
    const mismatch = registerSchema.safeParse({
      fullName: "Carlos Méndez",
      email: "carlos@ejemplo.com",
      password: "MiClave2026",
      confirmPassword: "OtraClave2026",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(
        mismatch.error.issues.some(
          (issue) => issue.path[0] === "confirmPassword",
        ),
      ).toBe(true);
    }

    const noDigit = registerSchema.safeParse({
      fullName: "Carlos Méndez",
      email: "carlos@ejemplo.com",
      password: "SoloLetrasPassword",
      confirmPassword: "SoloLetrasPassword",
    });
    expect(noDigit.success).toBe(false);
  });
});
