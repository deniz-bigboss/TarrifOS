import type { DutyMeasure } from "@/types";
import { cacheGet, cacheSet, fetchJson } from "./cache";

/**
 * Live adapter for the USITC Harmonized Tariff Schedule export API — free, no
 * key:  https://hts.usitc.gov/reststop/exportList?from=X&to=Y&format=JSON
 *
 * Returns the current MFN ("general") duty for a US HTS code. Note this gives
 * the *base* column-1 rate only; the country-specific trade-war tariffs
 * (Section 301/232, 2025 IEEPA reciprocal) live in HTS Chapter 99 with
 * product/country/exclusion logic that this endpoint does not resolve into a
 * single rate — those are handled by the trade-remedy layer, which flags that
 * a live source should confirm the current figure.
 */

const BASE = "https://hts.usitc.gov/reststop/exportList";

interface HtsEntry {
  htsno?: string;
  description?: string;
  general?: string;
  special?: string;
  other?: string;
}

/** Pure parser: pick the best MFN ("general") rate for a code from HTS rows. */
export function parseHtsGeneralRate(
  rows: HtsEntry[],
  code: string,
): { general: string; matched: string } | null {
  const target = code.replace(/\D/g, "");
  // Prefer an exact htsno match, then the longest-prefix match with a rate.
  const withRate = rows.filter((r) => r.htsno && r.general && r.general.trim());
  if (withRate.length === 0) return null;

  const exact = withRate.find((r) => r.htsno!.replace(/\D/g, "") === target);
  if (exact) return { general: exact.general!.trim(), matched: exact.htsno! };

  let best: HtsEntry | null = null;
  let bestLen = -1;
  for (const r of withRate) {
    const rn = r.htsno!.replace(/\D/g, "");
    if (target.startsWith(rn) && rn.length > bestLen) {
      best = r;
      bestLen = rn.length;
    }
  }
  if (best) return { general: best.general!.trim(), matched: best.htsno! };
  return null;
}

async function fetchHts(code: string): Promise<HtsEntry[] | null> {
  const key = `us:hts:${code}`;
  const cached = cacheGet<HtsEntry[]>(key);
  if (cached) return cached;
  const digits = code.replace(/\D/g, "").slice(0, 8);
  const four = digits.slice(0, 4);
  const rows = await fetchJson<HtsEntry[]>(
    `${BASE}?from=${four}&to=${four}.9999&format=JSON&styles=false`,
    { timeoutMs: 7000 },
  );
  if (rows) cacheSet(key, rows);
  return rows;
}

export async function usDutyMeasure(
  code: string,
  origin: string,
  destination: string,
): Promise<DutyMeasure | null> {
  const rows = await fetchHts(code);
  if (!rows) return null;
  const rate = parseHtsGeneralRate(rows, code);
  if (!rate) return null;

  return {
    code,
    originCountry: origin,
    destinationCountry: destination,
    dutyRatePlaceholder: `${rate.general} (US HTS general/MFN, live)`,
    vatRatePlaceholder: "no federal VAT; state sales/use tax may apply",
    notes: [
      `Base MFN duty for ${rate.matched} retrieved live from the USITC HTS.`,
      "Additional Section 301/232 and 2025 reciprocal tariffs are shown separately and must be confirmed against HTS Chapter 99.",
    ],
    isPlaceholder: false,
    source: "USITC HTS (live)",
    asOf: new Date().toISOString().slice(0, 10),
  };
}
