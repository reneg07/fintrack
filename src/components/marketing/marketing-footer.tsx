import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <BrandLogo showTagline />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Aplicación web de gestión de finanzas personales en dólares
            estadounidenses (USD), diseñada para registrar movimientos, definir
            presupuestos mensuales y analizar tu flujo de efectivo con claridad.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:gap-14">
          <div className="space-y-2.5">
            <h2 className="font-semibold text-foreground">Producto</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/#funcionalidades"
                  className="transition-colors hover:text-foreground"
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  href="/#como-funciona"
                  className="transition-colors hover:text-foreground"
                >
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/#seguridad"
                  className="transition-colors hover:text-foreground"
                >
                  Seguridad y privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground"
                >
                  Vista preliminar
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-semibold text-foreground">Acceso</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-foreground"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-foreground"
                >
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>FinTrack · Moneda USD · Zona horaria America/El_Salvador</p>
          <p>Proyecto académico Next.js · Desarrollo iterativo guiado por IA</p>
        </div>
      </div>
    </footer>
  );
}
