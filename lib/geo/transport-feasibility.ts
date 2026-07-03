import { countryName } from "@/lib/utils";

/**
 * Road-freight feasibility between countries: a truck can only drive between
 * countries on the same contiguous landmass. Countries not listed below are
 * islands (or island groups), where international road freight isn't a
 * bookable door-to-door mode — sea, air, or courier applies instead.
 *
 * Pragmatic inclusions: GB (Channel Tunnel), SG/HK/MO (road links to the
 * mainland), BH (King Fahd Causeway). Kept deliberately physical — political
 * transit restrictions are the shipment plan's job, not the form's.
 */

const AMERICAS = [
  "CA", "US", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA",
  "CO", "VE", "GY", "SR", "GF", "EC", "PE", "BR", "BO", "PY", "UY",
  "AR", "CL",
];

const AFRO_EURASIA = [
  // Europe (mainland + Channel Tunnel)
  "AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK", "EE",
  "FI", "FR", "DE", "GI", "GR", "HU", "IT", "LV", "LI", "LT", "LU",
  "MD", "MC", "ME", "MK", "NL", "NO", "PL", "PT", "RO", "RU", "RS",
  "SK", "SI", "ES", "SE", "CH", "UA", "VA", "SM", "GB",
  // Asia & Middle East (mainland + fixed links)
  "AF", "AM", "AZ", "BD", "BH", "BT", "KH", "CN", "GE", "HK", "IN",
  "IR", "IQ", "IL", "JO", "KZ", "KP", "KR", "KW", "KG", "LA", "LB",
  "MO", "MY", "MM", "MN", "NP", "OM", "PK", "PS", "QA", "SA", "SG",
  "SY", "TJ", "TH", "TR", "TM", "AE", "UZ", "VN", "YE",
  // Africa (mainland, land-bridged to Asia at Suez)
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CF", "TD", "CG", "CD",
  "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN",
  "GW", "KE", "LS", "LR", "LY", "MW", "ML", "MR", "MA", "MZ", "NA",
  "NE", "NG", "RW", "SN", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG",
  "TN", "UG", "ZM", "ZW",
];

const LANDMASS: Record<string, string> = {};
for (const code of AMERICAS) LANDMASS[code] = "americas";
for (const code of AFRO_EURASIA) LANDMASS[code] = "afro-eurasia";

/** Can road freight physically run between these two countries? */
export function roadFeasible(origin: string, destination: string): boolean {
  const a = (origin || "").toUpperCase();
  const b = (destination || "").toUpperCase();
  if (!a || !b) return true; // nothing selected yet — don't block the form
  if (a === b) return true; // domestic trucking always exists
  const ga = LANDMASS[a];
  const gb = LANDMASS[b];
  return !!ga && ga === gb;
}

/** Human-readable reason used by form validation and API errors. */
export function roadInfeasibleReason(
  origin: string,
  destination: string,
): string {
  return `Road transport isn't possible between ${countryName(origin)} and ${countryName(destination)} — there is no land route. Choose sea, air, or courier.`;
}
