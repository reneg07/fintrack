/**
 * Sanitizes user search input for PostgREST `.or(description.ilike.%...%,notes.ilike.%...%)`:
 * - Escapes SQL LIKE wildcards (`%`, `_`) and backslashes (`\`)
 * - Removes PostgREST filter-syntax delimiters (`,`, `(`, `)`, `"`) and PostgREST wildcard alias (`*`)
 *   so unmatched quotes or filter operators can never break queries or inject extra filter clauses,
 *   while preserving accented Spanish characters, apostrophes, hyphens, numbers, and Unicode.
 */
export function sanitizePostgrestSearch(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/[(),*"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
