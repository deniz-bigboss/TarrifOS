/**
 * Public-access gate.
 *
 * Kustaro is held closed to the public until the legal review of the product
 * (terms, refund policy, the claims the marketing pages make) is finished.
 * While the gate is up, anonymous visitors get a holding page instead of the
 * site, search engines are told not to index anything, and no new subscription
 * can be started.
 *
 * The gate is ON by default — that is deliberate. Reopening is an explicit act,
 * not something that happens because a config value went missing:
 *
 *   SITE_PUBLIC=1        opens the site again (set in Vercel, then redeploy)
 *   SITE_PREVIEW_KEY     optional shared key so someone without an account
 *                        (a lawyer, an advisor) can see the site via
 *                        https://kustaro.app/?preview=<key>
 *
 * Operators on the admin allowlist always pass once signed in, so no extra
 * configuration is needed to demo the product.
 *
 * This module is imported by middleware and therefore must stay free of Node
 * built-ins — edge runtime only.
 */

export const PREVIEW_PARAM = "preview";
export const PREVIEW_COOKIE = "kustaro_preview";
export const HOLDING_PATH = "/unavailable";

/** How long a preview grant lasts before the visitor needs the link again. */
const PREVIEW_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Hard closure, overriding SITE_PUBLIC.
 *
 * The site was reopened briefly to check the production build and then needed
 * to go dark again, without waiting on a dashboard round trip. While this is
 * true the gate stays up no matter what SITE_PUBLIC says — closing must not
 * depend on config that only one person can reach.
 *
 * To reopen: set this to false. SITE_PUBLIC then governs again, so the site
 * comes back only if that is also set to "1".
 */
const FORCE_CLOSED = true;

export function isPublicAccessSuspended(): boolean {
  if (FORCE_CLOSED) return true;
  return process.env.SITE_PUBLIC !== "1";
}

/**
 * Paths that stay reachable while the gate is up.
 *
 * `/login` is deliberately open: it is the way the founders get in to demo the
 * product, and it discloses nothing beyond the product's existence. `/signup`
 * is *not* open — no new accounts while the site is closed.
 *
 * The crawler-facing routes stay open so `robots.txt` can actually say
 * "index nothing" rather than being rewritten into the holding page.
 */
const ALLOWED_PATHS = new Set([
  HOLDING_PATH,
  "/login",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/twitter-image",
]);

export function isAlwaysAllowedPath(pathname: string): boolean {
  if (ALLOWED_PATHS.has(pathname)) return true;
  // Supabase auth callbacks and sign-out must complete for the login flow to
  // work at all.
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

/** Constant-time-ish compare so the preview key can't be probed byte by byte. */
function keyMatches(candidate: string, expected: string): boolean {
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Validates a preview key against SITE_PREVIEW_KEY. Always false when no key is
 * configured, so an unset env var can never open the gate.
 */
export function isValidPreviewKey(candidate: string | null | undefined): boolean {
  const expected = process.env.SITE_PREVIEW_KEY;
  if (!expected || !candidate) return false;
  return keyMatches(candidate, expected);
}

export function previewCookieOptions() {
  return {
    path: "/",
    maxAge: PREVIEW_MAX_AGE_SECONDS,
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
}
