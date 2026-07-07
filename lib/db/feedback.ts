import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackLabelRow } from "@/types/database";

export interface FeedbackInput {
  organizationId: string;
  classificationResultId: string;
  actualCode?: string | null;
  wasCorrect?: boolean | null;
  brokerNotes?: string | null;
  shipmentCleared?: boolean | null;
  delayOccurred?: boolean | null;
  penaltyOccurred?: boolean | null;
}

/**
 * Persist a feedback label. This is the product's data moat — every broker
 * correction improves the proprietary training dataset.
 */
export async function saveFeedback(
  supabase: SupabaseClient,
  input: FeedbackInput,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("feedback_labels")
    .insert({
      organization_id: input.organizationId,
      classification_result_id: input.classificationResultId,
      actual_code: input.actualCode ?? null,
      was_correct: input.wasCorrect ?? null,
      broker_notes: input.brokerNotes ?? null,
      shipment_cleared: input.shipmentCleared ?? null,
      delay_occurred: input.delayOccurred ?? null,
      penalty_occurred: input.penaltyOccurred ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to save feedback: ${error?.message}`);
  }
  return { id: data.id };
}

export interface AdminFeedbackRow extends FeedbackLabelRow {
  org_name: string | null;
  org_plan: string | null;
  product_name: string | null;
  destination_country: string | null;
  recommended_code: string | null;
  request_id: string | null;
}

/**
 * Cross-organization feedback listing for the operator console. MUST be called
 * with the service-role admin client — it deliberately reads every org's
 * feedback, which RLS would otherwise forbid. Stitched from a few small queries
 * (rather than a nested embed) so the relationship resolution is explicit and
 * predictable.
 */
export async function listAllFeedback(
  admin: SupabaseClient,
  limit = 200,
): Promise<AdminFeedbackRow[]> {
  const { data: labels, error } = await admin
    .from("feedback_labels")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list feedback: ${error.message}`);
  const rows = (labels ?? []) as FeedbackLabelRow[];
  if (rows.length === 0) return [];

  const resultIds = [...new Set(rows.map((r) => r.classification_result_id))];
  const orgIds = [...new Set(rows.map((r) => r.organization_id))];

  const { data: results } = await admin
    .from("classification_results")
    .select("id, request_id, recommended_code")
    .in("id", resultIds);

  const requestIds = [
    ...new Set((results ?? []).map((r) => r.request_id).filter(Boolean)),
  ];

  const [{ data: requests }, { data: orgs }] = await Promise.all([
    requestIds.length
      ? admin
          .from("classification_requests")
          .select("id, product_name, destination_country")
          .in("id", requestIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    admin.from("organizations").select("id, name, plan").in("id", orgIds),
  ]);

  const resultById = new Map((results ?? []).map((r) => [r.id, r]));
  const requestById = new Map((requests ?? []).map((r) => [r.id, r]));
  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]));

  return rows.map((r) => {
    const result = resultById.get(r.classification_result_id);
    const request = result ? requestById.get(result.request_id) : undefined;
    const org = orgById.get(r.organization_id);
    return {
      ...r,
      org_name: (org?.name as string) ?? null,
      org_plan: (org?.plan as string) ?? null,
      product_name: (request?.product_name as string) ?? null,
      destination_country: (request?.destination_country as string) ?? null,
      recommended_code: (result?.recommended_code as string) ?? null,
      request_id: (result?.request_id as string) ?? null,
    };
  });
}
