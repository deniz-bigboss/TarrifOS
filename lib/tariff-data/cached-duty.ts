import { unstable_cache } from "next/cache";
import type { DutyMeasure } from "@/types";
import { getTariffDataProvider } from "./index";

/**
 * Day-cached duty lookups for pages that render per request.
 *
 * The reference pages under /hs-code carry `revalidate = 86400` and were meant
 * to be rendered once a day. They never are: the root layout reads the locale
 * cookie, which opts every route in the app into dynamic rendering, so page
 * caching can't engage and each view was firing two live government API calls.
 * Serving ~100 pages that way is slow for the visitor, needlessly expensive,
 * and rude to a free public API — exactly what the pages set out to avoid.
 *
 * Caching the data rather than the page fixes it without giving up the
 * per-request rendering that the multi-language support depends on.
 */

/** Lets the daily refresh cron drop these figures on demand. */
export const DUTY_CACHE_TAG = "tariff-duty";

const DAY_SECONDS = 86_400;

/**
 * Arguments are part of the cache key, so each code/destination pair is stored
 * separately. Origin is fixed at CN because these pages describe a code, not a
 * trade lane, and the duty cards only ever show the destination's MFN rate.
 */
const lookup = unstable_cache(
  (code: string, destination: string): Promise<DutyMeasure | null> =>
    getTariffDataProvider().getDutyMeasures(code, "CN", destination),
  ["tariff-duty"],
  { revalidate: DAY_SECONDS, tags: [DUTY_CACHE_TAG] },
);

/**
 * Duty for a code at a destination, cached for a day. Never throws — a live
 * duty failure must not take a marketing page down.
 *
 * A lookup that falls back to reference data is cached like any other, so a
 * government API being down at the wrong moment can leave placeholder figures
 * up for as long as a day. They are labelled as reference data in the UI, and
 * the daily refresh cron clears this tag, so it self-heals by the next morning.
 */
export async function cachedDutyFor(
  code: string,
  destination: string,
): Promise<DutyMeasure | null> {
  try {
    return await lookup(code, destination);
  } catch {
    return null;
  }
}
