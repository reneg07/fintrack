import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/money";
import type { BudgetStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  label: string;
  spentCents: number;
  limitCents: number;
  percentage: number;
  status: BudgetStatus;
  showAmounts?: boolean;
}

const STATUS_META: Record<
  BudgetStatus,
  {
    badgeText: string;
    badgeClass: string;
    barClass: string;
    Icon: typeof CheckCircle2;
  }
> = {
  healthy: {
    badgeText: "En control",
    badgeClass: "border-emerald-200 bg-emerald-50 text-success-text",
    barClass: "bg-brand-primary",
    Icon: CheckCircle2,
  },
  warning: {
    badgeText: "Cerca del límite",
    badgeClass: "border-amber-200 bg-amber-50 text-warning-text",
    barClass: "bg-warning",
    Icon: AlertTriangle,
  },
  exceeded: {
    badgeText: "Superado",
    badgeClass: "border-red-200 bg-red-50 text-danger-text",
    barClass: "bg-danger",
    Icon: OctagonAlert,
  },
};

export function BudgetProgress({
  label,
  spentCents,
  limitCents,
  percentage,
  status,
  showAmounts = true,
}: BudgetProgressProps) {
  const { badgeText, badgeClass, barClass, Icon } = STATUS_META[status];
  const clampedWidth = Math.min(Math.max(percentage, 0), 100);
  const remainingCents = limitCents - spentCents;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("gap-1 font-medium", badgeClass)}
        >
          <Icon className="size-3" aria-hidden="true" />
          {badgeText}
        </Badge>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Consumo de presupuesto para ${label}`}
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", barClass)}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>

      {showAmounts && (
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
          <span className="text-muted-foreground">
            Gastado:{" "}
            <strong className="font-mono font-medium tabular-nums text-foreground">
              {formatCurrency(spentCents)}
            </strong>{" "}
            de{" "}
            <span className="font-mono tabular-nums">
              {formatCurrency(limitCents)}
            </span>
          </span>
          <span
            className={cn(
              "font-mono font-medium tabular-nums",
              remainingCents < 0 ? "text-danger-text" : "text-muted-foreground",
            )}
          >
            {remainingCents >= 0
              ? `Disponible: ${formatCurrency(remainingCents)}`
              : `Excedido: ${formatCurrency(Math.abs(remainingCents))}`}
          </span>
        </div>
      )}
    </div>
  );
}
