/** i18n configuration: supported locales, RTL set, and country→locale map. */

export const LOCALES = ["en", "tr", "es", "fr", "de", "zh", "ar", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The cookie the app reads to decide which language to render. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Right-to-left locales — the root <html dir> flips for these. */
export const RTL_LOCALES: Locale[] = ["ar"];

/** Native names for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ar: "العربية",
  pt: "Português",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

/**
 * Maps an ISO-3166 alpha-2 country (from the visitor's IP geo) to the best
 * supported locale. Countries not listed fall back to English.
 */
export const COUNTRY_LOCALE: Record<string, Locale> = {
  // Turkish
  TR: "tr", CY: "tr",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  // French
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", CI: "fr", SN: "fr", CM: "fr",
  ML: "fr", CD: "fr", MG: "fr", TN: "fr", DZ: "fr", MA: "fr",
  // German
  DE: "de", AT: "de", CH: "de", LI: "de",
  // Chinese
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", IQ: "ar", JO: "ar", KW: "ar", LB: "ar",
  QA: "ar", OM: "ar", BH: "ar", YE: "ar", SY: "ar", LY: "ar", SD: "ar",
  PS: "ar",
  // Portuguese
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt",
};

/** Best locale for a country code, defaulting to English. */
export function localeForCountry(country: string | undefined | null): Locale {
  if (!country) return DEFAULT_LOCALE;
  return COUNTRY_LOCALE[country.toUpperCase()] ?? DEFAULT_LOCALE;
}
