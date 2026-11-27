import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  cents: number;
  tone?: "neutral" | "income" | "expense" | "auto";
  showSign?: boolean;
  compact?: boolean;
  className?: string;
}

export function MoneyDisplay({
  cents,
  tone = "neutral",
  showSign = false,
  compact = false,
  className,
}: MoneyDisplayProps) {
  const resolvedTone =
    tone === "auto"
      ? cents > 0
        ? "income"
        : cents < 0
          ? "expense"
          : "neutral"
      : tone;

  const formatted = formatCurrency(cents, {
    showSign: showSign || resolvedTone === "income",
    compact,
  });

  return (
    <span
      className={cn(
        "font-mono tabular-nums tracking-tight",
        resolvedTone === "income" && "text-success-text",
        resolvedTone === "expense" && "text-danger-text",
        resolvedTone === "neutral" && "text-foreground",
        className,
      )}
    >
      {resolvedTone === "expense" && cents > 0 ? `-${formatted}` : formatted}
    </span>
  );
}
