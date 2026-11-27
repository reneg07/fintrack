import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  title = "Ocurrió un problema",
  message,
  onRetry,
}: ErrorAlertProps) {
  return (
    <Alert
      variant="destructive"
      className="border-red-200 bg-red-50/80 text-danger-text"
    >
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle className="font-semibold text-danger-text">{title}</AlertTitle>
      <AlertDescription className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-danger-text/90">{message}</span>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-fit border-red-300 bg-white text-danger-text hover:bg-red-50"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
