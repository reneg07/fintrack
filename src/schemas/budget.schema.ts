import { z } from "zod";
import { MAX_SAFE_CENTS } from "@/lib/money";
import {
  monthKeySchema,
  positiveMoneyInputSchema,
  uuidSchema,
} from "@/schemas/common.schema";

export const budgetFormSchema = z.object({
  categoryId: uuidSchema,
  month: monthKeySchema,
  limit: positiveMoneyInputSchema,
  alertThresholdPct: z
    .string()
    .trim()
    .refine(
      (val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 50 && num <= 99;
      },
      { message: "El umbral de alerta debe estar entre 50% y 99%." },
    ),
});

export const createBudgetApiSchema = z.object({
  categoryId: uuidSchema,
  month: monthKeySchema,
  limitCents: z
    .number()
    .int("El límite debe ser un número entero en centavos.")
    .min(1, "El límite debe ser mayor a $0.00.")
    .max(MAX_SAFE_CENTS, "El límite excede el máximo monetario permitido."),
  alertThresholdPct: z
    .number()
    .int()
    .min(50, "El umbral mínimo de alerta es 50%.")
    .max(99, "El umbral máximo de alerta es 99%.")
    .default(80),
});

export const updateBudgetApiSchema = z
  .object({
    limitCents: z
      .number()
      .int("El límite debe ser un número entero en centavos.")
      .min(1, "El límite debe ser mayor a $0.00.")
      .max(MAX_SAFE_CENTS, "El límite excede el máximo monetario permitido.")
      .optional(),
    alertThresholdPct: z
      .number()
      .int()
      .min(50, "El umbral mínimo de alerta es 50%.")
      .max(99, "El umbral máximo de alerta es 99%.")
      .optional(),
  })
  .refine(
    (data) =>
      data.limitCents !== undefined || data.alertThresholdPct !== undefined,
    { message: "Debes proporcionar al menos un campo para actualizar." },
  );

export const budgetQuerySchema = z.object({
  month: monthKeySchema.optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CreateBudgetApiValues = z.infer<typeof createBudgetApiSchema>;
export type UpdateBudgetApiValues = z.infer<typeof updateBudgetApiSchema>;
