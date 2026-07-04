import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getMessages } from "./messages";

/**
 * Reads the active locale from the NEXT_LOCALE cookie (set by the geo-detection
 * middleware or the manual switcher). Falls back to English. Server-only.
 */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Convenience: the active locale plus its message dictionary, for a server page. */
export function getI18n() {
  const locale = getLocale();
  return { locale, t: getMessages(locale) };
}
