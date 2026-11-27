"use client";

import { useEffect } from "react";
import { ErrorAlert } from "@/components/shared/error-alert";

export default function AppSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FinTrack app section error:", error);
  }, [error]);

  return (
    <div className="py-6">
      <ErrorAlert
        title="No pudimos cargar este módulo"
        message="Ocurrió un error inesperado al renderizar la vista financiera. Intenta recargar la sección."
        onRetry={reset}
      />
    </div>
  );
}
