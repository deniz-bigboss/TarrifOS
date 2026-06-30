import type { DeMinimisNote } from "@/types";

/**
 * De minimis reference notes for destination countries TariffOS targets at
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
