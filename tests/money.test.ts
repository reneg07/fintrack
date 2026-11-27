import { describe, expect, it } from "vitest";
import {
  MAX_SAFE_CENTS,
  calculateBudgetPercentage,
  calculateComparisonPercentage,
  calculateExactBudgetMetrics,
  calculateExactBudgetPercentage,
  centsToDollars,
  centsToInputValue,
  dollarsToCents,
  exactCentsToChartNumber,
  exactCentsToDecimalString,
  formatCurrency,
  formatExactCurrency,
  getBudgetStatus,
  getExactBudgetStatus,
  parseExactCents,
  parsePositiveDollarsToCents,
  serializeExactCents,
  sumCents,
  sumExactCents,
} from "@/lib/money";

describe("money utilities (integer cents & ADR-011 BigInt precision)", () => {
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

  it("converts integer cents back to exact USD numbers and editing strings", () => {
    expect(centsToDollars(1)).toBe(0.01);
    expect(centsToDollars(1999)).toBe(19.99);
    expect(centsToDollars(100_000_050)).toBe(1_000_000.5);
    expect(centsToDollars(-4250)).toBe(-42.5);
    expect(centsToInputValue(1999)).toBe("19.99");
    expect(centsToInputValue(5)).toBe("0.05");
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

  it("sums safe cents and preserves arbitrary precision beyond Number.MAX_SAFE_INTEGER (ADR-011)", () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([1999, 1, 100_000_050])).toBe(100_002_050);
    expect(() => sumCents([MAX_SAFE_CENTS, 1])).toThrow();

    // 12 individual transactions at MAX_SAFE_CENTS + 1 cent = 10,800,000,000,000,001 cents (> 2^53 - 1)
    const hugeList = Array.from({ length: 12 }, () => MAX_SAFE_CENTS);
    hugeList.push(1);
    const total = sumExactCents(hugeList);
    expect(total > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(serializeExactCents(total)).toBe("10800000000000001");
    expect(exactCentsToDecimalString(total)).toBe("108000000000000.01");
    expect(formatExactCurrency(total)).toBe("$108,000,000,000,000.01");
    expect(formatExactCurrency(-total)).toBe("-$108,000,000,000,000.01");
    expect(formatExactCurrency(total, { showSign: true })).toBe(
      "+$108,000,000,000,000.01",
    );
    expect(parseExactCents("10800000000000001")).toBe(total);
    expect(Number.isFinite(exactCentsToChartNumber(total))).toBe(true);
  });

  it("classifies 4 exact budget states (healthy, warning, limit_reached, exceeded)", () => {
    expect(calculateBudgetPercentage(0, 10_000)).toBe(0);
    expect(calculateExactBudgetPercentage(12_000, 15_000)).toBe(80);
    expect(calculateExactBudgetPercentage(14_200, 12_000)).toBe(118.3);

    expect(getExactBudgetStatus(7_999, 10_000, 80)).toBe("healthy");
    expect(getExactBudgetStatus(8_000, 10_000, 80)).toBe("warning");
    expect(getExactBudgetStatus(9_999, 10_000, 80)).toBe("warning");
    expect(getExactBudgetStatus(10_000, 10_000, 80)).toBe("limit_reached");
    expect(getExactBudgetStatus(10_001, 10_000, 80)).toBe("exceeded");

    const metrics = calculateExactBudgetMetrics(12_000, 15_000, 80);
    expect(metrics).toEqual({
      spentCents: "12000",
      remainingCents: "3000",
      exceededCents: "0",
      percentage: 80,
      status: "warning",
    });

    const exceededMetrics = calculateExactBudgetMetrics(18_500, 15_000, 80);
    expect(exceededMetrics).toEqual({
      spentCents: "18500",
      remainingCents: "-3500",
      exceededCents: "3500",
      percentage: 123.3,
      status: "exceeded",
    });

    // Boundary display consistency: strictly below 100% never displays 100.0%, strictly above 100% never displays 100.0%
    expect(getExactBudgetStatus(99_999, 100_000, 80)).toBe("warning");
    expect(calculateExactBudgetPercentage(99_999, 100_000)).toBe(99.9);
    expect(getExactBudgetStatus(100_000, 100_000, 80)).toBe("limit_reached");
    expect(calculateExactBudgetPercentage(100_000, 100_000)).toBe(100);
    expect(getExactBudgetStatus(100_001, 100_000, 80)).toBe("exceeded");
    expect(calculateExactBudgetPercentage(100_001, 100_000)).toBe(100.1);

    // Legacy 3-state helper stays backward compatible
    expect(getBudgetStatus(10_000, 10_000, 80)).toBe("exceeded");
  });

  it("computes period comparison percentages safely and returns null when previous base is 0", () => {
    expect(calculateComparisonPercentage(100_000, 0)).toBeNull();
    expect(calculateComparisonPercentage(0, 0)).toBeNull();
    expect(calculateComparisonPercentage(150_000, 100_000)).toBe(50);
    expect(calculateComparisonPercentage(75_000, 100_000)).toBe(-25);
    expect(calculateComparisonPercentage(100_000, 100_000)).toBe(0);
  });
});
