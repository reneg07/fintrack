import { z } from "zod";
import { isValidMonthKey } from "@/lib/dates";
import { isoDateSchema, uuidSchema } from "@/schemas/common.schema";

const PRESET_PERIODS = [
  "current_month",
  "last_3_months",
  "last_6_months",
  "current_year",
] as const;

export const periodParamSchema = z
  .string()
  .trim()
  .refine(
    (val) =>
      (PRESET_PERIODS as readonly string[]).includes(val) ||
      isValidMonthKey(val),
    {
      message:
        "Período inválido. Usa current_month, last_3_months, last_6_months, current_year o AAAA-MM.",
    },
  );

export const dashboardQuerySchema = z.object({
  period: periodParamSchema.optional().default("current_month"),
});

export const reportsQuerySchema = z
  .object({
    period: periodParamSchema.optional().default("last_6_months"),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .refine((data) => !(data.from && !data.to) && !(!data.from && data.to), {
    path: ["to"],
    message: "Debes indicar tanto la fecha inicial como la fecha final.",
  })
  .refine((data) => !(data.from && data.to && data.from > data.to), {
    path: ["to"],
    message: "La fecha final no puede ser anterior a la fecha inicial.",
  });

export const exportQuerySchema = z
  .object({
    period: periodParamSchema.optional(),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    type: z.enum(["all", "income", "expense"]).optional().default("all"),
    categoryId: z.union([z.literal("all"), uuidSchema]).optional().default("all"),
    q: z.string().trim().max(120).optional(),
  })
  .refine((data) => !(data.from && data.to && data.from > data.to), {
    path: ["to"],
    message: "La fecha final no puede ser anterior a la fecha inicial.",
  });
