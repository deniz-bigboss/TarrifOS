import type { SupabaseClient } from "@supabase/supabase-js";

export interface UsageEventInput {
  organizationId: string;
  apiKeyId?: string | null;
  eventType: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

/** Record a usage event (classification, api_classification, export, etc.). */
export async function recordUsageEvent(
  supabase: SupabaseClient,
  event: UsageEventInput,
): Promise<void> {
  const { error } = await supabase.from("usage_events").insert({
    organization_id: event.organizationId,
    api_key_id: event.apiKeyId ?? null,
    event_type: event.eventType,
    quantity: event.quantity ?? 1,
    metadata: event.metadata ?? {},
  });
  if (error) {
    // Usage tracking must never break the primary request.
    console.error("[usage] failed to record event:", error);
  }
}

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/** Count usage events of a given type this month (for dashboards/API metering). */
export async function countUsageThisMonth(
  supabase: SupabaseClient,
  organizationId: string,
  eventType?: string,
): Promise<number> {
  let query = supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", startOfMonthISO());

  if (eventType) query = query.eq("event_type", eventType);

  const { count, error } = await query;
  if (error) {
    console.error("[usage] count failed:", error);
    return 0;
  }
  return count ?? 0;
}
