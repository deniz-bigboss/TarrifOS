import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassificationResult,
  ProductInput,
} from "@/types";
import type {
  ClassificationCandidateRow,
  ClassificationRequestRow,
  ClassificationResultRow,
  FeedbackLabelRow,
} from "@/types/database";
import type { ClassificationOutput } from "@/lib/classification/pipeline";

export interface PersistArgs {
  organizationId: string;
  createdBy: string | null;
  input: ProductInput;
  output: ClassificationOutput;
  source: "web" | "api";
  /** Refinement metadata for the confidence-improvement loop. */
  extra?: {
    refined_from?: string;
    previous_confidence?: number;
    answered_questions?: Record<string, string>;
  };
}

/**
 * Wizard extras (flags, pasted document text, certificate info) plus
 * refinement metadata, stored as one jsonb column so the readiness score can
 * be recomputed from history and refinement versions stay linked.
 */
function buildExtraInput(
  input: ProductInput,
  extra?: PersistArgs["extra"],
): Record<string, unknown> | undefined {
  const flags: Record<string, unknown> = {};
  for (const key of [
    "is_textile",
    "is_electronics",
    "contains_battery",
    "is_food",
    "is_cosmetic",
    "is_medical_or_health_related",
    "is_chemical",
    "is_dual_use_or_restricted",
    "certificate_of_origin_available",
  ] as const) {
    if (input[key] !== undefined) flags[key] = input[key];
  }
  if (input.invoice_text) flags.invoice_text = input.invoice_text;
  if (input.product_spec_text) flags.product_spec_text = input.product_spec_text;
  const merged = { ...flags, ...(extra ?? {}) };
  return Object.keys(merged).length > 0 ? merged : undefined;
}

export interface PersistedClassification {
  requestId: string;
  resultId: string;
}

/**
 * Stage 7 — saveClassificationResult.
 * Persists the request, result and candidate rows transactionally-ish (the
 * three inserts are sequential; on result failure the request is left as a
 * record of the attempt with status 'failed').
 */
export async function persistClassification(
  supabase: SupabaseClient,
  args: PersistArgs,
): Promise<PersistedClassification> {
  const { input, output, organizationId, createdBy } = args;
  const { result } = output;

  const status = result.human_review_required ? "needs_review" : "completed";

  const { data: requestRow, error: requestError } = await supabase
    .from("classification_requests")
    .insert({
      organization_id: organizationId,
      created_by: createdBy,
      product_name: input.product_name,
      product_description: input.product_description,
      material_composition: input.material_composition ?? null,
      intended_use: input.intended_use ?? null,
      brand: input.brand ?? null,
      model: input.model ?? null,
      sku: input.sku ?? null,
      category: input.category ?? null,
      supplier_country: input.supplier_country ?? null,
      origin_country: input.origin_country ?? null,
      destination_country: input.destination_country ?? null,
      import_or_export: input.import_or_export ?? "import",
      declared_value: input.declared_value ?? null,
      currency: input.currency ?? null,
      quantity: input.quantity ?? null,
      unit_weight: input.unit_weight ?? null,
      shipping_method: input.shipping_method ?? null,
      extra_input: buildExtraInput(input, args.extra) ?? null,
      status,
    })
    .select("id")
    .single();

  if (requestError || !requestRow) {
    throw new Error(`Failed to save classification request: ${requestError?.message}`);
  }

  const { data: resultRow, error: resultError } = await supabase
    .from("classification_results")
    .insert({
      request_id: requestRow.id,
      organization_id: organizationId,
      recommended_code: result.recommended_code,
      recommended_title: result.recommended_title,
      confidence: result.confidence,
      confidence_label: result.confidence_label,
      reasoning_summary: result.reasoning_summary,
      key_factors: result.key_factors,
      missing_information: result.missing_information,
      required_documents: result.required_documents,
      restriction_warnings: result.restriction_warnings,
      human_review_required: result.human_review_required,
      human_review_reason: result.human_review_reason,
      broker_ready_explanation: result.broker_ready_explanation,
      duty_estimate: result.duty_estimate ?? null,
      raw_ai_output: result as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (resultError || !resultRow) {
    await supabase
      .from("classification_requests")
      .update({ status: "failed" })
      .eq("id", requestRow.id);
    throw new Error(`Failed to save classification result: ${resultError?.message}`);
  }

  // Candidate rows (recommended + alternatives).
  const candidateRows = [
    {
      result_id: resultRow.id,
      code: result.recommended_code,
      title: result.recommended_title,
      reason: "Recommended classification.",
      confidence: result.confidence,
      source: "recommended",
    },
    ...result.alternative_codes.map((alt) => ({
      result_id: resultRow.id,
      code: alt.code,
      title: alt.title,
      reason: alt.reason,
      confidence: alt.confidence,
      source: "alternative",
    })),
  ].filter((c) => c.code);

  if (candidateRows.length > 0) {
    await supabase.from("classification_candidates").insert(candidateRows);
  }

  return { requestId: requestRow.id, resultId: resultRow.id };
}

export interface ClassificationListFilters {
  destinationCountry?: string;
  confidenceLabel?: string;
  humanReviewRequired?: boolean;
  category?: string;
  search?: string;
}

export interface ClassificationListItem {
  request: ClassificationRequestRow;
  result: ClassificationResultRow | null;
}

/** List classifications for an org with optional filters (newest first). */
export async function listClassifications(
  supabase: SupabaseClient,
  organizationId: string,
  filters: ClassificationListFilters = {},
): Promise<ClassificationListItem[]> {
  let query = supabase
    .from("classification_requests")
    .select("*, classification_results(*)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.destinationCountry) {
    query = query.eq("destination_country", filters.destinationCountry);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[classifications] list failed:", error);
    return [];
  }

  let items: ClassificationListItem[] = (data ?? []).map((row: any) => {
    const { classification_results, ...request } = row;
    const result = Array.isArray(classification_results)
      ? classification_results[0] ?? null
      : classification_results ?? null;
    return { request: request as ClassificationRequestRow, result };
  });

  // Result-level filters applied in memory (joined table).
  if (filters.confidenceLabel) {
    items = items.filter((i) => i.result?.confidence_label === filters.confidenceLabel);
  }
  if (filters.humanReviewRequired !== undefined) {
    items = items.filter(
      (i) => Boolean(i.result?.human_review_required) === filters.humanReviewRequired,
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.request.product_name?.toLowerCase().includes(q) ||
        i.result?.recommended_code?.toLowerCase().includes(q),
    );
  }

  return items;
}

export interface ClassificationDetail {
  request: ClassificationRequestRow;
  result: ClassificationResultRow | null;
  candidates: ClassificationCandidateRow[];
  feedback: FeedbackLabelRow | null;
}

/** Fetch a single classification with its result, candidates and feedback. */
export async function getClassificationDetail(
  supabase: SupabaseClient,
  requestId: string,
): Promise<ClassificationDetail | null> {
  const { data: request, error } = await supabase
    .from("classification_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) return null;

  const { data: result } = await supabase
    .from("classification_results")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();

  let candidates: ClassificationCandidateRow[] = [];
  let feedback: FeedbackLabelRow | null = null;

  if (result) {
    const { data: cands } = await supabase
      .from("classification_candidates")
      .select("*")
      .eq("result_id", result.id);
    candidates = (cands as ClassificationCandidateRow[]) ?? [];

    // limit(1) is required: every feedback submit inserts a new row (history
    // is the data moat), and maybeSingle() errors on >1 row — without the
    // limit, the page silently showed no feedback after a second submission.
    const { data: fb } = await supabase
      .from("feedback_labels")
      .select("*")
      .eq("classification_result_id", result.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    feedback = (fb as FeedbackLabelRow) ?? null;
  }

  return {
    request: request as ClassificationRequestRow,
    result: (result as ClassificationResultRow) ?? null,
    candidates,
    feedback,
  };
}

/** Rebuild the pipeline's ProductInput from a stored request row (including
 * the wizard extras persisted in extra_input) for display, export, readiness
 * recomputation, and reclassification. */
export function requestRowToProductInput(
  request: ClassificationRequestRow,
): ProductInput {
  const extra = (request.extra_input ?? {}) as Record<string, unknown>;
  const flag = (k: string) => (typeof extra[k] === "boolean" ? (extra[k] as boolean) : undefined);
  return {
    product_name: request.product_name,
    product_description: request.product_description ?? "",
    material_composition: request.material_composition,
    intended_use: request.intended_use,
    brand: request.brand,
    model: request.model,
    sku: request.sku,
    category: request.category,
    supplier_country: request.supplier_country,
    origin_country: request.origin_country ?? "",
    destination_country: request.destination_country ?? "",
    import_or_export: (request.import_or_export as "import" | "export") ?? "import",
    declared_value: request.declared_value,
    currency: request.currency,
    quantity: request.quantity,
    unit_weight: request.unit_weight,
    shipping_method: request.shipping_method,
    is_textile: flag("is_textile"),
    is_electronics: flag("is_electronics"),
    contains_battery: flag("contains_battery"),
    is_food: flag("is_food"),
    is_cosmetic: flag("is_cosmetic"),
    is_medical_or_health_related: flag("is_medical_or_health_related"),
    is_chemical: flag("is_chemical"),
    is_dual_use_or_restricted: flag("is_dual_use_or_restricted"),
    certificate_of_origin_available: flag("certificate_of_origin_available"),
    invoice_text: typeof extra.invoice_text === "string" ? extra.invoice_text : null,
    product_spec_text:
      typeof extra.product_spec_text === "string" ? extra.product_spec_text : null,
  };
}

/** Reconstruct a ClassificationResult from stored rows for the result UI/export. */
export function resultRowToClassificationResult(
  row: ClassificationResultRow,
  candidates: ClassificationCandidateRow[],
): ClassificationResult {
  const raw = row.raw_ai_output as Partial<ClassificationResult> | null;
  return {
    recommended_code: row.recommended_code ?? "",
    recommended_title: row.recommended_title ?? "",
    confidence: row.confidence ?? 0,
    confidence_label: (row.confidence_label as any) ?? "low",
    alternative_codes:
      raw?.alternative_codes ??
      candidates
        .filter((c) => c.source === "alternative")
        .map((c) => ({
          code: c.code,
          title: c.title ?? "",
          reason: c.reason ?? "",
          confidence: c.confidence ?? 0,
        })),
    reasoning_summary: row.reasoning_summary ?? "",
    key_factors: row.key_factors ?? [],
    missing_information: row.missing_information ?? [],
    required_documents: row.required_documents ?? [],
    restriction_warnings: row.restriction_warnings ?? [],
    human_review_required: row.human_review_required,
    human_review_reason: row.human_review_reason ?? "",
    broker_ready_explanation: row.broker_ready_explanation ?? "",
    duty_estimate: (raw?.duty_estimate as any) ?? undefined,
    cost_optimization: (raw?.cost_optimization as any) ?? undefined,
    shipment_plan: (raw?.shipment_plan as any) ?? undefined,
    disclaimer:
      raw?.disclaimer ??
      "This output is a recommendation generated from available product information and tariff data. It is not legal advice. Final classification, duty treatment, and customs declarations should be confirmed by a qualified customs broker or customs authority.",
  };
}
