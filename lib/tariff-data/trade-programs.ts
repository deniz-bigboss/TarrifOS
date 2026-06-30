import type { TradeProgramEligibility } from "@/types";

/**
 * Preferential trade program reference data for the lanes TariffOS targets
 * at launch (EU / UK / Turkey / US). This is informational, not a rules-of-
 * origin determination — eligibility always depends on the specific product
 * meeting the program's origin rules, which this MVP does not verify.
 *
 * Adding a new lane = add countries to a region set and/or a new program
 * below. Mirrors the SeedTariffDataProvider pattern: explicit, local,
 * clearly labeled as a starting point rather than an authoritative source.
 */
type Region = "EU" | "UK" | "TR" | "US";

const EU_MEMBERS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

function regionOf(countryCode: string | null | undefined): Region | null {
  if (!countryCode) return null;
  const c = countryCode.toUpperCase();
  if (c === "GB" || c === "UK") return "UK";
  if (c === "TR") return "TR";
  if (c === "US") return "US";
  if (EU_MEMBERS.has(c)) return "EU";
  return null;
}

interface TradeProgramDef {
  name: string;
  regions: [Region, Region];
  potential_duty_rate: string;
  proof_required: string;
  notes: string;
}

const TRADE_PROGRAMS: TradeProgramDef[] = [
  {
    name: "EU–Turkey Customs Union",
    regions: ["EU", "TR"],
    potential_duty_rate: "0% (placeholder) on most industrial goods in free circulation",
    proof_required: "A.TR movement certificate",
    notes:
      "Covers most manufactured/industrial goods between the EU and Turkey. Most agricultural and processed-agricultural products are only partially covered — confirm your product's chapter is included.",
  },
  {
    name: "UK–Turkey Free Trade Agreement",
    regions: ["UK", "TR"],
    potential_duty_rate: "0% (placeholder) for goods meeting rules of origin",
    proof_required: "EUR.1 movement certificate or origin declaration",
    notes:
      "Replaced the EU–Turkey Customs Union for UK trade after Brexit. Origin must be substantiated under this agreement's specific rules of origin.",
  },
  {
    name: "EU–UK Trade and Cooperation Agreement (TCA)",
    regions: ["EU", "UK"],
    potential_duty_rate: "0% (placeholder) for goods meeting rules of origin",
    proof_required: "Statement on origin (exporter-issued) or importer's knowledge",
    notes:
      "Tariff-free only for goods that meet the TCA's product-specific rules of origin — third-country goods merely passing through the EU or UK do not automatically qualify.",
  },
];

/**
 * Look up preferential programs for an origin/destination pair. Returns one
 * entry per known program between the two regions, plus an explicit
 * "no program found" entry when both sides resolve to a region but no match
 * exists — so the optimizer can say so honestly instead of staying silent.
 */
export function findTradePrograms(
  originCountry: string | null | undefined,
  destinationCountry: string | null | undefined,
): TradeProgramEligibility[] {
  const originRegion = regionOf(originCountry);
  const destRegion = regionOf(destinationCountry);
  if (!originRegion || !destRegion || originRegion === destRegion) return [];

  const matches = TRADE_PROGRAMS.filter(
    (p) =>
      (p.regions[0] === originRegion && p.regions[1] === destRegion) ||
      (p.regions[0] === destRegion && p.regions[1] === originRegion),
  );

  if (matches.length > 0) {
    return matches.map((p) => ({
      name: p.name,
      may_apply: true,
      potential_duty_rate: p.potential_duty_rate,
      proof_required: p.proof_required,
      notes: p.notes,
    }));
  }

  return [
    {
      name: `${originRegion} → ${destRegion}`,
      may_apply: false,
      potential_duty_rate: "Standard MFN duty applies (placeholder)",
      proof_required: "—",
      notes:
        "No general preferential trade program between these regions is in our reference set. Sector-specific or bilateral arrangements may still exist — verify with an official source.",
    },
  ];
}
