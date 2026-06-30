import type { TariffDataProvider } from "./types";
import { SeedTariffDataProvider } from "./seed-provider";

export * from "./types";
export { SeedTariffDataProvider } from "./seed-provider";
export { SEED_TARIFF_CODES } from "./seed-data";

let cached: TariffDataProvider | null = null;

/**
 * Returns the active tariff-data provider.
 *
 * Today this is always the SeedTariffDataProvider. To add an official source
 * later, branch on an env var (e.g. TARIFF_PROVIDER=taric|uktt|hts) and return
 * the matching adapter — all implement the same TariffDataProvider interface.
 */
export function getTariffDataProvider(): TariffDataProvider {
  if (cached) return cached;
  cached = new SeedTariffDataProvider();
  return cached;
}
