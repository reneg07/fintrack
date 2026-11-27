import type { BudgetStatus, ExactCents } from "@/types/domain";

/**
 * Maximum individual monetary value in cents aligned with PostgreSQL CHECK constraint:
 * 900,000,000,000,000 cents = $9,000,000,000,000.00 (safe below Number.MAX_SAFE_INTEGER).
 *
 * Accumulated totals across multiple transactions can exceed Number.MAX_SAFE_INTEGER,
 * so all aggregations use arbitrary-precision BigInt and serialize as ExactCents strings (ADR-011).
 */
export const MAX_SAFE_CENTS = 900_000_000_000_000;
export const MIN_POSITIVE_CENTS = 1;

const HUNDRED = BigInt(100);
const ZERO = BigInt(0);

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
 * Parses an ExactCents input (bigint, base-10 integer string, or safe integer number)
 * into arbitrary-precision BigInt without floating-point conversion.
 */
export function parseExactCents(value: bigint | string | number): bigint {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(
        `El valor numérico en centavos debe ser un entero seguro (recibido: ${String(value)}).`,
      );
    }
    return BigInt(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(trimmed)) {
      throw new RangeError(
        `Cadena de centavos exacta inválida: "${value}".`,
      );
    }
    return BigInt(trimmed);
  }
  throw new TypeError("Tipo de importe en centavos no soportado.");
}

export function serializeExactCents(cents: bigint): ExactCents {
  return cents.toString(10);
}

/**
 * Sums any number of cent values in arbitrary-precision BigInt.
 * Never overflows Number.MAX_SAFE_INTEGER.
 */
export function sumExactCents(
  values: readonly (number | bigint | string)[],
): bigint {
  let total = ZERO;
  for (const item of values) {
    total += parseExactCents(item);
  }
  return total;
}

/**
 * Converts arbitrary-precision integer cents to an exact 2-decimal string
 * without IEEE-754 floating-point division (e.g. 1999n -> "19.99", -5n -> "-0.05").
 */
export function exactCentsToDecimalString(
  cents: bigint | string | number,
): string {
  const value = parseExactCents(cents);
  const isNegative = value < ZERO;
  const abs = isNegative ? -value : value;
  const whole = abs / HUNDRED;
  const fraction = (abs % HUNDRED).toString(10).padStart(2, "0");
  return `${isNegative ? "-" : ""}${whole.toString(10)}.${fraction}`;
}

/**
 * Formats arbitrary-precision integer cents into an exact USD display string
 * preserving every single cent even beyond Number.MAX_SAFE_INTEGER (e.g. "$1,000,000.50").
 */
export function formatExactCurrency(
  cents: bigint | string | number,
  options?: { showSign?: boolean },
): string {
  const value = parseExactCents(cents);
  const isNegative = value < ZERO;
  const abs = isNegative ? -value : value;
  const whole = (abs / HUNDRED)
    .toString(10)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = (abs % HUNDRED).toString(10).padStart(2, "0");
  const core = `$${whole}.${fraction}`;

  if (isNegative) {
    return `-${core}`;
  }
  if (value > ZERO && options?.showSign) {
    return `+${core}`;
  }
  return core;
}

/**
 * Converts exact cents to a finite numeric USD projection STRICTLY for chart plotting
 * (Recharts axes/bars/slices). Never use this for KPIs, tables, tooltips, or CSV exports.
 */
export function exactCentsToChartNumber(
  cents: bigint | string | number,
): number {
  const decimal = exactCentsToDecimalString(cents);
  const numeric = Number(decimal);
  return Number.isFinite(numeric) ? numeric : 0;
}

/**
 * Formats an individual cent integer as a plain 2-decimal input string (e.g. "19.99")
 * for editing forms without floating-point drift.
 */
export function centsToInputValue(cents: number): string {
  assertSafeIntegerCents(cents);
  return exactCentsToDecimalString(BigInt(cents));
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
  const centsBigInt = BigInt(wholePart) * HUNDRED + BigInt(paddedFraction);

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
 * Converts safe integer cents into a 2-decimal USD number for legacy/local uses.
 */
export function centsToDollars(cents: number): number {
  assertSafeIntegerCents(cents);
  return Number(exactCentsToDecimalString(BigInt(cents)));
}

/**
 * Formats integer cents into a USD string (e.g. $1,250.50).
 */
export function formatCurrency(
  cents: number,
  options?: { showSign?: boolean; compact?: boolean },
): string {
  assertSafeIntegerCents(cents);
  if (options?.compact) {
    const absDollars = Math.abs(cents) / 100;
    const formatted = COMPACT_CURRENCY_FORMATTER.format(absDollars);
    if (cents < 0) return `-${formatted}`;
    if (cents > 0 && options.showSign) return `+${formatted}`;
    return formatted;
  }
  const absDollars = Math.abs(cents) / 100;
  const formatted = CURRENCY_FORMATTER.format(absDollars);
  if (cents < 0) return `-${formatted}`;
  if (cents > 0 && options?.showSign) return `+${formatted}`;
  return formatted;
}

/**
 * Sums an array of safe individual integer cent values with overflow guard.
 * For arbitrary-precision accumulations that may exceed MAX_SAFE_CENTS, use sumExactCents().
 */
export function sumCents(values: readonly number[]): number {
  let total = ZERO;
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
 * Computes exact budget consumption percentage (rounded to 1 decimal place) using BigInt arithmetic.
 * Guarantees visual display never contradicts exact status:
 * - strictly below limit (< 100%) never rounds up to 100.0% (capped at 99.9%)
 * - strictly above limit (> 100%) never rounds down to 100.0% (floored at 100.1%)
 * - 100.0% is returned exclusively when spent === limit.
 */
export function calculateExactBudgetPercentage(
  spentCents: bigint | string | number,
  limitCents: bigint | string | number,
): number {
  const spent = parseExactCents(spentCents);
  const limit = parseExactCents(limitCents);
  if (limit <= ZERO) {
    throw new RangeError("El límite del presupuesto debe ser mayor a cero.");
  }
  if (spent <= ZERO) {
    return 0;
  }
  if (spent === limit) {
    return 100;
  }
  // Round half-up to 1 decimal place using scaled BigInt: (spent * 1000 + limit/2) / limit
  const tenths = (spent * BigInt(1000) + limit / BigInt(2)) / limit;
  if (spent < limit && tenths >= BigInt(1000)) {
    return 99.9;
  }
  if (spent > limit && tenths <= BigInt(1000)) {
    return 100.1;
  }
  return Number(tenths) / 10;
}

/**
 * Exact 4-state budget classification using BigInt cross-multiplication (zero float drift):
 * - healthy: spent < threshold% of limit
 * - warning: spent >= threshold% of limit and spent < limit
 * - limit_reached: spent === limit (exact 100%)
 * - exceeded: spent > limit (> 100%)
 */
export function getExactBudgetStatus(
  spentCents: bigint | string | number,
  limitCents: bigint | string | number,
  alertThresholdPct = 80,
): BudgetStatus {
  const spent = parseExactCents(spentCents);
  const limit = parseExactCents(limitCents);
  if (limit <= ZERO) {
    throw new RangeError("El límite del presupuesto debe ser mayor a cero.");
  }
  if (spent > limit) return "exceeded";
  if (spent === limit) return "limit_reached";
  if (spent * HUNDRED >= limit * BigInt(alertThresholdPct)) return "warning";
  return "healthy";
}

export function calculateExactBudgetMetrics(
  spentCents: bigint | string | number,
  limitCents: bigint | string | number,
  alertThresholdPct = 80,
): {
  spentCents: ExactCents;
  remainingCents: ExactCents;
  exceededCents: ExactCents;
  percentage: number;
  status: BudgetStatus;
} {
  const spent = parseExactCents(spentCents);
  const limit = parseExactCents(limitCents);
  const remaining = limit - spent;
  const exceeded = spent > limit ? spent - limit : ZERO;

  return {
    spentCents: serializeExactCents(spent),
    remainingCents: serializeExactCents(remaining),
    exceededCents: serializeExactCents(exceeded),
    percentage: calculateExactBudgetPercentage(spent, limit),
    status: getExactBudgetStatus(spent, limit, alertThresholdPct),
  };
}

/**
 * Backward-compatible helpers used by Phase 02 demo utilities/tests.
 */
export function calculateBudgetPercentage(
  spentCents: number,
  limitCents: number,
): number {
  assertSafeIntegerCents(spentCents, "gasto");
  assertSafeIntegerCents(limitCents, "límite");
  return calculateExactBudgetPercentage(spentCents, limitCents);
}

export function getBudgetStatus(
  spentCents: number,
  limitCents: number,
  alertThresholdPct = 80,
): BudgetStatus {
  assertSafeIntegerCents(spentCents, "gasto");
  assertSafeIntegerCents(limitCents, "límite");
  const pct = calculateExactBudgetPercentage(spentCents, limitCents);
  if (pct >= 100) return "exceeded";
  if (pct >= alertThresholdPct) return "warning";
  return "healthy";
}

/**
 * Computes period-over-period percentage change rounded to 1 decimal place.
 * Returns null when previousCents === 0n (no valid comparison base; avoids Infinity / misleading percentages).
 */
export function calculateComparisonPercentage(
  currentCents: bigint | string | number,
  previousCents: bigint | string | number,
): number | null {
  const current = parseExactCents(currentCents);
  const previous = parseExactCents(previousCents);
  if (previous === ZERO) {
    return null;
  }
  const absPrevious = previous < ZERO ? -previous : previous;
  const delta = current - previous;
  const sign = delta < ZERO ? -1 : 1;
  const absDelta = delta < ZERO ? -delta : delta;
  const tenths =
    (absDelta * BigInt(1000) + absPrevious / BigInt(2)) / absPrevious;
  return (sign * Number(tenths)) / 10;
}
