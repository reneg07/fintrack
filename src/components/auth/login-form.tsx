"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

interface LoginFormProps {
  nextPath?: string;
  initialError?: string | null;
}

export function LoginForm({
  nextPath = "/dashboard",
  initialError = null,
}: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(initialError);

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

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setServerError(mapAuthErrorMessage(error, "login"));
        return;
      }

      toast.success("Sesión iniciada correctamente");
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      const fallbackMessage =
        err instanceof Error ? err.message : undefined;
      setServerError(
        mapAuthErrorMessage({ message: fallbackMessage }, "login"),
      );
    }
  }

  return (
    <Card className="border-border/90 bg-card shadow-none">
      <CardHeader className="space-y-1.5 pb-4">
        <h1 className="font-heading text-2xl leading-snug font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <CardDescription>
          Ingresa con tu correo electrónico y contraseña para acceder a tu panel
          financiero.
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
              No se pudo iniciar sesión
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
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="nombre@ejemplo.com"
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                id="login-password-error"
                className="text-xs font-medium text-danger-text"
              >
                {errors.password.message}
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
                Verificando credenciales...
              </>
            ) : (
              "Iniciar sesión"
            )}
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
