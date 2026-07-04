import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { tr } from "./tr";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { zh } from "./zh";
import { ar } from "./ar";
import { pt } from "./pt";

export type { Messages } from "./en";

const DICTIONARIES: Record<Locale, Messages> = { en, tr, es, fr, de, zh, ar, pt };

/** Returns the full message dictionary for a locale (English if unknown). */
export function getMessages(locale: Locale): Messages {
  return DICTIONARIES[locale] ?? en;
}
