"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  DollarSign,
  Loader2,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/schemas/profile.schema";
import type { UserProfile } from "@/types/domain";

interface SettingsViewProps {
  profile: UserProfile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      fullName: profile.fullName,
    },
  });

  async function onSubmit(values: UpdateProfileValues) {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: values.fullName }),
      });

      const payload = (await response.json()) as {
        data?: { fullName?: string } | null;
        error?: { message?: string } | null;
      };

      if (!response.ok || !payload.data) {
        toast.error(
          payload.error?.message ?? "No se pudo actualizar tu perfil.",
        );
        return;
      }

      const updatedName = payload.data.fullName ?? values.fullName;
      reset({ fullName: updatedName });
      toast.success("Perfil actualizado correctamente");
      router.refresh();
    } catch {
      toast.error("Error de red al guardar los cambios del perfil.");
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) {
        toast.error("No se pudo cerrar la sesión.");
        return;
      }
      toast.success("Sesión cerrada correctamente");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Error de red al cerrar la sesión.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra la información de tu perfil, preferencias regionales y sesión activa."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Profile Card */}
        <Card className="border-border/80 bg-card shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-success-text"
              >
                <User className="size-4.5" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">
                  Información del perfil
                </CardTitle>
                <CardDescription>
                  Nombre visible en tu panel y reportes personales.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="settings-fullname">Nombre completo</Label>
                <Input
                  id="settings-fullname"
                  type="text"
                  autoComplete="name"
                  disabled={isSubmitting}
                  aria-invalid={errors.fullName ? "true" : "false"}
                  aria-describedby={
                    errors.fullName ? "settings-fullname-error" : undefined
                  }
                  className="h-10 bg-white"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p
                    id="settings-fullname-error"
                    className="text-xs font-medium text-danger-text"
                  >
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Correo electrónico</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-10 bg-secondary/60 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  El correo de acceso es administrado por tu cuenta de Supabase
                  Auth.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="h-9 px-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences & Session */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Preferencias regionales
              </CardTitle>
              <CardDescription>
                Configuración estándar de FinTrack para consistencia contable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <DollarSign
                    className="size-4 text-success-text"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Moneda principal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dólares estadounidenses
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 font-mono text-success-text"
                >
                  {profile.currency}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock
                    className="size-4 text-success-text"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Zona horaria de referencia
                    </p>
                    <p className="text-xs text-muted-foreground">
                      UTC-6 sin horario de verano
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {profile.timezone}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="size-4.5 text-success-text"
                  aria-hidden="true"
                />
                <CardTitle className="text-base font-semibold">
                  Gestión de sesión
                </CardTitle>
              </div>
              <CardDescription>
                Tu sesión está protegida por cookies HTTP y verificada en el
                servidor en cada solicitud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                disabled={signingOut}
                className="border-red-200 text-danger-text hover:bg-red-50 hover:text-danger-text"
                onClick={handleSignOut}
              >
                {signingOut ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="size-4" aria-hidden="true" />
                )}
                {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
