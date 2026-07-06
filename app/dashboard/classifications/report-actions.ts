"use server";

import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import {
  getClassificationDetail,
  requestRowToProductInput,
  resultRowToClassificationResult,
} from "@/lib/db/classifications";
import { computeReadiness } from "@/lib/scoring/readiness";
import { toMarkdown } from "@/lib/export/report";
import { REPORT_MESSAGES } from "@/lib/export/report-messages";
import { translateReportBundle } from "@/lib/export/translate-report";
import { LOCALE_NAMES, isLocale, type Locale } from "@/lib/i18n/config";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

/** Language names the translator prompt understands (English name of the locale). */
const TRANSLATE_TARGET: Record<Locale, string> = {
  en: "English",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Simplified Chinese",
  ar: "Arabic",
  pt: "Portuguese",
};

/**
 * Fully translate a saved classification's report into `targetLocale` — the
 * curated template comes from REPORT_MESSAGES, the AI analysis is machine-
 * translated in one call. Fetches the report server-side (never trusts client
 * data) and is org-scoped. Returns the rendered Markdown. `en` short-circuits
 * with no AI call.
 */
export async function translateReportAction(
  classificationId: string,
  targetLocale: string,
): Promise<ActionResult<{ markdown: string; machineTranslated: boolean }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (!isLocale(targetLocale)) return { ok: false, error: "Unsupported language." };

  const supabase = createClient();
  const detail = await getClassificationDetail(supabase, classificationId);
  if (!detail?.result || detail.request.organization_id !== session.organization.id) {
    return { ok: false, error: "Report not found." };
  }

  const input = requestRowToProductInput(detail.request);
  const result = resultRowToClassificationResult(detail.result, detail.candidates);
  const readiness = computeReadiness(input, result);
  const createdAt = detail.request.created_at;

  // English needs no AI — render straight from the source data.
  if (targetLocale === "en") {
    return {
      ok: true,
      data: {
        markdown: toMarkdown(
          { input, result, classificationId, createdAt, readiness },
          REPORT_MESSAGES.en,
        ),
        machineTranslated: false,
      },
    };
  }

  const bundle = await translateReportBundle(
    result,
    readiness,
    TRANSLATE_TARGET[targetLocale] ?? LOCALE_NAMES[targetLocale],
  );
  if (!bundle) {
    return {
      ok: false,
      error:
        "Translation is temporarily unavailable — please try again in a moment or use the English report.",
    };
  }

  const markdown = toMarkdown(
    {
      input,
      result: bundle.result,
      classificationId,
      createdAt,
      readiness: bundle.readiness,
    },
    REPORT_MESSAGES[targetLocale],
    { machineTranslated: true },
  );
  return { ok: true, data: { markdown, machineTranslated: true } };
}
