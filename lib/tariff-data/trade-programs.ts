import type { TradeProgramEligibility } from "@/types";

/**
 * Preferential trade program reference data, worldwide.
 *
 * A program is defined by its parties: either two groups (bilateral — origin
 * in one, destination in the other) or a single group (plurilateral — both
 * countries members). This is informational, not a rules-of-origin
 * determination — eligibility always depends on the specific product meeting
 * the program's origin rules, which this MVP does not verify. Lanes with no
 * match get an explicit "no program in our reference set" entry so the
 * optimizer is honest rather than silent.
 */

const EU = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
];

const ASEAN = ["BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "TH", "VN"];

interface TradeProgramDef {
  name: string;
  /** One group = plurilateral (both members); two groups = bilateral. */
  parties: string[][];
  potential_duty_rate: string;
  proof_required: string;
  notes: string;
}

const TRADE_PROGRAMS: TradeProgramDef[] = [
  {
    name: "EU–Turkey Customs Union",
    parties: [EU, ["TR"]],
    potential_duty_rate: "0% (placeholder) on most industrial goods in free circulation",
    proof_required: "A.TR movement certificate",
    notes:
      "Covers most manufactured/industrial goods between the EU and Turkey. Most agricultural and processed-agricultural products are only partially covered — confirm your product's chapter is included.",
  },
  {
    name: "UK–Turkey Free Trade Agreement",
    parties: [["GB"], ["TR"]],
    potential_duty_rate: "0% (placeholder) for goods meeting rules of origin",
    proof_required: "EUR.1 movement certificate or origin declaration",
    notes:
      "Replaced the EU–Turkey Customs Union for UK trade after Brexit. Origin must be substantiated under this agreement's specific rules of origin.",
  },
  {
    name: "EU–UK Trade and Cooperation Agreement (TCA)",
    parties: [EU, ["GB"]],
    potential_duty_rate: "0% (placeholder) for goods meeting rules of origin",
    proof_required: "Statement on origin (exporter-issued) or importer's knowledge",
    notes:
      "Tariff-free only for goods that meet the TCA's product-specific rules of origin — third-country goods merely passing through the EU or UK do not automatically qualify.",
  },
  {
    name: "USMCA (US–Mexico–Canada Agreement)",
    parties: [["US", "MX", "CA"]],
    potential_duty_rate: "0% (placeholder) for originating goods",
    proof_required: "USMCA certification of origin",
    notes:
      "Replaced NAFTA. Product-specific rules of origin apply — automotive and textiles have notably strict requirements.",
  },
  {
    name: "EU–Canada CETA",
    parties: [EU, ["CA"]],
    potential_duty_rate: "0% (placeholder) on most goods meeting rules of origin",
    proof_required: "Origin declaration by a registered exporter (REX)",
    notes: "Most industrial goods are duty-free; some agricultural lines remain subject to quotas.",
  },
  {
    name: "EU–Japan Economic Partnership Agreement",
    parties: [EU, ["JP"]],
    potential_duty_rate: "0% or reduced (placeholder) for originating goods",
    proof_required: "Statement on origin or importer's knowledge",
    notes: "Covers most goods; some agricultural products follow staged tariff reductions.",
  },
  {
    name: "EU–South Korea FTA",
    parties: [EU, ["KR"]],
    potential_duty_rate: "0% (placeholder) for originating goods",
    proof_required: "Origin declaration (approved/registered exporter for higher values)",
    notes: "One of the EU's most-used FTAs; verify the product-specific origin rule.",
  },
  {
    name: "EU–Vietnam FTA",
    parties: [EU, ["VN"]],
    potential_duty_rate: "0% or staged reduction (placeholder)",
    proof_required: "Origin declaration / REX statement",
    notes: "Tariffs phase out over several years depending on the product line.",
  },
  {
    name: "EU–Singapore FTA",
    parties: [EU, ["SG"]],
    potential_duty_rate: "0% (placeholder) for originating goods",
    proof_required: "Origin declaration",
    notes: "Covers substantially all trade in goods.",
  },
  {
    name: "UK–Japan Comprehensive EPA",
    parties: [["GB"], ["JP"]],
    potential_duty_rate: "0% or reduced (placeholder) for originating goods",
    proof_required: "Statement on origin or importer's knowledge",
    notes: "The UK's continuity-plus agreement with Japan after Brexit.",
  },
  {
    name: "UK–Australia FTA",
    parties: [["GB"], ["AU"]],
    potential_duty_rate: "0% (placeholder) on most goods",
    proof_required: "Origin declaration or importer's knowledge",
    notes: "Most goods are duty-free from entry into force; some agricultural quotas apply.",
  },
  {
    name: "UK–New Zealand FTA",
    parties: [["GB"], ["NZ"]],
    potential_duty_rate: "0% (placeholder) on most goods",
    proof_required: "Origin declaration or importer's knowledge",
    notes: "Most goods duty-free; check product-specific rules of origin.",
  },
  {
    name: "CPTPP (Comprehensive and Progressive Trans-Pacific Partnership)",
    parties: [["AU", "BN", "CA", "CL", "JP", "MY", "MX", "NZ", "PE", "SG", "VN", "GB"]],
    potential_duty_rate: "0% or staged reduction (placeholder) for originating goods",
    proof_required: "Certification of origin (self-certified)",
    notes:
      "Plurilateral Pacific agreement (the UK acceded in 2024). Rules of origin allow cumulation across members.",
  },
  {
    name: "RCEP (Regional Comprehensive Economic Partnership)",
    parties: [[...ASEAN, "CN", "JP", "KR", "AU", "NZ"]],
    potential_duty_rate: "Reduced or 0% (placeholder), staged by member and product",
    proof_required: "RCEP certificate of origin or approved-exporter declaration",
    notes:
      "The largest trade bloc by GDP. Tariff outcomes differ per member pair — verify the specific schedule.",
  },
  {
    name: "ASEAN Trade in Goods Agreement (ATIGA)",
    parties: [ASEAN],
    potential_duty_rate: "0–5% (placeholder) for originating goods",
    proof_required: "Form D certificate of origin",
    notes: "Intra-ASEAN trade; most tariff lines are at zero for originating goods.",
  },
  {
    name: "GCC Customs Union",
    parties: [["AE", "SA", "QA", "KW", "BH", "OM"]],
    potential_duty_rate: "0% (placeholder) for goods in free circulation within the GCC",
    proof_required: "GCC customs documentation / statistical declaration",
    notes: "Common external tariff; goods move duty-free between member states once cleared.",
  },
  {
    name: "MERCOSUR",
    parties: [["AR", "BR", "PY", "UY"]],
    potential_duty_rate: "0% (placeholder) for originating intra-bloc trade",
    proof_required: "MERCOSUR certificate of origin",
    notes: "Common market of the Southern Cone; sector exceptions exist (sugar, automotive).",
  },
  {
    name: "European Economic Area (EEA)",
    parties: [EU, ["NO", "IS", "LI"]],
    potential_duty_rate: "0% (placeholder) on industrial goods meeting origin rules",
    proof_required: "EUR.1 movement certificate or origin declaration",
    notes: "Covers industrial goods; most agricultural and fisheries products are excluded.",
  },
  {
    name: "EU–Switzerland bilateral agreements",
    parties: [EU, ["CH"]],
    potential_duty_rate: "0% (placeholder) on industrial goods meeting origin rules",
    proof_required: "EUR.1 movement certificate or origin declaration",
    notes: "Industrial goods trade is largely duty-free under the 1972 FTA and bilaterals.",
  },
];

function matches(program: TradeProgramDef, origin: string, dest: string): boolean {
  if (origin === dest) return false;
  if (program.parties.length === 1) {
    const members = program.parties[0];
    return members.includes(origin) && members.includes(dest);
  }
  const [a, b] = program.parties;
  return (
    (a.includes(origin) && b.includes(dest)) ||
    (b.includes(origin) && a.includes(dest))
  );
}

/**
 * Look up preferential programs for an origin/destination pair — any pair,
 * worldwide. Returns one entry per matching program, or an explicit
 * "no program found" entry so the optimizer can say so honestly.
 */
export function findTradePrograms(
  originCountry: string | null | undefined,
  destinationCountry: string | null | undefined,
): TradeProgramEligibility[] {
  const origin = originCountry?.toUpperCase();
  const dest = destinationCountry?.toUpperCase();
  if (!origin || !dest || origin === dest) return [];

  const found = TRADE_PROGRAMS.filter((p) => matches(p, origin, dest));

  if (found.length > 0) {
    return found.map((p) => ({
      name: p.name,
      may_apply: true,
      potential_duty_rate: p.potential_duty_rate,
      proof_required: p.proof_required,
      notes: p.notes,
    }));
  }

  return [
    {
      name: `${origin} → ${dest}`,
      may_apply: false,
      potential_duty_rate: "Standard MFN duty applies (placeholder)",
      proof_required: "—",
      notes:
        "No preferential trade program between these countries is in our reference set. Bilateral, GSP, or sector-specific arrangements may still exist — verify with an official source.",
    },
  ];
}
