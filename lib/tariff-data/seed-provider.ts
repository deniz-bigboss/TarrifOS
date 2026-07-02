import type {
  CandidateCode,
  DutyMeasure,
  Restriction,
  TariffCode,
} from "@/types";
import type { TariffDataProvider } from "./types";
import { SEED_BY_CODE, SEED_TARIFF_CODES } from "./seed-data";
import { searchSeedCodes } from "./search";

/**
 * SeedTariffDataProvider — local, dependency-free implementation of the
 * TariffDataProvider interface backed by the seed code dataset.
 *
 * This is the launch provider: it never calls live government APIs. Real
 * adapters (EU TARIC, UK Trade Tariff, US HTS, Turkey) implement the same
 * interface and slot in via getTariffDataProvider().
 */
export class SeedTariffDataProvider implements TariffDataProvider {
  readonly name = "seed";

  private codes: TariffCode[];

  constructor(codes: TariffCode[] = SEED_TARIFF_CODES) {
    this.codes = codes;
  }

  async searchCodes(
    query: string,
    _destinationCountry: string,
    opts?: { emphasize?: string },
  ): Promise<CandidateCode[]> {
    // The seed dataset uses harmonized HS6 codes valid across our launch lanes,
    // so destination is accepted but not used to filter for the MVP.
    return searchSeedCodes(this.codes, query, 8, opts?.emphasize);
  }

  async getCodeDetails(
    code: string,
    _destinationCountry: string,
  ): Promise<TariffCode | null> {
    return SEED_BY_CODE.get(code) ?? null;
  }

  async getDutyMeasures(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<DutyMeasure | null> {
    const record = SEED_BY_CODE.get(code);
    if (!record) return null;

    return {
      code,
      originCountry,
      destinationCountry,
      dutyRatePlaceholder: record.dutyRatePlaceholder,
      vatRatePlaceholder: estimateVatPlaceholder(destinationCountry),
      notes: [
        "Duty and VAT figures are placeholders from seed data.",
        "Preferential rates may apply under EU–Turkey Customs Union, EU–UK TCA, GSP, etc.",
        "Confirm actual measures with an official tariff source before declaration.",
      ],
      isPlaceholder: true,
    };
  }

  async getRequiredDocuments(
    code: string,
    _originCountry: string,
    _destinationCountry: string,
  ): Promise<string[]> {
    const record = SEED_BY_CODE.get(code);
    return record ? [...record.requiredDocuments] : [];
  }

  async getRestrictions(
    code: string,
    _originCountry: string,
    _destinationCountry: string,
  ): Promise<Restriction[]> {
    const record = SEED_BY_CODE.get(code);
    if (!record) return [];

    return record.restrictionNotes.map<Restriction>((message) => ({
      code,
      message,
      severity: record.riskLevel === "high" ? "critical" : "warning",
    }));
  }
}

/** Very rough VAT placeholder by destination — clearly marked as non-authoritative. */
function estimateVatPlaceholder(destination: string): string | null {
  const map: Record<string, string> = {
    DE: "19% (standard VAT, placeholder)",
    FR: "20% (standard VAT, placeholder)",
    NL: "21% (standard VAT, placeholder)",
    IT: "22% (standard VAT, placeholder)",
    ES: "21% (standard VAT, placeholder)",
    PL: "23% (standard VAT, placeholder)",
    BE: "21% (standard VAT, placeholder)",
    GB: "20% (standard VAT, placeholder)",
    TR: "20% (standard KDV, placeholder)",
    US: "no federal VAT; state sales/use tax may apply",
  };
  return map[destination?.toUpperCase()] ?? null;
}
