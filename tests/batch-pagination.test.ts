import { describe, expect, it } from "vitest";
import { collectPaginatedBatches } from "@/lib/batch-pagination";
import { sumExactCents } from "@/lib/money";
import { sanitizePostgrestSearch } from "@/lib/search";

interface MockRow {
  id: string;
  amount_cents: number;
  occurred_on: string;
}

function createMockDataset(count: number): MockRow[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `row-${String(idx).padStart(5, "0")}`,
    amount_cents: 100, // $1.00 each
    // Repeated dates intentionally to validate deterministic tie-breaking / full retrieval
    occurred_on: "2026-07-15",
  }));
}

function makeSliceFetcher(dataset: MockRow[]) {
  let calls = 0;
  return {
    getCalls: () => calls,
    fetchBatch: async (from: number, to: number) => {
      calls += 1;
      return dataset.slice(from, to + 1);
    },
  };
}

describe("multi-batch pagination (>1,000 rows, zero truncation, dedup)", () => {
  it("handles 0, 1, 999, 1000, 1001, 2000, and 2500 rows cleanly", async () => {
    for (const total of [0, 1, 999, 1000, 1001, 2000, 2500]) {
      const dataset = createMockDataset(total);
      const { fetchBatch, getCalls } = makeSliceFetcher(dataset);
      const collected = await collectPaginatedBatches(fetchBatch, 1000);

      expect(collected).toHaveLength(total);
      expect(sumExactCents(collected.map((r) => r.amount_cents))).toBe(
        BigInt(total) * BigInt(100),
      );

      // Exact expected batch call counts (exact multiples fetch one trailing empty batch to confirm end)
      const expectedCalls =
        total === 0 ? 1 : Math.floor(total / 1000) + 1;
      expect(getCalls()).toBe(expectedCalls);
    }
  });

  it("propagates mid-batch errors instead of returning silently truncated data", async () => {
    const dataset = createMockDataset(1500);
    await expect(
      collectPaginatedBatches(async (from, to) => {
        if (from === 1000) {
          throw new Error("Simulated PostgREST batch #2 failure");
        }
        return dataset.slice(from, to + 1);
      }, 1000),
    ).rejects.toThrow("Simulated PostgREST batch #2 failure");
  });

  it("deduplicates overlapping IDs when a concurrent insert shifts batch offsets", async () => {
    const base = createMockDataset(1200);
    // Simulate a new row inserted at index 0 between batch 1 (0..999) and batch 2 (1000..1999),
    // causing row-00999 to appear at the end of batch 1 AND the start of batch 2.
    const shifted = [
      { id: "row-concurrent", amount_cents: 500, occurred_on: "2026-07-15" },
      ...base,
    ];

    let batchNum = 0;
    const collected = await collectPaginatedBatches(async (from, to) => {
      batchNum += 1;
      const source = batchNum === 1 ? base : shifted;
      return source.slice(from, to + 1);
    }, 1000);

    // Every original row appears ONCE — row-00999 is NOT double-counted
    const ids = new Set(collected.map((r) => r.id));
    expect(ids.size).toBe(collected.length);
    expect(collected).toHaveLength(1200);
    expect(sumExactCents(collected.map((r) => r.amount_cents))).toBe(
      BigInt(120_000),
    );
  });
});

describe("sanitizePostgrestSearch adversarial input safety", () => {
  it("strips PostgREST filter delimiters and wildcards while preserving Spanish/Unicode text", () => {
    expect(sanitizePostgrestSearch("Café & Panadería El Salvador")).toBe(
      "Café & Panadería El Salvador",
    );
    expect(sanitizePostgrestSearch("100% descuento_vip")).toBe(
      "100\\% descuento\\_vip",
    );
    expect(
      sanitizePostgrestSearch('a,description.eq.hacked),(id.neq.0)"*'),
    ).toBe("a description.eq.hacked id.neq.0");
    expect(sanitizePostgrestSearch("O'Reilly's Café")).toBe("O'Reilly's Café");
    expect(sanitizePostgrestSearch("   ")).toBe("");
    expect(sanitizePostgrestSearch("Pago 💰 #2026")).toBe("Pago 💰 #2026");
  });
});
