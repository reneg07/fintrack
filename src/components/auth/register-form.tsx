"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/auth.schema";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phaseNoticeVisible, setPhaseNoticeVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit() {
    // Phase 02: strictly UI + Zod validation without fake accounts or localStorage persistence
    setPhaseNoticeVisible(true);
    toast.info("Formulario de registro validado", {
      description:
        "El registro real en Supabase Auth se habilitará en la Fase 03.",
    });
  }

  return (
    <Card className="border-border/90 bg-card shadow-none">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Crear cuenta
        </CardTitle>
        <CardDescription>
          Completa tus datos para preparar tu espacio personal en FinTrack.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-brand-dark"
        >
          <Info
            className="mt-0.5 size-4 shrink-0 text-success-text"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            <strong>Fase 02 (Interfaz y validación):</strong> las reglas de
            validación están activas, pero la creación real de cuentas con
            Supabase Auth se implementará en la Fase 03.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="register-name">Nombre completo</Label>
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              placeholder="Ej. María José Alvarado"
              aria-invalid={errors.fullName ? "true" : "false"}
              aria-describedby={
                errors.fullName ? "register-name-error" : undefined
              }
              className="h-10 bg-white"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p
                id="register-name-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-email">Correo electrónico</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="nombre@ejemplo.com"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              className="h-10 bg-white"
              {...register("email")}
            />
            {errors.email && (
              <p
                id="register-email-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-password">Contraseña</Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                enterKeyHint="next"
                placeholder="Mínimo 8 caracteres, letras y números"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={
                  errors.password ? "register-password-error" : undefined
                }
                className="h-10 bg-white pr-11"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="register-password-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-confirm-password">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                enterKeyHint="done"
                placeholder="Repite tu contraseña"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={
                  errors.confirmPassword
                    ? "register-confirm-password-error"
                    : undefined
                }
                className="h-10 bg-white pr-11"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación de contraseña"
                    : "Mostrar confirmación de contraseña"
                }
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="register-confirm-password-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {phaseNoticeVisible && (
            <Alert className="border-emerald-200 bg-emerald-50/80 text-brand-dark">
              <Lock className="size-4 text-success-text" aria-hidden="true" />
              <AlertTitle className="text-xs font-semibold">
                Validación correcta — Registro pendiente de Fase 03
              </AlertTitle>
              <AlertDescription className="text-xs text-brand-dark/90">
                No se ha creado ninguna cuenta ni se almacenaron tus datos.
                Puedes explorar la vista preliminar en{" "}
                <Link
                  href="/dashboard"
                  className="font-semibold underline underline-offset-2"
                >
                  /dashboard
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full text-sm font-medium"
          >
            Crear cuenta
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-background/60 px-6 py-4 text-center text-sm text-muted-foreground">
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-success-text underline-offset-4 hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
