import { z } from "zod";
import { CATEGORY_ICON_MAP } from "@/lib/category-icons";
import { transactionTypeSchema } from "@/schemas/common.schema";
import type { CategoryIconKey } from "@/types/domain";

const VALID_ICON_KEYS = Object.keys(CATEGORY_ICON_MAP) as [
  CategoryIconKey,
  ...CategoryIconKey[],
];

export const categoryColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color hexadecimal válido (#RRGGBB).")
  .transform((val) => val.toUpperCase());

export const categoryIconSchema = z.enum(VALID_ICON_KEYS, {
  error: "Selecciona un icono válido del catálogo.",
});

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Ingresa el nombre de la categoría.")
  .max(60, "El nombre no puede superar los 60 caracteres.")
  .transform((val) => val.replace(/\s+/g, " "));

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  type: transactionTypeSchema,
  color: categoryColorSchema,
  icon: categoryIconSchema,
});

export const updateCategorySchema = z
  .object({
    name: categoryNameSchema.optional(),
    type: transactionTypeSchema.optional(),
    color: categoryColorSchema.optional(),
    icon: categoryIconSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.type !== undefined ||
      data.color !== undefined ||
      data.icon !== undefined,
    { message: "Debes proporcionar al menos un campo para actualizar." },
  );

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>;
