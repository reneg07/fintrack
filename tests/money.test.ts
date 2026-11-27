import { describe, expect, it } from "vitest";
import {
  MAX_SAFE_CENTS,
  calculateBudgetPercentage,
  centsToDollars,
  dollarsToCents,
  formatCurrency,
  getBudgetStatus,
  parsePositiveDollarsToCents,
  sumCents,
} from "@/lib/money";

describe("money utilities (integer cents precision)", () => {
  it("converts exact USD values to integer cents without floating-point drift", () => {
    expect(dollarsToCents(0.01)).toBe(1);
    expect(dollarsToCents("0.01")).toBe(1);
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents("19.99")).toBe(1999);
    expect(dollarsToCents(1000000.5)).toBe(100_000_050);
    expect(dollarsToCents("1000000.50")).toBe(100_000_050);
    expect(dollarsToCents("$1,234.56")).toBe(123_456);
    expect(dollarsToCents("50")).toBe(5_000);
    expect(dollarsToCents("12.5")).toBe(1_250);
    expect(dollarsToCents("0")).toBe(0);
    expect(dollarsToCents("-19.99")).toBe(-1999);
  });

  it("enforces strictly positive amounts when parsing transaction inputs", () => {
    expect(parsePositiveDollarsToCents("0.01")).toBe(1);
    expect(parsePositiveDollarsToCents("19.99")).toBe(1999);
    expect(() => parsePositiveDollarsToCents("0")).toThrow();
    expect(() => parsePositiveDollarsToCents("0.00")).toThrow();
    expect(() => parsePositiveDollarsToCents("-5.00")).toThrow();
  });

  it("rejects invalid formats, >2 decimals, non-finite numbers, and unsafe limits", () => {
    expect(() => dollarsToCents("")).toThrow();
    expect(() => dollarsToCents("   ")).toThrow();
    expect(() => dollarsToCents("abc")).toThrow();
    expect(() => dollarsToCents("12.345")).toThrow();
    expect(() => dollarsToCents("10..20")).toThrow();
    expect(() => dollarsToCents(Number.NaN)).toThrow();
    expect(() => dollarsToCents(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => dollarsToCents((MAX_SAFE_CENTS + 100) / 100)).toThrow();
    expect(() => dollarsToCents("999999999999999999.99")).toThrow();
  });

  it("converts integer cents back to exact USD numbers and guards unsafe integers", () => {
    expect(centsToDollars(1)).toBe(0.01);
    expect(centsToDollars(1999)).toBe(19.99);
    expect(centsToDollars(100_000_050)).toBe(1_000_000.5);
    expect(centsToDollars(-4250)).toBe(-42.5);
    expect(() => centsToDollars(19.5)).toThrow();
    expect(() => centsToDollars(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });

  it("formats USD currency accurately including signs and negatives", () => {
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(1)).toBe("$0.01");
    expect(formatCurrency(1999)).toBe("$19.99");
    expect(formatCurrency(100_000_050)).toBe("$1,000,000.50");
    expect(formatCurrency(-1999)).toBe("-$19.99");
    expect(formatCurrency(1999, { showSign: true })).toBe("+$19.99");
  });

  it("sums cents safely and prevents overflow past MAX_SAFE_CENTS", () => {
    // Classic JS float trap: 0.1 + 0.2 === 0.30000000000000004
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([1999, 1, 100_000_050])).toBe(100_002_050);
    expect(() => sumCents([MAX_SAFE_CENTS, 1])).toThrow();
  });

  it("computes budget percentage and alert statuses accurately", () => {
    expect(calculateBudgetPercentage(0, 10_000)).toBe(0);
    expect(calculateBudgetPercentage(7_900, 10_000)).toBe(79);
    expect(calculateBudgetPercentage(8_000, 10_000)).toBe(80);
    expect(calculateBudgetPercentage(14_200, 12_000)).toBe(118.3);

    expect(getBudgetStatus(7_900, 10_000, 80)).toBe("healthy");
    expect(getBudgetStatus(8_000, 10_000, 80)).toBe("warning");
    expect(getBudgetStatus(10_000, 10_000, 80)).toBe("exceeded");
    expect(getBudgetStatus(14_200, 12_000, 80)).toBe("exceeded");
  });
});
