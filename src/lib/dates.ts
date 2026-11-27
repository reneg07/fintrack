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

/**
 * Parses a calendar date YYYY-MM-DD into a UTC midnight Date without timezone drift.
 */
function parseCalendarDate(isoDate: string): Date {
  if (!isValidIsoDate(isoDate)) {
    throw new RangeError(`Fecha calendario inválida: ${isoDate}`);
  }
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
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
 * Returns the exact first and last calendar date (YYYY-MM-DD) for a YYYY-MM month.
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
