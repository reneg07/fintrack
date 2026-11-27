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
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [phaseNoticeVisible, setPhaseNoticeVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit() {
    // Phase 02: strictly UI + Zod validation without fake sessions or storage
    setPhaseNoticeVisible(true);
    toast.info("Validación de formulario verificada", {
      description:
        "La autenticación real con Supabase Auth se habilitará en la Fase 03.",
    });
  }

  return (
    <Card className="border-border/90 bg-card shadow-none">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </CardTitle>
        <CardDescription>
          Ingresa con tu correo electrónico y contraseña para acceder a tu panel
          financiero.
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
            <strong>Fase 02 (Interfaz y validación):</strong> este formulario
            valida los campos con Zod, pero la autenticación real con Supabase
            se integrará en la Fase 03.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="nombre@ejemplo.com"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className="h-10 bg-white"
              {...register("email")}
            />
            {errors.email && (
              <p
                id="login-email-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Contraseña</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                enterKeyHint="done"
                placeholder="Ingresa tu contraseña"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={
                  errors.password ? "login-password-error" : undefined
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
                id="login-password-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {phaseNoticeVisible && (
            <Alert className="border-emerald-200 bg-emerald-50/80 text-brand-dark">
              <Lock className="size-4 text-success-text" aria-hidden="true" />
              <AlertTitle className="text-xs font-semibold">
                Datos válidos — Conexión pendiente de Fase 03
              </AlertTitle>
              <AlertDescription className="text-xs text-brand-dark/90">
                No se ha creado ninguna sesión simulada ni se almacenó tu
                contraseña. Puedes revisar la vista preliminar en{" "}
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
            Iniciar sesión
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/80 bg-background/60 px-6 py-4 text-center text-sm text-muted-foreground">
        <p>
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold text-success-text underline-offset-4 hover:underline"
          >
            Crear una cuenta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
