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
import { checkTranslationLimit } from "@/lib/billing/limits";
import { recordUsageEvent } from "@/lib/db/usage";
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
): Promise<
  ActionResult<{ markdown: string; machineTranslated: boolean; remaining: number | null }>
> {
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

  // English needs no AI — render straight from the source data, no quota.
  if (targetLocale === "en") {
    return {
      ok: true,
      data: {
        markdown: toMarkdown(
          { input, result, classificationId, createdAt, readiness },
          REPORT_MESSAGES.en,
        ),
        machineTranslated: false,
        remaining: null,
      },
    };
  }

  // Enforce the monthly translation quota (each translation is one AI call).
  const limit = await checkTranslationLimit(
    supabase,
    session.organization.id,
    session.organization.plan,
  );
  if (!limit.allowed) {
    return { ok: false, error: limit.message ?? "Monthly translation limit reached." };
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

  // Count the translation only once it actually succeeded.
  await recordUsageEvent(supabase, {
    organizationId: session.organization.id,
    eventType: "translation",
    metadata: { classification_id: classificationId, locale: targetLocale },
  });

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
  const remaining =
    limit.limit == null ? null : Math.max(0, (limit.remaining ?? 0) - 1);
  return { ok: true, data: { markdown, machineTranslated: true, remaining } };
}
