import { createHash } from "crypto";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";

/**
 * Per-IP daily backstop for the guest classification flow. The one-free-run
 * cookie is trivially reset in a private window, and every guest run costs
 * real AI quota — so a salted IP hash is counted per day via the service
 * role (see supabase/migrations/0007_guest_usage.sql).
 *
 * Fails OPEN: if the table/function isn't migrated yet or the admin client
 * isn't configured, guests are not blocked.
 */

const GUEST_IP_DAILY_LIMIT = 5;

export function hashGuestIp(ip: string): string {
  return createHash("sha256").update(`kustaro-guest:${ip}`).digest("hex");
}

/** Extract the client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIpFrom(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip");
}

/** Count this guest attempt; true = allowed, false = daily IP cap reached. */
export async function countGuestUseAllowed(ip: string | null): Promise<boolean> {
  if (!ip || !isAdminConfigured()) return true;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("increment_guest_usage", {
      p_ip_hash: hashGuestIp(ip),
    });
    if (error) return true; // fail open (e.g. migration not applied yet)
    return typeof data === "number" ? data <= GUEST_IP_DAILY_LIMIT : true;
  } catch {
    return true;
  }
}
