import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

const HIGHLIGHTS = [
  "Registro rápido de ingresos y gastos en dólares (USD).",
  "Presupuestos mensuales con alertas antes de superar tu límite.",
  "Reportes comparativos y exportación de movimientos a CSV.",
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[440px_1fr]">
      {/* Brand panel on desktop */}
      <aside className="hidden flex-col justify-between bg-brand-dark p-10 text-white lg:flex">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
          >
            <BrandLogo variant="dark" showTagline />
          </Link>

          <div className="mt-14 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Claridad financiera sin hojas de cálculo dispersas
            </h2>
            <p className="text-sm leading-relaxed text-emerald-100/80">
              Administra tus movimientos diarios, organiza tus categorías y
              monitorea tus metas mensuales desde un solo lugar.
            </p>
          </div>

          <ul className="mt-8 space-y-3.5 text-sm text-emerald-50/90">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/12 pt-6 text-xs text-emerald-100/70">
          FinTrack · Moneda USD · Zona horaria America/El_Salvador
        </div>
      </aside>

      {/* Form column */}
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <div className="lg:hidden">
            <BrandLogo />
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
