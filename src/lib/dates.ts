/**
 * Deterministic calendar date & period utilities anchored to America/El_Salvador (UTC-6, no DST).
 *
 * Conventions:
 * - Financial transaction dates are PostgreSQL DATE values (`YYYY-MM-DD`) treated strictly
 *   as calendar dates (never converted via local browser UTC offsets).
 * - Monthly ranges use inclusive start (`YYYY-MM-01`) and exclusive next-month start (`endExclusive`)
 *   to avoid end-of-month edge cases across 28/29/30/31-day months.
 * - Custom user date filters (`from`, `to`) treat BOTH endpoints as inclusive calendar dates
 *   and convert internally to `endExclusive = addDays(to, 1)` when needed.
 */

export const APP_TIMEZONE = "America/El_Salvador";
export const APP_LOCALE = "es-SV";

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY_REGEX = /^(\d{4})-(\d{2})$/;

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Validates that a YYYY-MM-DD string represents a real calendar date.
 */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

/**
 * Validates a YYYY-MM month key.
 */
export function isValidMonthKey(value: string): boolean {
  const match = MONTH_KEY_REGEX.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

/**
 * Validates that from <= to for inclusive ISO calendar date ranges.
 */
export function isValidDateRange(from: string, to: string): boolean {
  return isValidIsoDate(from) && isValidIsoDate(to) && from <= to;
}

/**
 * Resolves the current calendar date (YYYY-MM-DD) in America/El_Salvador.
 */
export function getCurrentDateInElSalvador(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("No se pudo resolver la fecha en America/El_Salvador.");
  }

  return `${year}-${month}-${day}`;
}

/**
 * Resolves the current month key (YYYY-MM) in America/El_Salvador.
 */
export function getCurrentMonthKey(now: Date = new Date()): string {
  return getCurrentDateInElSalvador(now).slice(0, 7);
}

function parseCalendarDate(isoDate: string): Date {
  if (!isValidIsoDate(isoDate)) {
    throw new RangeError(`Fecha calendario inválida: ${isoDate}`);
  }
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatUtcDateToIso(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds a signed number of calendar days to an ISO date without timezone drift.
 */
export function addCalendarDays(isoDate: string, days: number): string {
  const date = parseCalendarDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDateToIso(date);
}

/**
 * Adds a signed number of calendar months to a YYYY-MM key (handles year transitions).
 */
export function addMonths(monthKey: string, delta: number): string {
  if (!isValidMonthKey(monthKey)) {
    throw new RangeError(`Mes inválido: ${monthKey}`);
  }
  const [year, month] = monthKey.split("-").map(Number);
  const totalMonths = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = ((totalMonths % 12) + 12) % 12;
  return `${String(nextYear).padStart(4, "0")}-${String(nextMonth + 1).padStart(2, "0")}`;
}

/**
 * Enumerates all YYYY-MM months inclusively from startMonth to endMonth.
 */
export function enumerateMonths(startMonth: string, endMonth: string): string[] {
  if (!isValidMonthKey(startMonth) || !isValidMonthKey(endMonth)) {
    throw new RangeError(`Rango mensual inválido: ${startMonth} - ${endMonth}`);
  }
  if (startMonth > endMonth) {
    return [];
  }
  const result: string[] = [];
  let cursor = startMonth;
  while (cursor <= endMonth && result.length < 120) {
    result.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  return result;
}

export function formatDateShort(isoDate: string): string {
  return SHORT_DATE_FORMATTER.format(parseCalendarDate(isoDate));
}

export function formatDateLong(isoDate: string): string {
  return LONG_DATE_FORMATTER.format(parseCalendarDate(isoDate));
}

export function formatMonthLabel(monthKey: string): string {
  if (!isValidMonthKey(monthKey)) {
    throw new RangeError(`Mes inválido: ${monthKey}`);
  }
  const [year, month] = monthKey.split("-").map(Number);
  return capitalize(
    MONTH_LABEL_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1))),
  );
}

export function formatShortMonthLabel(monthKey: string): string {
  if (!isValidMonthKey(monthKey)) {
    throw new RangeError(`Mes inválido: ${monthKey}`);
  }
  const [year, month] = monthKey.split("-").map(Number);
  return capitalize(
    SHORT_MONTH_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1))),
  );
}

/**
 * Returns the exact inclusive first and last calendar date (YYYY-MM-DD) for a YYYY-MM month.
 */
export function getMonthBounds(monthKey: string): {
  start: string;
  end: string;
} {
  if (!isValidMonthKey(monthKey)) {
    throw new RangeError(`Mes inválido: ${monthKey}`);
  }
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const paddedMonth = String(month).padStart(2, "0");
  const paddedLastDay = String(lastDay).padStart(2, "0");

  return {
    start: `${year}-${paddedMonth}-01`,
    end: `${year}-${paddedMonth}-${paddedLastDay}`,
  };
}

/**
 * Returns a half-open monthly range [start, endExclusive) for exact PostgreSQL DATE filtering.
 */
export function getMonthRangeExclusiveEnd(monthKey: string): {
  start: string;
  endExclusive: string;
  endInclusive: string;
} {
  const { start, end } = getMonthBounds(monthKey);
  const nextMonth = addMonths(monthKey, 1);
  return {
    start,
    endExclusive: `${nextMonth}-01`,
    endInclusive: end,
  };
}

export interface ResolvedPeriodRange {
  periodKey: string;
  label: string;
  description: string;
  start: string; // inclusive YYYY-MM-DD
  endExclusive: string; // exclusive YYYY-MM-DD
  endInclusive: string; // inclusive YYYY-MM-DD
  chartStartMonth: string; // YYYY-MM
  chartEndMonth: string; // YYYY-MM
  previousRange: {
    start: string;
    endExclusive: string;
    endInclusive: string;
  } | null;
}

/**
 * Resolves standardized FinTrack period filters consistently across Dashboard and Reports.
 * - `current_month`: current calendar month in America/El_Salvador (includes transactions up to end of month; incomplete current month).
 * - `YYYY-MM`: specific calendar month.
 * - `last_3_months`: current month + 2 preceding calendar months (3 months total).
 * - `last_6_months`: current month + 5 preceding calendar months (6 months total).
 * - `current_year`: Jan 1 to Dec 31 of the current year in America/El_Salvador.
 */
export function resolvePeriodRange(
  period: string,
  now: Date = new Date(),
): ResolvedPeriodRange {
  const currentMonth = getCurrentMonthKey(now);
  const currentYear = currentMonth.slice(0, 4);

  if (period === "current_month") {
    const cur = getMonthRangeExclusiveEnd(currentMonth);
    const prevMonth = addMonths(currentMonth, -1);
    const prev = getMonthRangeExclusiveEnd(prevMonth);
    return {
      periodKey: "current_month",
      label: formatMonthLabel(currentMonth),
      description: `Mes en curso (${formatMonthLabel(currentMonth)}, parcial hasta la fecha)`,
      ...cur,
      chartStartMonth: addMonths(currentMonth, -5),
      chartEndMonth: currentMonth,
      previousRange: prev,
    };
  }

  if (period === "last_3_months") {
    const startMonth = addMonths(currentMonth, -2);
    const start = `${startMonth}-01`;
    const curEnd = getMonthRangeExclusiveEnd(currentMonth);
    const prevStartMonth = addMonths(startMonth, -3);
    const prevEndMonth = addMonths(startMonth, -1);
    const prevEnd = getMonthRangeExclusiveEnd(prevEndMonth);
    return {
      periodKey: "last_3_months",
      label: "Últimos 3 meses",
      description: `${formatShortMonthLabel(startMonth)} – ${formatShortMonthLabel(currentMonth)} (incluye mes en curso)`,
      start,
      endExclusive: curEnd.endExclusive,
      endInclusive: curEnd.endInclusive,
      chartStartMonth: startMonth,
      chartEndMonth: currentMonth,
      previousRange: {
        start: `${prevStartMonth}-01`,
        endExclusive: prevEnd.endExclusive,
        endInclusive: prevEnd.endInclusive,
      },
    };
  }

  if (period === "last_6_months") {
    const startMonth = addMonths(currentMonth, -5);
    const start = `${startMonth}-01`;
    const curEnd = getMonthRangeExclusiveEnd(currentMonth);
    const prevStartMonth = addMonths(startMonth, -6);
    const prevEndMonth = addMonths(startMonth, -1);
    const prevEnd = getMonthRangeExclusiveEnd(prevEndMonth);
    return {
      periodKey: "last_6_months",
      label: "Últimos 6 meses",
      description: `${formatShortMonthLabel(startMonth)} – ${formatShortMonthLabel(currentMonth)} (incluye mes en curso)`,
      start,
      endExclusive: curEnd.endExclusive,
      endInclusive: curEnd.endInclusive,
      chartStartMonth: startMonth,
      chartEndMonth: currentMonth,
      previousRange: {
        start: `${prevStartMonth}-01`,
        endExclusive: prevEnd.endExclusive,
        endInclusive: prevEnd.endInclusive,
      },
    };
  }

  if (period === "current_year") {
    const prevYear = String(Number(currentYear) - 1);
    const nextYear = String(Number(currentYear) + 1);
    return {
      periodKey: "current_year",
      label: `Año ${currentYear}`,
      description: `Enero – Diciembre ${currentYear} (año calendario en curso)`,
      start: `${currentYear}-01-01`,
      endExclusive: `${nextYear}-01-01`,
      endInclusive: `${currentYear}-12-31`,
      chartStartMonth: `${currentYear}-01`,
      chartEndMonth: currentMonth,
      previousRange: {
        start: `${prevYear}-01-01`,
        endExclusive: `${currentYear}-01-01`,
        endInclusive: `${prevYear}-12-31`,
      },
    };
  }

  if (isValidMonthKey(period)) {
    const cur = getMonthRangeExclusiveEnd(period);
    const prevMonth = addMonths(period, -1);
    const prev = getMonthRangeExclusiveEnd(prevMonth);
    return {
      periodKey: period,
      label: formatMonthLabel(period),
      description:
        period === currentMonth
          ? `Mes en curso (${formatMonthLabel(period)})`
          : `Mes completo (${formatMonthLabel(period)})`,
      ...cur,
      chartStartMonth: addMonths(period, -5),
      chartEndMonth: period,
      previousRange: prev,
    };
  }

  throw new RangeError(`Período inválido: ${period}`);
}

/**
 * Generates selectable recent monthly options (current month + N previous months).
 */
export function getRecentMonthOptions(
  count = 6,
  now: Date = new Date(),
): Array<{ value: string; label: string }> {
  const current = getCurrentMonthKey(now);
  return Array.from({ length: count }, (_, idx) => {
    const monthKey = addMonths(current, -idx);
    return {
      value: monthKey,
      label: formatMonthLabel(monthKey),
    };
  });
}
