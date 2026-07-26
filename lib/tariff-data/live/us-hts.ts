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

export interface HtsRate {
  general: string;
  matched: string;
  /** Extra context when the rate was derived from several subheadings. */
  note?: string;
}

const digitsOf = (value: string) => value.replace(/\D/g, "");

/** "7.2%" -> 7.2, "Free" -> 0, compound/specific duties -> the % part if any. */
function ratePercent(raw: string): number | null {
  const m = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  if (m) return parseFloat(m[1]);
  if (/^\s*free\s*$/i.test(raw)) return 0;
  return null;
}

const isPlainPercent = (raw: string) =>
  /^\s*(free|\d+(?:\.\d+)?\s*%)\s*$/i.test(raw);

/**
 * Pure parser: pick the best MFN ("general") rate for a code from HTS rows.
 *
 * Three cases, in order of precision:
 *  1. an exact `htsno` match;
 *  2. a less specific parent line that carries a rate;
 *  3. the subheadings *underneath* the requested code. This is the common case
 *     rather than an edge case: the classifier works in 6-digit HS headings
 *     while the USITC publishes rates on 8–10 digit lines, so a lookup for
 *     "9617.00" has to consider 9617.00.10.00 and friends. Where those lines
 *     disagree we report the highest rate ("up to X%") so a landed-cost
 *     estimate is never quoted lower than the importer might actually pay.
 */
export function parseHtsGeneralRate(
  rows: HtsEntry[],
  code: string,
): HtsRate | null {
  const target = digitsOf(code);
  const withRate = rows.filter((r) => r.htsno && r.general && r.general.trim());
  if (withRate.length === 0) return null;

  const exact = withRate.find((r) => digitsOf(r.htsno!) === target);
  if (exact) return { general: exact.general!.trim(), matched: exact.htsno! };

  let parent: HtsEntry | null = null;
  let parentLen = -1;
  for (const r of withRate) {
    const rn = digitsOf(r.htsno!);
    if (target.startsWith(rn) && rn.length > parentLen) {
      parent = r;
      parentLen = rn.length;
    }
  }
  if (parent) return { general: parent.general!.trim(), matched: parent.htsno! };

  const children = withRate.filter((r) => digitsOf(r.htsno!).startsWith(target));
  if (children.length === 0) return null;
  if (children.length === 1) {
    return { general: children[0].general!.trim(), matched: children[0].htsno! };
  }

  const raws = [...new Set(children.map((r) => r.general!.trim()))];
  const compound = raws.filter((r) => !isPlainPercent(r));

  if (raws.length === 1) {
    return {
      general: raws[0],
      matched: `${code} (all ${children.length} subheadings)`,
    };
  }

  const percents = raws
    .map(ratePercent)
    .filter((n): n is number => n !== null);

  if (percents.length === 0) {
    return {
      general: raws[0],
      matched: `${code} (${children.length} subheadings)`,
      note: `Subheadings of ${code} carry specific or compound duties (${raws.join("; ")}) — confirm the exact 10-digit line.`,
    };
  }

  const min = Math.min(...percents);
  const max = Math.max(...percents);
  if (min === max) {
    return {
      general: max === 0 ? "Free (0%)" : `${max}%`,
      matched: `${code} (all ${children.length} subheadings)`,
    };
  }

  const range = `${min}%–${max}%`;
  const noteParts = [
    `Subheading rates under ${code} range ${range}; the exact line depends on the product's specifics, so the higher rate is shown.`,
  ];
  if (compound.length > 0) {
    noteParts.push(
      `Some lines also carry specific or compound duties (${compound.join("; ")}).`,
    );
  }
  return {
    general: `up to ${max}%`,
    matched: `${code} (subheadings ${range})`,
    note: noteParts.join(" "),
  };
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
      ...(rate.note ? [rate.note] : []),
      "Additional Section 301/232 and 2025 reciprocal tariffs are shown separately and must be confirmed against HTS Chapter 99.",
    ],
    isPlaceholder: false,
    source: "USITC HTS (live)",
    asOf: new Date().toISOString().slice(0, 10),
  };
}
