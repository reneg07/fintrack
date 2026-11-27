"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FinTrack global error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <BrandLogo className="mb-8" />
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <span
          aria-hidden="true"
          className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-red-50 text-danger-text"
        >
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="text-xl font-semibold text-foreground">
          Algo no salió como esperábamos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error inesperado al cargar esta vista. Puedes reintentar o
          volver al inicio de FinTrack.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Reintentar
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
