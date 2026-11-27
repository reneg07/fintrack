import { describe, expect, it } from "vitest";
import {
  formatDateLong,
  formatDateShort,
  formatMonthLabel,
  getCurrentDateInElSalvador,
  getCurrentMonthKey,
  getMonthBounds,
  isValidIsoDate,
  isValidMonthKey,
} from "@/lib/dates";

describe("date utilities (America/El_Salvador)", () => {
  it("resolves calendar date in America/El_Salvador across UTC midnight boundary", () => {
    // 2026-11-27T04:15:00Z is 2026-11-26 22:15 in America/El_Salvador (UTC-6)
    const utcAfterMidnight = new Date("2026-11-27T04:15:00.000Z");
    expect(getCurrentDateInElSalvador(utcAfterMidnight)).toBe("2026-11-26");
    expect(getCurrentMonthKey(utcAfterMidnight)).toBe("2026-11");

    // 2026-12-01T05:59:59Z is still 2026-11-30 23:59:59 in El Salvador
    const utcNewMonth = new Date("2026-12-01T05:59:59.000Z");
    expect(getCurrentDateInElSalvador(utcNewMonth)).toBe("2026-11-30");
    expect(getCurrentMonthKey(utcNewMonth)).toBe("2026-11");
  });

  it("validates real ISO calendar dates including leap years", () => {
    expect(isValidIsoDate("2026-11-26")).toBe(true);
    expect(isValidIsoDate("2024-02-29")).toBe(true);
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("26-11-2026")).toBe(false);
  });

  it("computes exact month bounds including leap February", () => {
    expect(getMonthBounds("2026-11")).toEqual({
      start: "2026-11-01",
      end: "2026-11-30",
    });
    expect(getMonthBounds("2024-02")).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
    expect(getMonthBounds("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
    expect(isValidMonthKey("2026-00")).toBe(false);
    expect(isValidMonthKey("2026-13")).toBe(false);
  });

  it("formats calendar dates and months consistently in Spanish without day shift", () => {
    expect(formatDateShort("2026-11-01")).toContain("2026");
    expect(formatDateShort("2026-11-01")).toContain("01");
    expect(formatDateLong("2026-11-26").toLowerCase()).toContain("noviembre");
    expect(formatMonthLabel("2026-11")).toMatch(/^Noviembre.*2026$/i);
    expect(() => formatDateShort("2026-02-30")).toThrow();
  });
});
