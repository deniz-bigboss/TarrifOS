import type { TradeRemedyLine } from "@/types";
import { countryName } from "@/lib/utils";

/**
 * Trade-remedy / additional-tariff reference layer.
 *
 * The seed duty rates are ordinary MFN placeholders. They do NOT include the
 * country-specific *additional* tariffs that dominate real landed cost on many
 * lanes today — US Section 301 (China), Section 232 (steel/aluminum), the 2025
 * IEEPA "reciprocal" tariffs, Canada/Mexico measures, the EU's countervailing
 * duties on Chinese EVs, and so on. This module models those as origin-based
 * surcharges stacked ON TOP of the base duty.
 *
 * IMPORTANT — these measures change constantly and several are under active
 * legal challenge. Every figure here is a DATED REFERENCE POINT for
 * estimation, never an authoritative rate. The UI always tells the user to
 * confirm the current measure against the official schedule (USITC HTS,
 * EUR-Lex / TARIC, the relevant customs authority) before filing.
 */

export interface TradeRemedy {
  id: string;
  name: string;
  /** Country/bloc that imposes the measure: an ISO code, or "EU". */
  imposedBy: string;
  /**
   * Origins the measure targets. An explicit ISO list, or "most" for
   * broad measures (with optional exceptions).
   */
  origins: string[] | "most";
  originsExcept?: string[];
  /** HS chapters (2-digit prefixes) the measure is limited to; omit = all goods. */
  hsChapterPrefixes?: string[];
  /** Representative additional ad-valorem rate used for the estimate. */
  ratePercent: number;
  /** Human label for the rate — can express ranges / volatility. */
  rateLabel: string;
  /**
   * "added": folded into the numeric estimate (broad, generally-applicable).
   * "flag": shown as "may apply" but NOT auto-added, because eligibility is
   * conditional (e.g. USMCA carve-outs) and auto-adding would overstate.
   */
  mode: "added" | "flag";
  effective: string;
  source: string;
  detail: string;
}

const EU_MEMBERS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

/**
 * Reference dataset (compiled for 2025 measures). Rates are illustrative and
 * were volatile through 2025 — treat as order-of-magnitude, not gospel.
 */
const TRADE_REMEDIES: TradeRemedy[] = [
  {
    id: "us-ieepa-reciprocal-baseline",
    name: "US reciprocal tariff — baseline",
    imposedBy: "US",
    origins: "most",
    originsExcept: ["US"],
    ratePercent: 10,
    rateLabel: "10% baseline (country-specific rates can be higher)",
    mode: "added",
    effective: "Effective April 2025 (IEEPA); country-specific rates announced then partly paused/renegotiated.",
    source: "US IEEPA 'reciprocal' tariff — verify USITC HTS",
    detail:
      "A broad additional tariff on imports from most countries. Several trading partners negotiated different rates, and the measure has been challenged in court — confirm the current rate for this origin.",
  },
  {
    id: "us-china-additional",
    name: "US additional tariffs on China (Section 301 + 2025 IEEPA)",
    imposedBy: "US",
    origins: ["CN", "HK"],
    ratePercent: 30,
    rateLabel: "≈30%+ combined reference — ranged ~30% to 145% during 2025",
    mode: "added",
    effective: "Section 301 since 2018–19 (7.5–25% by list); 2025 IEEPA additions incl. a 20% 'fentanyl' tariff.",
    source: "US Section 301 + IEEPA — verify USITC HTS / USTR",
    detail:
      "China faces the heaviest US additional-tariff stack: long-standing Section 301 duties (7.5–25% depending on the product list) plus 2025 IEEPA tariffs. The combined rate swung dramatically in 2025 — this is a conservative reference floor, so verify the current figure for your HS code.",
  },
  {
    id: "us-232-steel",
    name: "US Section 232 — steel",
    imposedBy: "US",
    origins: "most",
    originsExcept: ["US"],
    hsChapterPrefixes: ["72", "73"],
    ratePercent: 25,
    rateLabel: "25% on steel & steel articles",
    mode: "added",
    effective: "Since 2018; scope broadened and country exemptions largely removed in 2025.",
    source: "US Section 232 (steel) — verify USITC HTS",
    detail:
      "A 25% national-security tariff on steel and many steel-derivative products (HS chapters 72–73). Confirm whether your specific article is within the covered list.",
  },
  {
    id: "us-232-aluminum",
    name: "US Section 232 — aluminum",
    imposedBy: "US",
    origins: "most",
    originsExcept: ["US"],
    hsChapterPrefixes: ["76"],
    ratePercent: 25,
    rateLabel: "25% on aluminum & aluminum articles",
    mode: "added",
    effective: "Since 2018 (10%, raised to 25% in 2025); country exemptions largely removed.",
    source: "US Section 232 (aluminum) — verify USITC HTS",
    detail:
      "A national-security tariff on aluminum and aluminum-derivative products (HS chapter 76), raised to 25% in 2025. Confirm whether your specific article is within the covered list.",
  },
  {
    id: "us-canada-ieepa",
    name: "US tariffs on Canada (2025 IEEPA)",
    imposedBy: "US",
    origins: ["CA"],
    ratePercent: 25,
    rateLabel: "25% (USMCA-compliant goods largely exempt; energy ~10%)",
    mode: "flag",
    effective: "2025 IEEPA border/fentanyl measure.",
    source: "US IEEPA (Canada) — verify CBP",
    detail:
      "A 25% tariff on Canadian-origin goods, but USMCA-qualifying goods are largely exempt and energy products carry a lower rate. Because most Canada–US trade is USMCA-compliant, this is flagged rather than auto-added — confirm your good's USMCA status.",
  },
  {
    id: "us-mexico-ieepa",
    name: "US tariffs on Mexico (2025 IEEPA)",
    imposedBy: "US",
    origins: ["MX"],
    ratePercent: 25,
    rateLabel: "25% (USMCA-compliant goods largely exempt)",
    mode: "flag",
    effective: "2025 IEEPA border/fentanyl measure.",
    source: "US IEEPA (Mexico) — verify CBP",
    detail:
      "A 25% tariff on Mexican-origin goods, but USMCA-qualifying goods are largely exempt. Because most Mexico–US trade is USMCA-compliant, this is flagged rather than auto-added — confirm your good's USMCA status.",
  },
  {
    id: "eu-china-bev-cvd",
    name: "EU countervailing duties — China battery-electric vehicles",
    imposedBy: "EU",
    origins: ["CN"],
    hsChapterPrefixes: ["87"],
    ratePercent: 20,
    rateLabel: "≈17%–35% additional, producer-specific",
    mode: "added",
    effective: "Definitive measures from late 2024.",
    source: "EU CVD on Chinese BEVs — verify EUR-Lex / TARIC",
    detail:
      "The EU imposed definitive countervailing duties on battery-electric vehicles from China (HS chapter 87), on top of the 10% base car duty. The exact rate depends on the manufacturer — verify for your producer.",
  },
];

/** Top-of-list caveat shown whenever any remedy is surfaced. */
export const TRADE_REMEDY_NOTICE =
  "Additional-tariff figures are dated reference points, not official rates. Trade-war tariffs change frequently and several are under legal challenge — always confirm the current measure against the official tariff schedule (e.g. USITC HTS, EUR-Lex/TARIC) or your customs broker before filing.";

function chapterOf(hsCode: string | null | undefined): string | null {
  if (!hsCode) return null;
  const digits = hsCode.replace(/\D/g, "");
  return digits.length >= 2 ? digits.slice(0, 2) : null;
}

function imposedByMatches(remedy: TradeRemedy, destination: string): boolean {
  if (remedy.imposedBy === "EU") return EU_MEMBERS.has(destination);
  return remedy.imposedBy === destination;
}

function originMatches(remedy: TradeRemedy, origin: string): boolean {
  if (remedy.origins === "most") {
    return origin !== "" && !(remedy.originsExcept ?? []).includes(origin);
  }
  return remedy.origins.includes(origin);
}

/**
 * Returns the trade remedies that apply to an origin → destination lane for a
 * given HS code. Order: broad "added" measures first, conditional "flag"
 * measures last.
 */
export function getTradeRemedies(
  destination: string,
  origin: string,
  hsCode?: string | null,
): TradeRemedy[] {
  const dest = (destination || "").toUpperCase();
  const orig = (origin || "").toUpperCase();
  if (!dest || !orig) return [];
  const chapter = chapterOf(hsCode);

  return TRADE_REMEDIES.filter((remedy) => {
    if (!imposedByMatches(remedy, dest)) return false;
    if (!originMatches(remedy, orig)) return false;
    if (remedy.hsChapterPrefixes) {
      if (!chapter || !remedy.hsChapterPrefixes.includes(chapter)) return false;
    }
    return true;
  }).sort((a, b) => (a.mode === b.mode ? 0 : a.mode === "added" ? -1 : 1));
}

export type { TradeRemedyLine } from "@/types";

export interface TradeRemedyEstimate {
  lines: TradeRemedyLine[];
  /** Combined additional % from the "added" measures. */
  added_rate_percent: number;
  /** Additional duty value from the "added" measures, or null. */
  additional_duty_value: number | null;
  notice: string;
}

/**
 * Builds the display lines and the additional-duty estimate for a lane.
 * Returns null when no remedy applies.
 */
export function buildTradeRemedyEstimate(
  destination: string,
  origin: string,
  hsCode: string | null | undefined,
  declaredValue: number | null,
): TradeRemedyEstimate | null {
  const remedies = getTradeRemedies(destination, origin, hsCode);
  if (remedies.length === 0) return null;

  let addedRate = 0; // combined added rate
  const lines: TradeRemedyLine[] = remedies.map((r) => {
    const isAdded = r.mode === "added";
    if (isAdded) addedRate += r.ratePercent;
    const value =
      isAdded && declaredValue != null
        ? Math.round(((declaredValue * r.ratePercent) / 100) * 100) / 100
        : null;
    return {
      name: r.name,
      rate_label: r.rateLabel,
      estimated_value: value,
      applies: isAdded ? "added" : "may-apply",
      source: r.source,
      effective: r.effective,
      detail: r.detail,
    };
  });

  const additional =
    declaredValue != null
      ? Math.round(((declaredValue * addedRate) / 100) * 100) / 100
      : null;

  return {
    lines,
    added_rate_percent: addedRate,
    additional_duty_value: additional,
    notice: TRADE_REMEDY_NOTICE,
  };
}

/** Short one-liner for the shipment-plan checkpoint. */
export function tradeRemedySummary(
  destination: string,
  origin: string,
  lines: TradeRemedyLine[],
): string {
  const added = lines.filter((l) => l.applies === "added");
  const names = (added.length ? added : lines).map((l) => l.name).join("; ");
  return `Imports from ${countryName(origin)} into ${countryName(destination)} are subject to additional tariffs: ${names}.`;
}
