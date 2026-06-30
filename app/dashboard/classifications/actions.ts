"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import {
  feedbackSchema,
  productInputSchema,
} from "@/lib/validation/schemas";
import { runClassification } from "@/lib/classification/pipeline";
import {
  getClassificationDetail,
  persistClassification,
} from "@/lib/db/classifications";
import { recordUsageEvent } from "@/lib/db/usage";
import { saveFeedback } from "@/lib/db/feedback";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { getAIProvider } from "@/lib/ai";
import type { ProductLookupResult } from "@/lib/ai/types";
import type { ProductInput } from "@/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Create a classification from the wizard: validate → enforce plan limit →
 * run the pipeline → persist → record usage. Returns the new request id.
 */
export async function createClassificationAction(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  const supabase = createClient();
  const orgId = session.organization.id;

  // Enforce plan limit.
  const limit = await checkClassificationLimit(
    supabase,
    orgId,
    session.organization.plan,
  );
  if (!limit.allowed) {
    return { ok: false, error: limit.message ?? "Monthly limit reached." };
  }

  const input = parsed.data as ProductInput;

  try {
    const output = await runClassification(input);
    const { requestId } = await persistClassification(supabase, {
      organizationId: orgId,
      createdBy: session.user.id,
      input,
      output,
      source: "web",
    });

    await recordUsageEvent(supabase, {
      organizationId: orgId,
      eventType: "classification",
      metadata: {
        source: "web",
        recommended_code: output.result.recommended_code,
        provider: output.providerName,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/classifications");
    return { ok: true, data: { id: requestId } };
  } catch (err) {
    console.error("[createClassificationAction] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Classification failed.",
    };
  }
}

/**
 * Quick Find: identify a product from a short name/model so the wizard can
 * pre-fill description, material, use, category, brand and model. Does not
 * count against the classification plan limit — it's a lookup, not a
 * classification.
 */
export async function lookupProductAction(
  query: string,
): Promise<ActionResult<ProductLookupResult>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "Type at least 2 characters." };
  }

  try {
    const result = await getAIProvider().lookupProduct(trimmed);
    return { ok: true, data: result };
  } catch (err) {
    console.error("[lookupProductAction] failed:", err);
    return { ok: false, error: "Lookup failed. Try again or switch it off to type manually." };
  }
}

/** Persist broker/customs feedback for a classification result (the data moat). */
export async function submitFeedbackAction(
  requestId: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }

  const supabase = createClient();
  const detail = await getClassificationDetail(supabase, requestId);
  if (!detail?.result) {
    return { ok: false, error: "Classification result not found." };
  }

  try {
    const { id } = await saveFeedback(supabase, {
      organizationId: session.organization.id,
      classificationResultId: detail.result.id,
      actualCode: parsed.data.actual_code ?? null,
      wasCorrect: parsed.data.was_correct ?? null,
      brokerNotes: parsed.data.broker_notes ?? null,
      shipmentCleared: parsed.data.shipment_cleared ?? null,
      delayOccurred: parsed.data.delay_occurred ?? null,
      penaltyOccurred: parsed.data.penalty_occurred ?? null,
    });

    await recordUsageEvent(supabase, {
      organizationId: session.organization.id,
      eventType: "feedback",
      metadata: { request_id: requestId },
    });

    revalidatePath(`/dashboard/classifications/${requestId}`);
    return { ok: true, data: { id } };
  } catch (err) {
    console.error("[submitFeedbackAction] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save feedback.",
    };
  }
}
