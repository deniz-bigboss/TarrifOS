import { NextResponse } from "next/server";
import { cacheClear } from "@/lib/tariff-data/live/cache";
import { resetTariffDataProvider } from "@/lib/tariff-data";
import { refreshTradeRemedyOverrides } from "@/lib/tariff-data/trade-remedies";

export const dynamic = "force-dynamic";

/**
 * Scheduled tariff refresh.
 *
 * Live duty rates are cached per serverless instance (12h TTL). This route
 * flushes that cache and resets the provider so the next classification
 * re-fetches current rates from the government APIs — that is what keeps rates
 * (including live UK anti-dumping/safeguard measures) automatically up to date.
 *
 * Wired to a daily Vercel Cron (see vercel.json). Protected by CRON_SECRET:
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Also callable
 * manually with the same header to force a refresh on demand.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const cleared = cacheClear();
  resetTariffDataProvider();
  // Pull the latest trade-remedy overrides (US trade-war rates) if configured.
  const overrides = await refreshTradeRemedyOverrides();

  return NextResponse.json({
    ok: true,
    cleared,
    tradeRemedyOverrides: overrides,
    refreshedAt: new Date().toISOString(),
    note: "Live tariff cache flushed and trade-remedy overrides refreshed; next classifications use current rates.",
  });
}
