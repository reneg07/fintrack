import { exactCentsToDecimalString } from "@/lib/money";
import type { TransactionType } from "@/types/domain";

export interface CsvExportTransactionRow {
  occurredOn: string;
  type: TransactionType;
  categoryName: string;
  description: string;
  notes?: string | null;
  amountCents: number;
}

const FORMULA_TRIGGER_REGEX = /^[\s\u00A0]*[=+\-@\t\r\n]/;

/**
 * Neutralizes potential CSV Formula Injection (DDE / Excel / Calc formulas) on
 * user-controlled text fields, including payloads hidden behind leading whitespace
 * or control characters. Never call this on system-generated signed numeric columns.
 */
export function sanitizeCsvTextField(raw: string | null | undefined): string {
  if (!raw) return "";
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (FORMULA_TRIGGER_REGEX.test(normalized)) {
    return `'${normalized}`;
  }
  return normalized;
}

/**
 * Escapes a single CSV cell according to RFC 4180.
 */
export function escapeCsvCell(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats an exact signed USD decimal amount for CSV export:
 * - income: positive (e.g. "1000.00")
 * - expense: negative (e.g. "-120.00")
 * Preserves every single cent without floating-point conversion and without
 * adding formula-neutralizing quotes to legitimate negative numbers.
 */
export function formatCsvSignedUsdAmount(
  amountCents: number,
  type: TransactionType,
): string {
  const signed = type === "expense" ? -BigInt(amountCents) : BigInt(amountCents);
  return exactCentsToDecimalString(signed);
}

export const CSV_EXPORT_HEADERS = [
  "Fecha",
  "Tipo",
  "Categoría",
  "Descripción",
  "Notas",
  "Importe USD",
] as const;

/**
 * Serializes transactions into UTF-8 with BOM CSV (CRLF line endings) for
 * clean opening in Microsoft Excel, LibreOffice Calc, and Google Sheets.
 */
export function buildTransactionsCsv(
  rows: readonly CsvExportTransactionRow[],
): string {
  const lines: string[] = [
    CSV_EXPORT_HEADERS.map((header) => escapeCsvCell(header)).join(","),
  ];

  for (const row of rows) {
    const cells = [
      escapeCsvCell(row.occurredOn),
      escapeCsvCell(row.type === "income" ? "Ingreso" : "Gasto"),
      escapeCsvCell(sanitizeCsvTextField(row.categoryName)),
      escapeCsvCell(sanitizeCsvTextField(row.description)),
      escapeCsvCell(sanitizeCsvTextField(row.notes ?? "")),
      formatCsvSignedUsdAmount(row.amountCents, row.type),
    ];
    lines.push(cells.join(","));
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
