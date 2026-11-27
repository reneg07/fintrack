import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/shared/money-display";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  amountCents: number | string | bigint;
  tone?: "neutral" | "income" | "expense" | "auto";
  showSign?: boolean;
  helperText?: string;
  icon: LucideIcon;
  accent?: "default" | "emerald" | "danger" | "dark";
}

export function KpiCard({
  label,
  amountCents,
  tone = "neutral",
  showSign = false,
  helperText,
  icon: Icon,
  accent = "default",
}: KpiCardProps) {
  return (
    <Card className="border-border/80 bg-card shadow-none transition-colors hover:border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <div className="pt-1">
              <MoneyDisplay
                cents={amountCents}
                tone={tone}
                showSign={showSign}
                className="break-all text-2xl font-semibold sm:text-[1.65rem]"
              />
            </div>
          </div>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border",
              accent === "default" &&
                "border-border bg-secondary text-foreground",
              accent === "emerald" &&
                "border-emerald-200 bg-emerald-50 text-success-text",
              accent === "danger" &&
                "border-red-200 bg-red-50 text-danger-text",
              accent === "dark" &&
                "border-brand-dark/15 bg-brand-dark text-brand-accent",
            )}
          >
            <Icon className="size-4.5" />
          </span>
        </div>
        {helperText && (
          <p className="mt-3 text-xs text-muted-foreground">{helperText}</p>
        )}
      </CardContent>
    </Card>
  );
}
