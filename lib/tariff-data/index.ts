import type { TariffDataProvider } from "./types";
import { SeedTariffDataProvider } from "./seed-provider";
import { LiveTariffDataProvider } from "./live-provider";

export * from "./types";
export { SeedTariffDataProvider } from "./seed-provider";
export { LiveTariffDataProvider } from "./live-provider";
export { SEED_TARIFF_CODES } from "./seed-data";

let cached: TariffDataProvider | null = null;

/**
 * Returns the active tariff-data provider.
 *
 *   TARIFF_DATA_SOURCE=live  -> LiveTariffDataProvider: fetches real MFN duty
 *     from the UK Trade Tariff API (GB) and USITC HTS (US), with the seed
 *     provider as the fallback for everything else and any live failure.
 *   (unset / anything else)  -> SeedTariffDataProvider (deterministic, offline).
 *
 * All adapters implement the same interface, so the rest of the app is
 * unaffected by the choice.
 */
export function getTariffDataProvider(): TariffDataProvider {
  if (cached) return cached;
  cached =
    (process.env.TARIFF_DATA_SOURCE || "").toLowerCase() === "live"
      ? new LiveTariffDataProvider()
      : new SeedTariffDataProvider();
  return cached;
}

/** Reset the cached provider (used by the scheduled refresh route). */
export function resetTariffDataProvider(): void {
  cached = null;
}
