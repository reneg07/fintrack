import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <BrandLogo className="mb-8" />
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <span
          aria-hidden="true"
          className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-emerald-50 text-success-text"
        >
          <Compass className="size-6" />
        </span>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-success-text">
          Error 404
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida. Regresa a la página
          principal o entra a tu panel financiero.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Ir al resumen
          </Link>
        </div>
      </div>
    </main>
  );
}
