import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre completo (mínimo 2 caracteres).")
      .max(100, "El nombre no puede superar los 100 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "Ingresa tu correo electrónico.")
      .email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(72, "La contraseña no puede superar los 72 caracteres.")
      .regex(
        /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/,
        "Incluye al menos una letra en tu contraseña.",
      )
      .regex(/\d/, "Incluye al menos un número en tu contraseña."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
