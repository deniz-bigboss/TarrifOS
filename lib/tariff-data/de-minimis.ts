import type { DeMinimisNote } from "@/types";

/**
 * De minimis reference notes for destination countries Kustaro targets at
 * launch. Thresholds change frequently and depend on shipment channel
 * (postal/express/formal entry) — every entry is explicitly a placeholder
 * to verify, not a number to rely on for a filing decision.
 */
const DE_MINIMIS: Record<string, Omit<DeMinimisNote, "country">> = {
  US: {
    threshold_placeholder: "$800 per importer per day (Section 321, placeholder)",
    notes:
      "Low-value shipments under this threshold may enter free of duty and most taxes. CBP scrutinizes shipments deliberately split to stay under the threshold.",
  },
  GB: {
    threshold_placeholder: "£135 (placeholder)",
    notes:
      "Below this value, VAT is typically collected at the point of sale rather than at the border. Duty relief rules differ by goods type — verify current HMRC guidance.",
  },
  CA: {
    threshold_placeholder: "CAD 150 duty / CAD 40 tax via courier from US or MX; CAD 20 postal (placeholder)",
    notes:
      "Thresholds differ by channel and origin under CUSMA — verify current CBSA guidance for your shipment route.",
  },
  AU: {
    threshold_placeholder: "AUD 1,000 (placeholder)",
    notes:
      "No duty/border GST below this value, but GST is collected at the point of sale by registered overseas sellers.",
  },
  NZ: {
    threshold_placeholder: "NZD 1,000 (placeholder)",
    notes:
      "No duty below this value; GST is collected at the point of sale by registered overseas suppliers.",
  },
  JP: {
    threshold_placeholder: "JPY 10,000 (CIF, placeholder)",
    notes:
      "Shipments at or below this customs value are generally exempt from duty and consumption tax; exclusions apply (e.g. leather goods, rice).",
  },
  SG: {
    threshold_placeholder: "SGD 400 (placeholder)",
    notes:
      "GST relief applies below this value for imports, though GST on low-value goods is collected at sale by registered sellers.",
  },
};

const EU_DEFAULT: Omit<DeMinimisNote, "country"> = {
  threshold_placeholder: "€150 customs-duty de minimis (placeholder)",
  notes:
    "Customs duty is generally waived under this value, but VAT applies from the first cent under EU e-commerce VAT rules (IOSS). Verify current rules for the specific member state.",
};

const EU_MEMBERS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

/** Returns a de minimis reference note for the destination, if known. */
export function getDeMinimis(
  destinationCountry: string | null | undefined,
): DeMinimisNote | null {
  if (!destinationCountry) return null;
  const c = destinationCountry.toUpperCase();
  if (DE_MINIMIS[c]) return { country: c, ...DE_MINIMIS[c] };
  if (EU_MEMBERS.has(c)) return { country: c, ...EU_DEFAULT };
  return null;
}
