import type {
  CandidateCode,
  ClassificationResult,
  NormalizedProductInput,
  ProductInput,
} from "@/types";
import { LEGAL_DISCLAIMER } from "@/types";
import { getTariffDataProvider, type TariffDataProvider } from "@/lib/tariff-data";
import { getAIProvider, type AIProvider } from "@/lib/ai";
import { tokenize } from "@/lib/tariff-data/search";
import { assessRisk } from "./risk";
import { assessDataPlausibility } from "./plausibility";
import { generateCostOptimization } from "./cost-optimizer";
import { estimateDutyValue } from "./duty";
import { filterRedundantMissingInfo } from "@/lib/ai/missing-info";
import {
  HUMAN_REVIEW_CONFIDENCE_THRESHOLD,
  calculateConfidence,
  confidenceLabel,
} from "./confidence";

export interface ClassificationOutput {
  normalized: NormalizedProductInput;
  candidates: CandidateCode[];
  result: ClassificationResult;
  providerName: string;
}

// --------------------------------------------------------------------------
// Stage 1 — normalizeProductInput
// --------------------------------------------------------------------------
export function normalizeProductInput(
  input: ProductInput,
): NormalizedProductInput {
  const normalize = (s?: string | null) =>
    (s ?? "").replace(/\s+/g, " ").trim();

  const cleaned: ProductInput = {
    ...input,
    product_name: normalize(input.product_name),
    product_description: normalize(input.product_description),
    material_composition: normalize(input.material_composition) || null,
    intended_use: normalize(input.intended_use) || null,
    category: normalize(input.category) || null,
    origin_country: (input.origin_country || "").toUpperCase(),
    destination_country: (input.destination_country || "").toUpperCase(),
    supplier_country: input.supplier_country?.toUpperCase() || null,
    import_or_export: input.import_or_export ?? "import",
  };

  const normalizedText = [
    cleaned.product_name,
    cleaned.product_description,
    cleaned.material_composition,
    cleaned.intended_use,
    cleaned.category,
    cleaned.brand,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...cleaned,
    normalized_text: normalizedText,
    search_terms: Array.from(new Set(tokenize(normalizedText))),
  };
}

// --------------------------------------------------------------------------
// Stage 2 — retrieveCandidateCodes
// --------------------------------------------------------------------------
export async function retrieveCandidateCodes(
  normalized: NormalizedProductInput,
  provider: TariffDataProvider = getTariffDataProvider(),
): Promise<CandidateCode[]> {
  const query = normalized.normalized_text || normalized.product_name;
  const candidates = await provider.searchCodes(
    query,
    normalized.destination_country,
    // The name says what the product IS; descriptions mention components.
    // Emphasizing name tokens stops e.g. a smartphone's "lithium-ion
    // battery" description line from out-scoring the smartphone code.
    { emphasize: normalized.product_name },
  );
  // Return 5–10 candidates.
  return candidates.slice(0, 10);
}

// --------------------------------------------------------------------------
// Stage 3 — generateClassificationReasoning
// --------------------------------------------------------------------------
export async function generateClassificationReasoning(
  input: ProductInput,
  candidates: CandidateCode[],
  ai: AIProvider = getAIProvider(),
): Promise<ClassificationResult> {
  return ai.classifyProduct(input, candidates);
}

// --------------------------------------------------------------------------
// Stage 4 — validateClassification (enforce compliance rules in code)
// --------------------------------------------------------------------------
export function validateClassification(
  result: ClassificationResult,
  input: ProductInput,
  candidates: CandidateCode[],
): ClassificationResult {
  const next: ClassificationResult = {
    ...result,
    disclaimer: LEGAL_DISCLAIMER,
  };

  // Guard: recommended_code must be one of the retrieved candidates.
  const matched = candidates.find((c) => c.code === next.recommended_code);
  if (!matched && candidates[0]) {
    next.recommended_code = candidates[0].code;
    next.recommended_title = candidates[0].title;
  }

  const reviewReasons: string[] = [];

  // Rule: high-risk categories always require human review.
  const risk = assessRisk(input);
  if (risk.isHighRisk) {
    reviewReasons.push(risk.reason);
    // Surface category warnings if the model didn't.
    for (const cat of risk.categories) {
      const tag = `${cat.label}: ${cat.reason}`;
      if (!next.restriction_warnings.some((w) => w.includes(cat.label))) {
        next.restriction_warnings.push(tag);
      }
    }
  }

  // Rule: any matched candidate flagged high-risk requires review.
  if (matched?.riskLevel === "high") {
    reviewReasons.push(
      `Recommended code ${matched.code} is a high-risk category requiring expert confirmation.`,
    );
  }

  // Rule: declared value/weight that look like data-entry errors require
  // review. This never affects classification confidence — the HS/HTS code
  // is determined by what the product is, not its price or weight.
  const plausibilityWarnings = assessDataPlausibility(input);
  if (plausibilityWarnings.length > 0) {
    next.restriction_warnings.push(...plausibilityWarnings);
    reviewReasons.push(
      "Declared value/weight look inconsistent — verify before filing.",
    );
  }

  // Rule: confidence < threshold requires human review.
  if (next.confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD) {
    reviewReasons.push(
      `Confidence ${(next.confidence * 100).toFixed(0)}% is below the ${(HUMAN_REVIEW_CONFIDENCE_THRESHOLD * 100).toFixed(0)}% threshold.`,
    );
  }

  // Rule: no confident candidate at all.
  if (!matched && candidates.length === 0) {
    reviewReasons.push("No candidate tariff code could be retrieved.");
  }

  if (reviewReasons.length > 0) {
    next.human_review_required = true;
    next.human_review_reason = Array.from(
      new Set([next.human_review_reason, ...reviewReasons].filter(Boolean)),
    ).join(" ");
  }

  // De-duplicate list fields.
  next.required_documents = dedupe(next.required_documents);
  next.restriction_warnings = dedupe(next.restriction_warnings);
  // Drop any missing-info question whose answer is already stated in the
  // product input — applies to every provider's output, not just mock, since
  // a model can still ask boilerplate questions despite the prompt telling
  // it not to (see lib/ai/missing-info.ts).
  next.missing_information = filterRedundantMissingInfo(
    dedupe(next.missing_information),
    input,
  );
  next.key_factors = dedupe(next.key_factors);

  return next;
}

// --------------------------------------------------------------------------
// Stage 6 — generateBrokerReadyReport
// --------------------------------------------------------------------------
export async function generateBrokerReadyReport(
  input: ProductInput,
  result: ClassificationResult,
  ai: AIProvider = getAIProvider(),
): Promise<string> {
  // Always regenerate from the FINAL result — any broker text produced during
  // stage 3 (by the mock or a real model) predates confidence reconciliation
  // and the validation stage's added warnings/review reasons, so honoring it
  // produced reports whose confidence didn't match the meter. The model's
  // voice still comes through via reasoning_summary, which the report embeds.
  return ai.generateBrokerReport(input, result);
}

// --------------------------------------------------------------------------
// Orchestrator — stages 1–6 (stage 7 persistence lives in lib/db/classifications)
// --------------------------------------------------------------------------
export async function runClassification(
  input: ProductInput,
  deps: { ai?: AIProvider; tariff?: TariffDataProvider } = {},
): Promise<ClassificationOutput> {
  const ai = deps.ai ?? getAIProvider();
  const tariff = deps.tariff ?? getTariffDataProvider();

  // 1. normalize
  const normalized = normalizeProductInput(input);

  // 2. retrieve
  const candidates = await retrieveCandidateCodes(normalized, tariff);

  // 3. reason
  let result = await generateClassificationReasoning(input, candidates, ai);

  // 5. confidence (run before validate so the review threshold sees final score)
  result = calculateConfidence(result, candidates);

  // 4. validate + enforce compliance rules
  result = validateClassification(result, input, candidates);

  // Attach duty estimate placeholder from the recommended code's measures.
  const measures = result.recommended_code
    ? await tariff.getDutyMeasures(
        result.recommended_code,
        normalized.origin_country,
        normalized.destination_country,
      )
    : null;
  if (measures) {
    const estimatedDuty = estimateDutyValue(
      measures.dutyRatePlaceholder,
      input.declared_value ?? null,
    );
    result.duty_estimate = {
      duty_rate_placeholder: measures.dutyRatePlaceholder,
      vat_rate_placeholder: measures.vatRatePlaceholder,
      estimated_duty_value: estimatedDuty,
      currency: input.currency ?? null,
      is_placeholder: true,
      notes: measures.notes,
    };
  }

  // Assistant layer: legitimate cost-reduction opportunities (duty
  // comparison across candidates, preferential trade programs, de minimis).
  // Never affects the recommended code or confidence.
  result.cost_optimization = generateCostOptimization(input, candidates, result);

  // 6. broker report
  result.broker_ready_explanation = await generateBrokerReadyReport(
    input,
    result,
    ai,
  );

  // Final consistency: label always matches the numeric confidence.
  result.confidence_label = confidenceLabel(result.confidence);

  return { normalized, candidates, result, providerName: ai.name };
}

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------
function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr.filter((x) => x && x.trim().length > 0)));
}
