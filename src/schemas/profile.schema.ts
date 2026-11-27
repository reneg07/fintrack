import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(100, "El nombre completo no puede superar los 100 caracteres."),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
