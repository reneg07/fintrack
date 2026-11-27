"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, DollarSign, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { DEMO_USER } from "@/lib/demo-data";

export function SettingsView() {
  const [fullName, setFullName] = useState(DEMO_USER.fullName);

  function handleProfilePreviewSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    toast.info("Edición de perfil verificada (Fase 02)", {
      description:
        "La actualización real en la tabla profiles de Supabase se conectará en la Fase 04.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra la información básica de tu perfil, preferencias regionales y gestión de sesión."
      />

      <DemoNotice />

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
              onSubmit={handleProfilePreviewSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="settings-fullname">Nombre completo</Label>
                <Input
                  id="settings-fullname"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                  className="h-10 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Correo electrónico</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={DEMO_USER.email}
                  disabled
                  className="h-10 bg-secondary/60 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  El correo de acceso será gestionado por Supabase Auth a partir
                  de la Fase 03.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" className="h-9 px-4">
                  Guardar cambios
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
                Configuración fija del producto para consistencia contable.
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
                  {DEMO_USER.currency}
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
                  {DEMO_USER.timezone}
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
                En Fase 02 esta vista no mantiene ninguna sesión activa real.
                Las sesiones HTTP seguras y el cierre de sesión real se
                habilitarán en Fase 03.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="border-red-200 text-danger-text hover:bg-red-50 hover:text-danger-text"
                onClick={() =>
                  toast.info("Cierre de sesión disponible en Fase 03", {
                    description:
                      "No existe una sesión autenticada activa durante la Fase 02.",
                  })
                }
              >
                <LogOut className="size-4" aria-hidden="true" />
                Cerrar sesión
              </Button>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Ir a iniciar sesión
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
