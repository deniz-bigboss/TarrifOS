// ---------------------------------------------------------------------------
// TariffOS domain types
// These are the canonical shapes used across the AI engine, tariff-data
// adapters, API routes and UI. Database row shapes live in types/database.ts.
// ---------------------------------------------------------------------------

export type Jurisdiction = "EU" | "UK" | "US" | "TR" | "GLOBAL";

export type RiskLevel = "low" | "medium" | "high";

export type ConfidenceLabel = "low" | "medium" | "high";

export type ImportOrExport = "import" | "export";

export type ClassificationStatus =
  | "draft"
  | "processing"
  | "completed"
  | "needs_review"
  | "failed";

/** A tariff/commodity code as exposed by a TariffDataProvider. */
export interface TariffCode {
  code: string;
  jurisdiction: Jurisdiction;
  title: string;
  description: string;
  keywords: string[];
  chapter: string;
  section: string;
  dutyRatePlaceholder: string;
  requiredDocuments: string[];
  restrictionNotes: string[];
  riskLevel: RiskLevel;
}

/** A scored candidate produced during retrieval. */
export interface CandidateCode extends TariffCode {
  /** 0..1 retrieval relevance score (keyword/lexical for the seed provider). */
  score: number;
}

/** Duty / tax measures for a code on a given trade lane. */
export interface DutyMeasure {
  code: string;
  originCountry: string;
  destinationCountry: string;
  dutyRatePlaceholder: string;
  vatRatePlaceholder: string | null;
  notes: string[];
  isPlaceholder: true;
}

/** Restriction record for a code on a given trade lane. */
export interface Restriction {
  code: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

/** The structured product input to the classification pipeline. */
export interface ProductInput {
  product_name: string;
  product_description: string;
  material_composition?: string | null;
  intended_use?: string | null;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  category?: string | null;
  supplier_country?: string | null;
  origin_country: string;
  destination_country: string;
  import_or_export?: ImportOrExport;
  declared_value?: number | null;
  currency?: string | null;
  quantity?: number | null;
  unit_weight?: number | null;
  shipping_method?: string | null;
}

/** Normalized form of the product input (stage 1 output). */
export interface NormalizedProductInput extends ProductInput {
  normalized_text: string;
  search_terms: string[];
}

/** An alternative code suggestion in the AI result. */
export interface AlternativeCode {
  code: string;
  title: string;
  reason: string;
  confidence: number;
}

/**
 * The structured AI classification result.
 * Matches the JSON contract in the product spec exactly.
 */
export interface ClassificationResult {
  recommended_code: string;
  recommended_title: string;
  confidence: number;
  confidence_label: ConfidenceLabel;
  alternative_codes: AlternativeCode[];
  reasoning_summary: string;
  key_factors: string[];
  missing_information: string[];
  required_documents: string[];
  restriction_warnings: string[];
  human_review_required: boolean;
  human_review_reason: string;
  broker_ready_explanation: string;
  duty_estimate?: DutyEstimate;
  cost_optimization?: CostOptimization;
  shipment_plan?: ShipmentPlan;
  /**
   * Set when the primary AI provider was unavailable and a fallback (or the
   * offline engine) produced this result — shown to the user so degraded
   * service is never silent.
   */
  service_notice?: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Shipment execution plan — the "shipping operations agent" layer that turns
// a classification into prioritized operating steps for the shipment team.
// ---------------------------------------------------------------------------

export type PlanPriority = "critical" | "high" | "medium" | "low";

export interface PlanAction {
  title: string;
  priority: PlanPriority;
  owner: string;
  timing: string;
  /** What triggered this action (review reason, missing docs, warning, …). */
  context: string;
  /** Why doing it matters — the payoff line. */
  impact: string;
}

export interface PlanDocument {
  name: string;
  owner: string;
  status: "missing" | "attached";
  reason: string;
}

export interface PlanCheckpoint {
  title: string;
  severity: PlanPriority;
  status_note: string;
  instruction: string;
}

export interface PlanTimelineStage {
  stage: string;
  tasks: string[];
}

export interface ShipmentPlan {
  /** Narrative summary of the working plan (lane, code, top priority, basis). */
  summary: string;
  /** 0–100 heuristic readiness for broker handoff. */
  readiness_score: number;
  readiness_label: "blocked" | "in progress" | "ready for broker review";
  actions: PlanAction[];
  documents: PlanDocument[];
  checkpoints: PlanCheckpoint[];
  timeline: PlanTimelineStage[];
  cost_levers: PlanAction[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Cost optimization — "what can legitimately be done to reduce landed cost"
// ---------------------------------------------------------------------------

export interface DutyComparisonEntry {
  code: string;
  title: string;
  is_recommended: boolean;
  duty_rate_placeholder: string;
  estimated_duty_value: number | null;
}

export interface TradeProgramEligibility {
  name: string;
  /** True when origin/destination map to regions covered by this program. */
  may_apply: boolean;
  potential_duty_rate: string;
  proof_required: string;
  notes: string;
}

export interface DeMinimisNote {
  country: string;
  threshold_placeholder: string;
  notes: string;
}

export interface CostOptimization {
  duty_comparison: DutyComparisonEntry[];
  trade_programs: TradeProgramEligibility[];
  de_minimis: DeMinimisNote[];
  recommendations: string[];
  disclaimer: string;
}

export interface DutyEstimate {
  duty_rate_placeholder: string;
  vat_rate_placeholder: string | null;
  /** Base (MFN placeholder) duty value. */
  estimated_duty_value: number | null;
  currency: string | null;
  is_placeholder: true;
  notes: string[];
  /**
   * Country-specific additional tariffs (Section 301, Section 232, 2025
   * reciprocal/IEEPA, EU CVDs, …) that stack on top of the base duty. Present
   * only when the origin → destination lane is subject to one. All figures are
   * dated reference points — see trade_remedy_notice.
   */
  trade_remedies?: TradeRemedyLine[];
  /** Additional duty from the auto-added remedies, or null. */
  additional_duty_value?: number | null;
  /** Base + additional, or null. */
  total_duty_value?: number | null;
  trade_remedy_notice?: string;
}

export interface TradeRemedyLine {
  name: string;
  rate_label: string;
  estimated_value: number | null;
  /** "added" = folded into the total; "may-apply" = conditional, not added. */
  applies: "added" | "may-apply";
  source: string;
  effective: string;
  detail: string;
}

export const LEGAL_DISCLAIMER =
  "This output is a recommendation generated from available product information and tariff data. It is not legal advice. Final classification, duty treatment, and customs declarations should be confirmed by a qualified customs broker or customs authority.";
