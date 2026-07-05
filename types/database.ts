// ---------------------------------------------------------------------------
// Hand-written database row types mirroring the Supabase Postgres schema.
// (For a larger project you would generate these with `supabase gen types`.)
// ---------------------------------------------------------------------------

export type PlanId = "free" | "starter" | "growth" | "forwarder" | "enterprise";

export interface OrganizationRow {
  id: string;
  name: string;
  plan: PlanId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  organization_id: string;
  full_name: string | null;
  created_at: string;
}

export interface ClassificationRequestRow {
  id: string;
  organization_id: string;
  created_by: string | null;
  product_name: string;
  product_description: string | null;
  material_composition: string | null;
  intended_use: string | null;
  brand: string | null;
  model: string | null;
  sku: string | null;
  category: string | null;
  supplier_country: string | null;
  origin_country: string | null;
  destination_country: string | null;
  import_or_export: string | null;
  declared_value: number | null;
  currency: string | null;
  quantity: number | null;
  unit_weight: number | null;
  shipping_method: string | null;
  status: string;
  created_at: string;
}

export interface ClassificationResultRow {
  id: string;
  request_id: string;
  organization_id: string;
  recommended_code: string | null;
  recommended_title: string | null;
  confidence: number | null;
  confidence_label: string | null;
  reasoning_summary: string | null;
  key_factors: string[] | null;
  missing_information: string[] | null;
  required_documents: string[] | null;
  restriction_warnings: string[] | null;
  human_review_required: boolean;
  human_review_reason: string | null;
  broker_ready_explanation: string | null;
  duty_estimate: Record<string, unknown> | null;
  raw_ai_output: Record<string, unknown> | null;
  created_at: string;
}

export interface ClassificationCandidateRow {
  id: string;
  result_id: string;
  code: string;
  title: string | null;
  reason: string | null;
  confidence: number | null;
  source: string | null;
}

export interface TariffCodeRow {
  id: string;
  code: string;
  jurisdiction: string;
  title: string;
  description: string | null;
  keywords: string[] | null;
  chapter: string | null;
  section: string | null;
  duty_rate_placeholder: string | null;
  required_documents: string[] | null;
  restriction_notes: string[] | null;
  risk_level: string | null;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  organization_id: string;
  request_id: string | null;
  file_name: string;
  file_type: string | null;
  storage_path: string | null;
  extracted_text: string | null;
  created_at: string;
}

export interface ApiKeyRow {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface UsageEventRow {
  id: string;
  organization_id: string;
  api_key_id: string | null;
  event_type: string;
  quantity: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FeedbackLabelRow {
  id: string;
  organization_id: string;
  classification_result_id: string;
  actual_code: string | null;
  was_correct: boolean | null;
  broker_notes: string | null;
  shipment_cleared: boolean | null;
  delay_occurred: boolean | null;
  penalty_occurred: boolean | null;
  created_at: string;
}

export interface BillingEventRow {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
  created_at: string;
}
