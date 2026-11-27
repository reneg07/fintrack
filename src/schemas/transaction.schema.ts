import { z } from "zod";
import { MAX_SAFE_CENTS } from "@/lib/money";
import {
  isoDateSchema,
  positiveMoneyInputSchema,
  transactionTypeSchema,
  uuidSchema,
} from "@/schemas/common.schema";

export const transactionFormSchema = z.object({
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  amount: positiveMoneyInputSchema,
  occurredOn: isoDateSchema,
  description: z
    .string()
    .trim()
    .min(1, "Ingresa una descripción para la transacción.")
    .max(200, "La descripción no puede superar los 200 caracteres."),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar los 500 caracteres.")
    .optional(),
});

export const createTransactionApiSchema = z.object({
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  amountCents: z
    .number()
    .int("El importe debe ser un número entero en centavos.")
    .min(1, "El importe debe ser mayor a $0.00.")
    .max(MAX_SAFE_CENTS, "El importe excede el límite monetario permitido."),
  occurredOn: isoDateSchema,
  description: z
    .string()
    .trim()
    .min(1, "Ingresa una descripción para la transacción.")
    .max(200, "La descripción no puede superar los 200 caracteres."),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas no pueden superar los 500 caracteres.")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export const updateTransactionApiSchema = createTransactionApiSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes proporcionar al menos un campo para actualizar.",
  });

export const transactionQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    type: z.enum(["all", "income", "expense"]).optional().default("all"),
    categoryId: z.union([z.literal("all"), uuidSchema]).optional().default("all"),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    page: z
      .string()
      .optional()
      .transform((val) => {
        const parsed = val ? Number.parseInt(val, 10) : 1;
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
      }),
    pageSize: z
      .string()
      .optional()
      .transform((val) => {
        const parsed = val ? Number.parseInt(val, 10) : 10;
        if (!Number.isFinite(parsed) || parsed < 1) return 10;
        return Math.min(parsed, 50);
      }),
  })
  .refine((data) => !(data.from && data.to && data.from > data.to), {
    path: ["to"],
    message: "La fecha final no puede ser anterior a la fecha inicial.",
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type CreateTransactionApiValues = z.infer<
  typeof createTransactionApiSchema
>;
export type UpdateTransactionApiValues = z.infer<
  typeof updateTransactionApiSchema
>;
export type TransactionQueryValues = z.infer<typeof transactionQuerySchema>;
