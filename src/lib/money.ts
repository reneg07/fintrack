import type { BudgetStatus } from "@/types/domain";

/**
 * Maximum monetary value in cents supported safely below Number.MAX_SAFE_INTEGER.
 * 900,000,000,000,000 cents = $9,000,000,000,000.00 (9 trillion USD),
 * leaving headroom for multi-record aggregations without precision loss.
 */
export const MAX_SAFE_CENTS = 900_000_000_000_000;
export const MIN_POSITIVE_CENTS = 1;

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function assertSafeIntegerCents(cents: number, label = "cents"): void {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(
      `El valor de ${label} debe ser un entero seguro (recibido: ${String(cents)}).`,
    );
  }
  if (Math.abs(cents) > MAX_SAFE_CENTS) {
    throw new RangeError(
      `El valor de ${label} excede el límite monetario seguro permitido.`,
    );
  }
}

/**
 * Parses a USD amount (string or finite number) into exact integer cents
 * without binary floating-point multiplication errors (e.g. 19.99 -> 1999).
 */
export function dollarsToCents(input: string | number): number {
  let raw: string;

  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new RangeError("El importe debe ser un número finito.");
    }
    if (Math.abs(input) > MAX_SAFE_CENTS / 100) {
      throw new RangeError(
        "El importe excede el límite monetario seguro permitido.",
      );
    }
    // Convert finite number safely to fixed-precision string without scientific notation for normal ranges
    raw = input.toFixed(10).replace(/\.?0+$/, "");
  } else if (typeof input === "string") {
    raw = input.trim().replace(/^\$\s*/, "").replace(/,/g, "");
  } else {
    throw new TypeError("El importe debe ser una cadena o un número.");
  }

  if (raw.length === 0) {
    throw new RangeError("El importe es obligatorio.");
  }

  const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(raw);
  if (!match) {
    throw new RangeError("Formato de importe inválido.");
  }

  const [, sign, wholePart, fracPart = ""] = match;
  if (fracPart.length > 2) {
    throw new RangeError(
      "El importe solo puede tener hasta dos decimales (centavos).",
    );
  }

  const paddedFraction = fracPart.padEnd(2, "0");
  const centsBigInt = BigInt(wholePart) * 100n + BigInt(paddedFraction);

  if (centsBigInt > BigInt(MAX_SAFE_CENTS)) {
    throw new RangeError(
      "El importe excede el límite monetario seguro permitido.",
    );
  }

  const signedCents = sign ? -Number(centsBigInt) : Number(centsBigInt);
  assertSafeIntegerCents(signedCents, "importe");
  return signedCents;
}

/**
 * Parses a strictly positive USD amount (> 0) into integer cents.
 */
export function parsePositiveDollarsToCents(input: string | number): number {
  const cents = dollarsToCents(input);
  if (cents < MIN_POSITIVE_CENTS) {
    throw new RangeError("El importe debe ser mayor a $0.00.");
  }
  return cents;
}

/**
 * Converts safe integer cents into a 2-decimal USD number for external inputs/charts.
 */
export function centsToDollars(cents: number): number {
  assertSafeIntegerCents(cents);
  return Number((cents / 100).toFixed(2));
}

/**
 * Formats integer cents into a USD string (e.g. $1,250.50).
 */
export function formatCurrency(
  cents: number,
  options?: { showSign?: boolean; compact?: boolean },
): string {
  assertSafeIntegerCents(cents);
  const absDollars = Math.abs(cents) / 100;
  const formatted = options?.compact
    ? COMPACT_CURRENCY_FORMATTER.format(absDollars)
    : CURRENCY_FORMATTER.format(absDollars);

  if (cents < 0) {
    return `-${formatted}`;
  }
  if (cents > 0 && options?.showSign) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Sums an array of integer cent values safely with overflow protection.
 */
export function sumCents(values: readonly number[]): number {
  let total = 0n;
  for (const value of values) {
    assertSafeIntegerCents(value);
    total += BigInt(value);
    if (total > BigInt(MAX_SAFE_CENTS) || total < BigInt(-MAX_SAFE_CENTS)) {
      throw new RangeError(
        "La suma acumulada excede el límite monetario seguro permitido.",
      );
    }
  }
  return Number(total);
}

/**
 * Computes percentage of budget consumed (rounded to 1 decimal place).
 */
export function calculateBudgetPercentage(
  spentCents: number,
  limitCents: number,
): number {
  assertSafeIntegerCents(spentCents, "gasto");
  assertSafeIntegerCents(limitCents, "límite");
  if (limitCents <= 0) {
    throw new RangeError("El límite del presupuesto debe ser mayor a cero.");
  }
  if (spentCents <= 0) {
    return 0;
  }
  return Math.round((spentCents / limitCents) * 1000) / 10;
}

/**
 * Determines visual budget status given spent/limit cents and warning threshold.
 */
export function getBudgetStatus(
  spentCents: number,
  limitCents: number,
  alertThresholdPct = 80,
): BudgetStatus {
  const pct = calculateBudgetPercentage(spentCents, limitCents);
  if (pct >= 100) return "exceeded";
  if (pct >= alertThresholdPct) return "warning";
  return "healthy";
}
