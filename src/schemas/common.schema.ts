import { z } from "zod";
import { isValidIsoDate, isValidMonthKey } from "@/lib/dates";
import { parsePositiveDollarsToCents } from "@/lib/money";

export const uuidSchema = z
  .string()
  .uuid("El identificador proporcionado no es un UUID válido.");

export const transactionTypeSchema = z.enum(["income", "expense"], {
  error: "El tipo debe ser ingreso o gasto.",
});

export const isoDateSchema = z
  .string()
  .trim()
  .refine((val) => isValidIsoDate(val), {
    message: "Ingresa una fecha válida en formato AAAA-MM-DD.",
  });

export const monthKeySchema = z
  .string()
  .trim()
  .refine((val) => isValidMonthKey(val), {
    message: "Ingresa un mes válido en formato AAAA-MM.",
  });

export const positiveMoneyInputSchema = z
  .string()
  .trim()
  .min(1, "Ingresa un importe en USD.")
  .refine(
    (val) => {
      try {
        parsePositiveDollarsToCents(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message:
        "Ingresa un importe positivo válido con máximo dos decimales (ej. 19.99).",
    },
  );

export function formatZodFieldErrors(
  issues: readonly z.core.$ZodIssue[],
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}
