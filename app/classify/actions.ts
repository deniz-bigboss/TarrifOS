"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/validation/schemas";
import { runClassification } from "@/lib/classification/pipeline";
import {
  getClassificationDetail,
  persistClassification,
  requestRowToProductInput,
  resultRowToClassificationResult,
} from "@/lib/db/classifications";
import { recordUsageEvent } from "@/lib/db/usage";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { computeReadiness } from "@/lib/scoring/readiness";
import { confidenceLabel } from "@/lib/classification/confidence";
import { clientIpFrom, countGuestUseAllowed } from "@/lib/db/guest-usage";
import { saveProduct } from "@/lib/db/products";
import type { ClassificationResult, ProductInput } from "@/types";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

const GUEST_COOKIE = "kustaro_guest_used";

export interface GuestClassification {
  input: ProductInput;
  result: ClassificationResult;
  readiness: ReturnType<typeof computeReadiness>;
  /** Set on refinements so the UI can show old → new confidence. */
  previousConfidence?: number;
}

export type ClassifyOutcome =
  | { kind: "saved"; id: string }
  | { kind: "guest"; data: GuestClassification };

/**
 * The one classification entry point behind /classify.
 *
 * Signed-in users: enforce the plan limit, run the pipeline, persist, and
 * return the saved id. Guests: allow exactly ONE free classification
 * (cookie-gated), run the pipeline WITHOUT persistence, and return the full
 * result for in-page rendering — saving/exporting more requires an account.
 */
export async function classifyAction(
  raw: unknown,
): Promise<ActionResult<ClassifyOutcome>> {
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(" "),
    };
  }
  const input = parsed.data as ProductInput;

  const session = await getSessionContext();

  // ------------------------------------------------------------- guest
  if (!session) {
    const jar = cookies();
    if (jar.get(GUEST_COOKIE)?.value) {
      return {
        ok: false,
        error:
          "You've used your free classification. Create a free account to keep classifying, save products, and export reports — no credit card required.",
      };
    }
    // Per-IP daily backstop: the cookie resets in a private window, but each
    // guest run costs real AI quota.
    const ipAllowed = await countGuestUseAllowed(clientIpFrom(headers()));
    if (!ipAllowed) {
      return {
        ok: false,
        error:
          "The free-classification limit for your network was reached today. Create a free account to keep classifying — no credit card required.",
      };
    }

    try {
      const output = await runClassification(input);
      jar.set(GUEST_COOKIE, "1", {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
      });
      return {
        ok: true,
        data: {
          kind: "guest",
          data: {
            input,
            result: output.result,
            readiness: computeReadiness(input, output.result),
          },
        },
      };
    } catch (err) {
      console.error("[classifyAction guest] failed:", err);
      return { ok: false, error: "Classification failed. Please try again." };
    }
  }

  // ------------------------------------------------------------ signed in
  const supabase = createClient();
  const orgId = session.organization.id;
  const limit = await checkClassificationLimit(
    supabase,
    orgId,
    session.organization.plan,
  );
  if (!limit.allowed) {
    return { ok: false, error: limit.message ?? "Monthly limit reached." };
  }

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
    return { ok: true, data: { kind: "saved", id: requestId } };
  } catch (err) {
    console.error("[classifyAction] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Classification failed.",
    };
  }
}

export interface RefinePayload {
  /** The original input (guest flow passes it back; authed flow can too). */
  input: ProductInput;
  /** Question → user answer pairs from the improve-confidence panel. */
  answers: Record<string, string>;
  /** Confidence before refinement (for the old → new banner). */
  previousConfidence: number;
  /** The previously recommended code — used to keep confidence monotonic. */
  previousCode?: string;
  /** Authed only: the request id this refinement descends from. */
  refinedFromId?: string;
}

/**
 * Answering questions adds information; when the re-run lands on the SAME
 * code, strictly-more-consistent evidence must never *reduce* the displayed
 * confidence (lexical scoring artifacts can dip it slightly). A changed code
 * keeps its own confidence untouched.
 */
function keepConfidenceMonotonic(
  result: import("@/types").ClassificationResult,
  previousCode: string | undefined,
  previousConfidence: number,
): void {
  if (
    previousCode &&
    result.recommended_code === previousCode &&
    result.confidence < previousConfidence
  ) {
    result.confidence = previousConfidence;
    result.confidence_label = confidenceLabel(previousConfidence);
  }
}

/**
 * Confidence-improvement loop: fold the user's answers into the product
 * description, re-run the pipeline, and (for signed-in users) save a NEW
 * version linked to the original. Both versions stay in history.
 */
export async function refineClassificationAction(
  payload: RefinePayload,
): Promise<ActionResult<ClassifyOutcome>> {
  const answered = Object.entries(payload.answers)
    .map(([q, a]) => [q.trim(), a.trim()])
    .filter(([q, a]) => q && a);
  if (answered.length === 0) {
    return { ok: false, error: "Answer at least one question to improve confidence." };
  }

  // Merge answers into the STRUCTURED fields they belong to (material,
  // intended use) when those are blank — that genuinely raises input
  // completeness — and append the rest as compact detail sentences. Question
  // text itself is never appended: its filler words dilute retrieval matching.
  const refinedInput: ProductInput = { ...payload.input };
  const extraDetails: string[] = [];
  for (const [q, a] of answered) {
    const topic = q.toLowerCase();
    if (/material|composition|fabric|made of/.test(topic) && !refinedInput.material_composition) {
      refinedInput.material_composition = a;
    } else if (/intended use|end application|used for|purpose/.test(topic) && !refinedInput.intended_use) {
      refinedInput.intended_use = a;
    } else if (/country of origin/.test(topic) && !refinedInput.origin_country) {
      refinedInput.origin_country = a.toUpperCase().slice(0, 2);
    } else {
      extraDetails.push(a);
    }
  }
  if (extraDetails.length > 0) {
    refinedInput.product_description =
      `${refinedInput.product_description}\nAdditional details: ${extraDetails.join(". ")}.`.trim();
  }

  const parsed = productInputSchema.safeParse(refinedInput);
  if (!parsed.success) {
    return { ok: false, error: "The refined input is invalid." };
  }
  const input = parsed.data as ProductInput;

  const session = await getSessionContext();

  if (!session) {
    // Guests may refine their single free classification (same session,
    // no extra cookie charge — it's the same product, better answered).
    try {
      const output = await runClassification(input);
      keepConfidenceMonotonic(output.result, payload.previousCode, payload.previousConfidence);
      return {
        ok: true,
        data: {
          kind: "guest",
          data: {
            input,
            result: output.result,
            readiness: computeReadiness(input, output.result),
            previousConfidence: payload.previousConfidence,
          },
        },
      };
    } catch (err) {
      console.error("[refine guest] failed:", err);
      return { ok: false, error: "Refinement failed. Please try again." };
    }
  }

  const supabase = createClient();
  const orgId = session.organization.id;
  const limit = await checkClassificationLimit(
    supabase,
    orgId,
    session.organization.plan,
  );
  if (!limit.allowed) {
    return { ok: false, error: limit.message ?? "Monthly limit reached." };
  }

  try {
    const output = await runClassification(input);
    keepConfidenceMonotonic(output.result, payload.previousCode, payload.previousConfidence);
    const { requestId } = await persistClassification(supabase, {
      organizationId: orgId,
      createdBy: session.user.id,
      input,
      output,
      source: "web",
      extra: {
        refined_from: payload.refinedFromId,
        previous_confidence: payload.previousConfidence,
        answered_questions: Object.fromEntries(answered),
      },
    });
    await recordUsageEvent(supabase, {
      organizationId: orgId,
      eventType: "classification",
      metadata: { source: "web", refined_from: payload.refinedFromId ?? null },
    });
    revalidatePath("/dashboard/classifications");
    return { ok: true, data: { kind: "saved", id: requestId } };
  } catch (err) {
    console.error("[refine] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Refinement failed.",
    };
  }
}

/** Save a completed classification's product into the SKU library. */
export async function saveToLibraryAction(
  classificationId: string,
): Promise<ActionResult<{ productId: string; updated: boolean }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Sign in to save products." };

  const supabase = createClient();
  const detail = await getClassificationDetail(supabase, classificationId);
  if (!detail?.result) return { ok: false, error: "Classification not found." };

  const input = requestRowToProductInput(detail.request);
  const result = resultRowToClassificationResult(detail.result, detail.candidates);
  const readiness = computeReadiness(input, result);

  try {
    const saved = await saveProduct(supabase, {
      organizationId: session.organization.id,
      createdBy: session.user.id,
      input,
      latest: {
        recommendedCode: result.recommended_code || null,
        confidence: result.confidence,
        readinessScore: readiness.score,
      },
    });
    revalidatePath("/dashboard/products");
    return { ok: true, data: { productId: saved.id, updated: saved.updated } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the product.",
    };
  }
}

export interface BulkRowInput {
  sku?: string;
  product_name: string;
  product_description: string;
  material_composition?: string;
  intended_use?: string;
  origin_country: string;
  destination_country: string;
  declared_value?: number;
  currency?: string;
}

export interface BulkRowResult {
  row: number;
  product_name: string;
  ok: boolean;
  id?: string;
  recommended_code?: string;
  confidence?: number;
  readiness?: number;
  error?: string;
}

const BULK_MAX_ROWS = 10;

/** Bulk upload (beta): classify up to 10 CSV rows sequentially, respecting
 * the plan limit per row. Each successful row is a normal saved
 * classification that appears in history. */
export async function bulkClassifyAction(
  rows: BulkRowInput[],
): Promise<ActionResult<BulkRowResult[]>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Sign in to use bulk upload." };
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "No rows to process." };
  }

  const supabase = createClient();
  const orgId = session.organization.id;
  const results: BulkRowResult[] = [];

  for (const [i, row] of rows.slice(0, BULK_MAX_ROWS).entries()) {
    const limit = await checkClassificationLimit(
      supabase,
      orgId,
      session.organization.plan,
    );
    if (!limit.allowed) {
      results.push({
        row: i + 1,
        product_name: row.product_name ?? "",
        ok: false,
        error: limit.message ?? "Monthly limit reached.",
      });
      continue;
    }

    const parsed = productInputSchema.safeParse(row);
    if (!parsed.success) {
      results.push({
        row: i + 1,
        product_name: row.product_name ?? "",
        ok: false,
        error: parsed.error.issues.map((iss) => iss.message).join(" "),
      });
      continue;
    }

    try {
      const input = parsed.data as ProductInput;
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
        metadata: { source: "bulk", recommended_code: output.result.recommended_code },
      });
      const readiness = computeReadiness(input, output.result);
      results.push({
        row: i + 1,
        product_name: input.product_name,
        ok: true,
        id: requestId,
        recommended_code: output.result.recommended_code,
        confidence: output.result.confidence,
        readiness: readiness.score,
      });
    } catch (err) {
      results.push({
        row: i + 1,
        product_name: row.product_name ?? "",
        ok: false,
        error: err instanceof Error ? err.message : "Classification failed.",
      });
    }
  }

  revalidatePath("/dashboard/classifications");
  return { ok: true, data: results };
}
