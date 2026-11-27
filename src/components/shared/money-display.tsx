import {
  formatCurrency,
  formatExactCurrency,
  MAX_SAFE_CENTS,
  parseExactCents,
} from "@/lib/money";
import { cn } from "@/lib/utils";

const ZERO = BigInt(0);
const MAX_SAFE = BigInt(MAX_SAFE_CENTS);

interface MoneyDisplayProps {
  cents: number | string | bigint;
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
  const exactValue = parseExactCents(cents);

  const resolvedTone =
    tone === "auto"
      ? exactValue > ZERO
        ? "income"
        : exactValue < ZERO
          ? "expense"
          : "neutral"
      : tone;

  const shouldShowPlus = showSign || resolvedTone === "income";
  const absValue = exactValue < ZERO ? -exactValue : exactValue;

  const formatted =
    compact && absValue <= MAX_SAFE
      ? formatCurrency(Number(exactValue), {
          showSign: shouldShowPlus,
          compact: true,
        })
      : formatExactCurrency(exactValue, {
          showSign: shouldShowPlus,
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
      {resolvedTone === "expense" && exactValue > ZERO
        ? `-${formatted}`
        : formatted}
    </span>
  );
}
