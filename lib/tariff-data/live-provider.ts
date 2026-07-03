import type {
  CandidateCode,
  DutyMeasure,
  Restriction,
  TariffCode,
} from "@/types";
import type { TariffDataProvider } from "./types";
import { SeedTariffDataProvider } from "./seed-provider";
import { ukDutyMeasure, ukRestrictions } from "./live/uk-trade-tariff";
import { usDutyMeasure } from "./live/us-hts";

/**
 * LiveTariffDataProvider — overlays live government tariff APIs on top of the
 * deterministic seed provider.
 *
 * Duty measures are fetched live where an adapter exists for the destination
 * (GB → UK Trade Tariff API, US → USITC HTS); everything else, and any live
 * failure, falls through to the seed provider. Retrieval/search stays on the
 * seed data because it is cross-jurisdiction and instant — the high-value live
 * piece is the actual duty rate, which is what users need to be current.
 */
export class LiveTariffDataProvider implements TariffDataProvider {
  readonly name = "live";
  private seed = new SeedTariffDataProvider();

  searchCodes(
    query: string,
    destinationCountry: string,
    opts?: { emphasize?: string },
  ): Promise<CandidateCode[]> {
    return this.seed.searchCodes(query, destinationCountry, opts);
  }

  getCodeDetails(code: string, destinationCountry: string): Promise<TariffCode | null> {
    return this.seed.getCodeDetails(code, destinationCountry);
  }

  async getDutyMeasures(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<DutyMeasure | null> {
    const dest = destinationCountry.toUpperCase();
    try {
      if (dest === "GB") {
        const live = await ukDutyMeasure(code, originCountry, destinationCountry);
        if (live) return live;
      } else if (dest === "US") {
        const live = await usDutyMeasure(code, originCountry, destinationCountry);
        if (live) return live;
      }
    } catch {
      // fall through to seed
    }
    return this.seed.getDutyMeasures(code, originCountry, destinationCountry);
  }

  getRequiredDocuments(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<string[]> {
    return this.seed.getRequiredDocuments(code, originCountry, destinationCountry);
  }

  async getRestrictions(
    code: string,
    originCountry: string,
    destinationCountry: string,
  ): Promise<Restriction[]> {
    const base = await this.seed.getRestrictions(code, originCountry, destinationCountry);
    if (destinationCountry.toUpperCase() === "GB") {
      try {
        const live = await ukRestrictions(code, originCountry);
        return [...base, ...live];
      } catch {
        // ignore live failure
      }
    }
    return base;
  }
}
