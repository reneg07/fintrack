import { describe, expect, it } from "vitest";
import {
  buildTransactionsCsv,
  escapeCsvCell,
  formatCsvSignedUsdAmount,
  sanitizeCsvTextField,
} from "@/lib/csv";

describe("CSV export and Formula Injection protection", () => {
  it("neutralizes spreadsheet formula prefixes including leading whitespace", () => {
    expect(sanitizeCsvTextField("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvTextField("+cmd|' /C calc'!A0")).toBe(
      "'+cmd|' /C calc'!A0",
    );
    expect(sanitizeCsvTextField("-1+1")).toBe("'-1+1");
    expect(sanitizeCsvTextField("@SUM(1+1)")).toBe("'@SUM(1+1)");
    expect(sanitizeCsvTextField("\t=HYPERLINK(\"http://evil\")")).toBe(
      "'\t=HYPERLINK(\"http://evil\")",
    );
    expect(sanitizeCsvTextField("   =1+1")).toBe("'   =1+1");
    expect(sanitizeCsvTextField("Supermercado semanal")).toBe(
      "Supermercado semanal",
    );
    expect(sanitizeCsvTextField(null)).toBe("");
  });

  it("escapes RFC 4180 commas, quotes, and newlines properly", () => {
    expect(escapeCsvCell('Café, "especial"')).toBe('"Café, ""especial"""');
    expect(escapeCsvCell("Línea 1\nLínea 2")).toBe('"Línea 1\nLínea 2"');
    expect(escapeCsvCell("Simple")).toBe("Simple");
  });

  it("formats signed USD amounts accurately without mangling negative numbers", () => {
    expect(formatCsvSignedUsdAmount(100_000, "income")).toBe("1000.00");
    expect(formatCsvSignedUsdAmount(12_000, "expense")).toBe("-120.00");
    expect(formatCsvSignedUsdAmount(1, "expense")).toBe("-0.01");
  });

  it("builds UTF-8 BOM CRLF CSV with Spanish headers and sanitized cells", () => {
    const csv = buildTransactionsCsv([
      {
        occurredOn: "2026-07-05",
        type: "income",
        categoryName: "Salario",
        description: "Pago quincenal",
        notes: "Depósito regular",
        amountCents: 100_000,
      },
      {
        occurredOn: "2026-07-10",
        type: "expense",
        categoryName: "Alimentación",
        description: "=CMD|' /C calc'!A0, compra",
        notes: "  +1+1",
        amountCents: 12_000,
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    const lines = csv.slice(1).trimEnd().split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Fecha,Tipo,Categoría,Descripción,Notas,Importe USD");
    expect(lines[1]).toBe(
      "2026-07-05,Ingreso,Salario,Pago quincenal,Depósito regular,1000.00",
    );
    expect(lines[2]).toBe(
      "2026-07-10,Gasto,Alimentación,\"'=CMD|' /C calc'!A0, compra\",'  +1+1,-120.00",
    );
  });
});
