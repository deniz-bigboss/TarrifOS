import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/db/supabase/middleware";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeForCountry,
} from "@/lib/i18n/config";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

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

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and the API (API auth is
     * handled per-route with API keys).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
