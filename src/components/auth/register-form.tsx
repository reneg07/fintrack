"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );

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

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setServerError(mapAuthErrorMessage(error, "register"));
        return;
      }

      // Email confirmation enabled: Supabase creates the user without an active session
      if (data.user && !data.session) {
        setConfirmationEmail(values.email);
        toast.success("Cuenta creada. Revisa tu correo para confirmarla.");
        return;
      }

      // Email confirmation disabled: session is immediately active
      toast.success("Cuenta creada e inicio de sesión completado");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const fallbackMessage =
        err instanceof Error ? err.message : undefined;
      setServerError(
        mapAuthErrorMessage({ message: fallbackMessage }, "register"),
      );
    }
  }

  if (confirmationEmail) {
    return (
      <Card className="border-border/90 bg-card shadow-none">
        <CardHeader className="space-y-2 pb-3 text-center">
          <span
            aria-hidden="true"
            className="mx-auto inline-flex size-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-success-text"
          >
            <MailCheck className="size-6" />
          </span>
          <h1 className="font-heading text-2xl leading-snug font-semibold tracking-tight">
            Confirma tu correo electrónico
          </h1>
          <CardDescription>
            Enviamos un enlace de verificación a{" "}
            <strong className="text-foreground">{confirmationEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            Abre el correo de confirmación y haz clic en el enlace para activar
            tu cuenta y entrar a tu panel de FinTrack.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 w-full",
            )}
          >
            Ir a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/90 bg-card shadow-none">
      <CardHeader className="space-y-1.5 pb-4">
        <h1 className="font-heading text-2xl leading-snug font-semibold tracking-tight">
          Crear cuenta
        </h1>
        <CardDescription>
          Completa tus datos para crear tu espacio personal en FinTrack.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {serverError && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50/80 text-danger-text"
          >
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertTitle className="text-xs font-semibold text-danger-text">
              No se pudo completar el registro
            </AlertTitle>
            <AlertDescription className="text-xs text-danger-text/90">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full text-sm font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
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
