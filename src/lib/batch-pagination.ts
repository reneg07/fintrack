/**
 * Generic deterministic multi-batch paginator with row-ID deduplication.
 * Prevents PostgREST 1000-row silent truncation, infinite loops, and double-counting
 * when concurrent writes shift page offsets between consecutive batches.
 */
export const DEFAULT_POSTGREST_BATCH_SIZE = 1000;
const MAX_SAFE_BATCH_ITERATIONS = 500; // hard safety cap (500,000 rows) against buggy mock/cursor loops

export async function collectPaginatedBatches<T extends { id: string }>(
  fetchBatch: (from: number, to: number) => Promise<readonly T[]>,
  batchSize = DEFAULT_POSTGREST_BATCH_SIZE,
): Promise<T[]> {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError("El tamaño de lote debe ser un entero positivo.");
  }

  const collected: T[] = [];
  const seenIds = new Set<string>();
  let offset = 0;

  for (let iteration = 0; iteration < MAX_SAFE_BATCH_ITERATIONS; iteration++) {
    const batch = await fetchBatch(offset, offset + batchSize - 1);
    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        collected.push(row);
      }
    }

    if (batch.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  return collected;
}
