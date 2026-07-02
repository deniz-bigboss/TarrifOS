import type {
  CandidateCode,
  DutyMeasure,
  Restriction,
  TariffCode,
} from "@/types";

/**
 * TariffDataProvider is the modular adapter interface for all tariff/commodity
 * reference data. The MVP ships a SeedTariffDataProvider backed by local data so
 * the product never depends on live government APIs at launch.
 *
 * Future adapters (EU TARIC, UK Trade Tariff, US HTS, Turkey, third-party APIs)
 * implement this same interface and can be swapped in via getTariffDataProvider().
 */
export interface TariffDataProvider {
  readonly name: string;

  /**
   * Lexical/semantic search for candidate codes for a destination
   * jurisdiction. `opts.emphasize` carries the product name so adapters can
   * weight what the product IS above component mentions in its description.
   */
  searchCodes(
    query: string,
    destinationCountry: string,
    opts?: { emphasize?: string },
  ): Promise<CandidateCode[]>;

  /** Full detail for a single code. */
  getCodeDetails(
    code: string,
    destinationCountry: string,
  ): Promise<TariffCode | null>;

  /** Duty/tax measures for a code on a trade lane (placeholders for the MVP). */
  getDutyMeasures(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<DutyMeasure | null>;

  /** Documents typically required for a code on a trade lane. */
  getRequiredDocuments(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<string[]>;

  /** Restriction / controlled-goods records for a code on a trade lane. */
  getRestrictions(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<Restriction[]>;
}
