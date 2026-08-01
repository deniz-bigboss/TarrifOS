import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/db/supabase/middleware";
import { isAdminEmail } from "@/lib/auth/admins";
import {
  HOLDING_PATH,
  PREVIEW_COOKIE,
  PREVIEW_PARAM,
  isAlwaysAllowedPath,
  isPublicAccessSuspended,
  isValidPreviewKey,
  previewCookieOptions,
} from "@/lib/site/access";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeForCountry,
} from "@/lib/i18n/config";

export async function middleware(request: NextRequest) {
  const { response, email } = await updateSession(request);

  // Geo-detect the visitor's language on first visit: if they have no locale
  // cookie yet, map their country (from the edge geo header) to a supported
  // locale and set the cookie so the site renders in their language. Once set
  // — including by the manual switcher — we never override their choice.
  if (!isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    // Vercel populates this header at the edge with the visitor's country.
    const country = request.headers.get("x-vercel-ip-country") || "";
    const locale = localeForCountry(country) || DEFAULT_LOCALE;
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  if (isPublicAccessSuspended()) {
    const gated = applyAccessGate(request, email);
    if (gated) return gated;
  }

  return response;
}

/**
 * Returns a response when the visitor must be stopped, or null to let the
 * request through. Split out so the gate's branching stays readable next to the
 * unrelated locale work above.
 */
function applyAccessGate(
  request: NextRequest,
  email: string | null,
): NextResponse | null {
  // `?preview=<key>` exchanges the shared key for a cookie, then drops the key
  // from the URL so it doesn't linger in history, referrers or screenshots.
  const offered = request.nextUrl.searchParams.get(PREVIEW_PARAM);
  if (offered && isValidPreviewKey(offered)) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete(PREVIEW_PARAM);
    const redirect = NextResponse.redirect(clean);
    redirect.cookies.set(PREVIEW_COOKIE, offered, previewCookieOptions());
    return redirect;
  }

  const allowed =
    isAlwaysAllowedPath(request.nextUrl.pathname) ||
    isAdminEmail(email) ||
    isValidPreviewKey(request.cookies.get(PREVIEW_COOKIE)?.value);
  if (allowed) return null;

  // Serve the holding page in place of whatever was requested, without a
  // redirect — the URL the visitor typed stays intact and nothing about the
  // real page leaks.
  const holding = request.nextUrl.clone();
  holding.pathname = HOLDING_PATH;
  holding.search = "";
  const blocked = NextResponse.rewrite(holding);
  blocked.headers.set("x-robots-tag", "noindex, nofollow");
  blocked.headers.set("cache-control", "no-store");
  return blocked;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and the API (API auth is
     * handled per-route with API keys).
     *
     * Keeping /api out of the matcher also means the Paddle webhook and the
     * cron jobs keep working while the public-access gate is up — billing
     * events for existing subscriptions must never be dropped.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
