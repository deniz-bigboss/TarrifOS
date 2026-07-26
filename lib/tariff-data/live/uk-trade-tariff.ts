import type { DutyMeasure, Restriction } from "@/types";
import { countryName } from "@/lib/utils";
import { cacheGet, cacheSet, fetchJson } from "./cache";

/**
 * Live adapter for the UK Trade Tariff API (HMRC) — free, public, no API key:
 *   https://www.trade-tariff.service.gov.uk/api/v2/commodities/{code}
 *
 * It returns a JSON:API document whose `included` array holds the commodity's
 * measures: the third-country (MFN) duty, VAT, and any anti-dumping /
 * safeguard measures — which are the UK's live "trade-remedy" duties. We parse
 * those into our DutyMeasure / Restriction shapes. Parsing is defensive: if
 * the document is missing the pieces we need, we return null and the caller
 * falls back to seed data.
 */

const BASE = "https://www.trade-tariff.service.gov.uk/api/v2";

interface JsonApiResource {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data: { id: string; type: string } | { id: string; type: string }[] | null }>;
}

interface JsonApiDoc {
  data?: JsonApiResource;
  included?: JsonApiResource[];
}

/** Pads an HS/commodity code to the UK's 10-digit commodity format. */
export function toUkCommodityCode(code: string): string {
  const digits = code.replace(/\D/g, "");
  return (digits + "0000000000").slice(0, 10);
}

interface ParsedUk {
  mfnDuty: string | null;
  vat: string | null;
  restrictions: string[];
}

/**
 * Pure parser for a UK Trade Tariff commodity document. Extracted so it can be
 * unit-tested with a fixture (the sandbox can't reach the live API).
 */
export function parseUkCommodity(doc: JsonApiDoc, origin: string): ParsedUk {
  const included = doc.included ?? [];
  const byId = new Map<string, JsonApiResource>();
  for (const r of included) byId.set(`${r.type}:${r.id}`, r);

  const dutyExpressionOf = (m: JsonApiResource): string | null => {
    const rel = m.relationships?.duty_expression?.data;
    if (!rel || Array.isArray(rel)) {
      // Some responses inline the base on the measure itself.
      const base = m.attributes?.duty_expression as { base?: string } | undefined;
      return base?.base ?? null;
    }
    const de = byId.get(`${rel.type}:${rel.id}`);
    const base = de?.attributes?.base ?? de?.attributes?.formatted_base;
    return typeof base === "string" ? base.replace(/<[^>]+>/g, "").trim() : null;
  };

  const measureTypeOf = (m: JsonApiResource): string => {
    const rel = m.relationships?.measure_type?.data;
    if (!rel || Array.isArray(rel)) return "";
    const mt = byId.get(`${rel.type}:${rel.id}`);
    return String(mt?.attributes?.description ?? "").toLowerCase();
  };

  const geoOf = (m: JsonApiResource): string => {
    const rel = m.relationships?.geographical_area?.data;
    if (!rel || Array.isArray(rel)) return "";
    const g = byId.get(`${rel.type}:${rel.id}`);
    return String(g?.attributes?.description ?? g?.attributes?.id ?? "").toLowerCase();
  };

  const measures = included.filter((r) => r.type === "measure");
  // The API expresses a measure's country as either an ISO code ("CN") or a
  // name ("China"), so match against both forms of the origin.
  const originIso = origin.toLowerCase();
  const originName = countryName(origin).toLowerCase();
  const matchesOrigin = (geo: string) =>
    geo === "" ||
    geo.includes("erga omnes") ||
    (originIso.length > 0 && geo.includes(originIso)) ||
    (originName.length > 0 && geo.includes(originName));

  let mfnDuty: string | null = null;
  let vat: string | null = null;
  const restrictions: string[] = [];

  for (const m of measures) {
    const type = measureTypeOf(m);
    const geo = geoOf(m);
    const duty = dutyExpressionOf(m);

    if (type.includes("third country duty") && (geo.includes("erga omnes") || geo === "")) {
      mfnDuty = duty ?? mfnDuty;
    } else if (type.includes("value added tax") || type.includes("vat")) {
      vat = duty ?? vat;
    } else if (type.includes("anti-dumping") || type.includes("countervailing") || type.includes("safeguard")) {
      // Only surface if it targets the origin (or all origins).
      if (matchesOrigin(geo)) {
        restrictions.push(
          `${type.replace(/\b\w/g, (c) => c.toUpperCase())}${duty ? ` (${duty})` : ""} applies for this commodity — verify against the UK Trade Tariff.`,
        );
      }
    }
  }

  return { mfnDuty, vat, restrictions };
}

/**
 * Fetches the tariff document for a code.
 *
 * Zero-padding a 6-digit heading to a 10-digit commodity only sometimes lands
 * on a real commodity (6109.10 → 6109100000 is a 404, for instance), so when
 * that misses we fall back to the heading document, which carries the same
 * third-country duty and VAT measures for the heading as a whole.
 */
async function fetchCommodity(code: string): Promise<JsonApiDoc | null> {
  const key = `uk:commodity:${code}`;
  const cached = cacheGet<JsonApiDoc>(key);
  if (cached) return cached;

  let doc = await fetchJson<JsonApiDoc>(
    `${BASE}/commodities/${toUkCommodityCode(code)}`,
    { timeoutMs: 6000 },
  );
  if (!doc) {
    const heading = code.replace(/\D/g, "").slice(0, 4);
    if (heading.length === 4) {
      doc = await fetchJson<JsonApiDoc>(`${BASE}/headings/${heading}`, {
        timeoutMs: 6000,
      });
    }
  }
  if (doc) cacheSet(key, doc);
  return doc;
}

export async function ukDutyMeasure(
  code: string,
  origin: string,
  destination: string,
): Promise<DutyMeasure | null> {
  const doc = await fetchCommodity(code);
  if (!doc) return null;
  const parsed = parseUkCommodity(doc, origin);
  if (!parsed.mfnDuty) return null;

  return {
    code,
    originCountry: origin,
    destinationCountry: destination,
    dutyRatePlaceholder: `${parsed.mfnDuty} (UK third-country duty, live)`,
    vatRatePlaceholder: parsed.vat ? `${parsed.vat} (UK VAT, live)` : "20% (UK VAT)",
    notes: [
      "Base duty and VAT retrieved live from the UK Trade Tariff API.",
      "Preferential rates may apply under a trade agreement — confirm origin.",
    ],
    isPlaceholder: false,
    source: "UK Trade Tariff API (live)",
    asOf: new Date().toISOString().slice(0, 10),
  };
}

export async function ukRestrictions(
  code: string,
  origin: string,
): Promise<Restriction[]> {
  const doc = await fetchCommodity(code);
  if (!doc) return [];
  return parseUkCommodity(doc, origin).restrictions.map((message) => ({
    code,
    message,
    severity: "warning" as const,
  }));
}
