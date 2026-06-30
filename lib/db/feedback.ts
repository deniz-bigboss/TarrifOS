import type { SupabaseClient } from "@supabase/supabase-js";

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
