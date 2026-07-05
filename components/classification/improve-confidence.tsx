"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import {
  refineClassificationAction,
  type GuestClassification,
} from "@/app/classify/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProductInput } from "@/types";

/**
 * The confidence-improvement loop: answer the open questions, re-run the
 * classification, and see old → new confidence. Signed-in users get a new
 * saved version linked to the original; guests refine in place.
 */
export function ImproveConfidence({
  questions,
  confidence,
  recommendedCode,
  input,
  refinedFromId,
  onGuestRefined,
}: {
  questions: string[];
  confidence: number;
  /** Currently recommended code (keeps confidence monotonic on re-runs). */
  recommendedCode?: string;
  input: ProductInput;
  /** Authed: the request id this result belongs to. */
  refinedFromId?: string;
  /** Guest flow: swap the in-page result instead of navigating. */
  onGuestRefined?: (data: GuestClassification) => void;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = questions.slice(0, 5);
  if (shown.length === 0) return null;

  const answeredCount = shown.filter((q) => (answers[q] ?? "").trim()).length;

  async function submit() {
    setPending(true);
    setError(null);
    const res = await refineClassificationAction({
      input,
      answers,
      previousConfidence: confidence,
      previousCode: recommendedCode,
      refinedFromId,
    });
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    if (res.data.kind === "saved") {
      router.push(
        `/dashboard/classifications/${res.data.id}?prev=${Math.round(confidence * 100)}`,
      );
      return;
    }
    onGuestRefined?.(res.data.data);
    setPending(false);
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="border-b border-border p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> Improve confidence
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Confidence: {Math.round(confidence * 100)}%. Answer{" "}
          {shown.length === 1 ? "1 question" : `${shown.length} questions`} to
          improve confidence — a new version is generated and both are kept.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {shown.map((q) => (
          <div key={q} className="space-y-1.5">
            <label className="text-sm font-medium">{q}</label>
            <Input
              value={answers[q] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
              }
              placeholder="Your answer…"
            />
          </div>
        ))}
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button onClick={submit} disabled={pending || answeredCount === 0}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          Update classification
          {answeredCount > 0 &&
            ` (${answeredCount}/${shown.length} answered)`}
        </Button>
      </CardContent>
    </Card>
  );
}
