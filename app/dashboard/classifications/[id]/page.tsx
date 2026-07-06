import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import {
  getClassificationDetail,
  requestRowToProductInput,
  resultRowToClassificationResult,
} from "@/lib/db/classifications";
import { computeReadiness } from "@/lib/scoring/readiness";
import { ResultView } from "@/components/classification/result-view";
import { ImproveConfidence } from "@/components/classification/improve-confidence";
import { SaveToLibrary } from "@/components/classification/save-to-library";
import { FeedbackForm } from "@/components/classification/feedback-form";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Customs-readiness classification — Kustaro" };
// The improve-confidence action (full pipeline re-run) is served from here.
export const maxDuration = 60;

export default async function ClassificationDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { prev?: string };
}) {
  const session = await getSessionContext();
  if (!session) return null;
  const { locale } = getI18n();

  const supabase = createClient();
  const detail = await getClassificationDetail(supabase, params.id);
  if (!detail) notFound();

  const { request, result, candidates, feedback } = detail;
  const input = requestRowToProductInput(request);

  const classification = result
    ? resultRowToClassificationResult(result, candidates)
    : null;
  const readiness = classification
    ? computeReadiness(input, classification)
    : null;

  // The confidence-improvement loop lands here with ?prev=<old %>.
  const prev = Number(searchParams?.prev);
  const improvedBanner =
    classification && Number.isFinite(prev) && prev > 0 ? (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <ArrowUp className="h-4 w-4" />
        Confidence {Math.round(classification.confidence * 100) >= prev ? "improved" : "changed"} from {prev}% to{" "}
        {Math.round(classification.confidence * 100)}%. The previous version is
        kept in your history.
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/classifications">
            <ArrowLeft className="h-4 w-4" /> All classifications
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          {formatDateTime(request.created_at)}
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Customs-readiness classification
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {request.product_name}
        </h1>
        <p className="text-sm text-muted-foreground">{request.product_description}</p>
      </div>

      {improvedBanner}

      {classification && readiness ? (
        <ResultView
          input={input}
          result={classification}
          classificationId={request.id}
          createdAt={formatDateTime(request.created_at)}
          readiness={readiness}
          reportLocale={locale}
          improveSlot={
            <ImproveConfidence
              questions={classification.missing_information}
              confidence={classification.confidence}
              recommendedCode={classification.recommended_code}
              input={input}
              refinedFromId={request.id}
            />
          }
          actionsSlot={<SaveToLibrary classificationId={request.id} />}
        />
      ) : (
        <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
          This classification has no result yet (status: {request.status}).
        </p>
      )}

      {classification && <FeedbackForm requestId={request.id} existing={feedback} />}
    </div>
  );
}
