import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  addMonths,
  enumerateMonths,
  formatDateLong,
  formatDateShort,
  formatMonthLabel,
  getCurrentDateInElSalvador,
  getCurrentMonthKey,
  getMonthBounds,
  getMonthRangeExclusiveEnd,
  isValidDateRange,
  isValidIsoDate,
  isValidMonthKey,
  resolvePeriodRange,
} from "@/lib/dates";

describe("date utilities (America/El_Salvador)", () => {
  it("resolves calendar date in America/El_Salvador across UTC midnight boundary", () => {
    const utcAfterMidnight = new Date("2026-11-27T04:15:00.000Z");
    expect(getCurrentDateInElSalvador(utcAfterMidnight)).toBe("2026-11-26");
    expect(getCurrentMonthKey(utcAfterMidnight)).toBe("2026-11");

    const utcNewMonth = new Date("2026-12-01T05:59:59.000Z");
    expect(getCurrentDateInElSalvador(utcNewMonth)).toBe("2026-11-30");
    expect(getCurrentMonthKey(utcNewMonth)).toBe("2026-11");
  });

  it("validates real ISO calendar dates and inclusive date ranges", () => {
    expect(isValidIsoDate("2026-11-26")).toBe(true);
    expect(isValidIsoDate("2024-02-29")).toBe(true);
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("26-11-2026")).toBe(false);

    expect(isValidDateRange("2026-06-01", "2026-06-30")).toBe(true);
    expect(isValidDateRange("2026-06-30", "2026-06-30")).toBe(true);
    expect(isValidDateRange("2026-07-01", "2026-06-30")).toBe(false);
  });

  it("computes exact month bounds, exclusive ends, calendar days, and year transitions", () => {
    expect(getMonthBounds("2026-11")).toEqual({
      start: "2026-11-01",
      end: "2026-11-30",
    });
    expect(getMonthBounds("2024-02")).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
    expect(getMonthRangeExclusiveEnd("2026-12")).toEqual({
      start: "2026-12-01",
      endExclusive: "2027-01-01",
      endInclusive: "2026-12-31",
    });
    expect(addCalendarDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(enumerateMonths("2025-11", "2026-02")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
    expect(isValidMonthKey("2026-00")).toBe(false);
    expect(isValidMonthKey("2026-13")).toBe(false);
  });

  it("resolves standardized periods deterministically in America/El_Salvador", () => {
    const fixedNow = new Date("2026-07-15T18:00:00.000Z");

    const cur = resolvePeriodRange("current_month", fixedNow);
    expect(cur.start).toBe("2026-07-01");
    expect(cur.endExclusive).toBe("2026-08-01");
    expect(cur.previousRange?.start).toBe("2026-06-01");
    expect(cur.previousRange?.endExclusive).toBe("2026-07-01");

    const last3 = resolvePeriodRange("last_3_months", fixedNow);
    expect(last3.start).toBe("2026-05-01");
    expect(last3.endExclusive).toBe("2026-08-01");
    expect(last3.previousRange?.start).toBe("2026-02-01");

    const specific = resolvePeriodRange("2026-06", fixedNow);
    expect(specific.start).toBe("2026-06-01");
    expect(specific.endExclusive).toBe("2026-07-01");
    expect(specific.previousRange?.start).toBe("2026-05-01");

    const year = resolvePeriodRange("current_year", fixedNow);
    expect(year.start).toBe("2026-01-01");
    expect(year.endExclusive).toBe("2027-01-01");
  });

  it("formats calendar dates and months consistently in Spanish without day shift", () => {
    expect(formatDateShort("2026-11-01")).toContain("2026");
    expect(formatDateShort("2026-11-01")).toContain("01");
    expect(formatDateLong("2026-11-26").toLowerCase()).toContain("noviembre");
    expect(formatMonthLabel("2026-11")).toMatch(/^Noviembre.*2026$/i);
    expect(() => formatDateShort("2026-02-30")).toThrow();
  });
});
