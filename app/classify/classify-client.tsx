"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, UserPlus } from "lucide-react";
import { ClassificationWizard } from "@/components/classification/wizard";
import { ResultView } from "@/components/classification/result-view";
import { ImproveConfidence } from "@/components/classification/improve-confidence";
import { Button } from "@/components/ui/button";
import type { GuestClassification } from "@/app/classify/actions";
import type { ProductInputSchema } from "@/lib/validation/schemas";
import type { Messages } from "@/lib/i18n/messages";

/**
 * The /classify client shell. Guests get one free classification rendered
 * in-page (nothing persisted) with a signup CTA to save/export more; signed-in
 * users are redirected to the saved result by the wizard itself.
 */
export function ClassifyClient({
  t,
  mode,
  initialValues,
}: {
  t: Messages["app"]["wizard"];
  mode: "guest" | "authed";
  initialValues?: Partial<ProductInputSchema>;
}) {
  const [guest, setGuest] = useState<GuestClassification | null>(null);

  if (mode === "guest" && guest) {
    const pct = (v: number) => Math.round(v * 100);
    return (
      <div className="space-y-6">
        {guest.previousConfidence !== undefined && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <ArrowUp className="h-4 w-4" />
            Confidence {guest.result.confidence >= guest.previousConfidence ? "improved" : "changed"} from{" "}
            {pct(guest.previousConfidence)}% to {pct(guest.result.confidence)}%.
          </div>
        )}

        <div className="rounded-lg border border-primary/30 bg-accent/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                This result is not saved — it disappears when you leave.
              </p>
              <p className="text-sm text-muted-foreground">
                Create a free account to save it, export the report, build your
                SKU library, and classify more products.
              </p>
            </div>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="h-4 w-4" /> Create free account
              </Link>
            </Button>
          </div>
        </div>

        <ResultView
          input={guest.input}
          result={guest.result}
          classificationId="guest-preview"
          readiness={guest.readiness}
          improveSlot={
            <ImproveConfidence
              questions={guest.result.missing_information}
              confidence={guest.result.confidence}
              recommendedCode={guest.result.recommended_code}
              input={guest.input}
              onGuestRefined={setGuest}
            />
          }
          actionsSlot={
            <span className="text-xs text-muted-foreground">
              Sign up to save this product to your SKU library.
            </span>
          }
        />
      </div>
    );
  }

  return (
    <ClassificationWizard
      t={t}
      mode={mode}
      initialValues={initialValues}
      onGuestResult={setGuest}
    />
  );
}
