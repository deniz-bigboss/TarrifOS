import type {
  CandidateCode,
  ClassificationResult,
  ConfidenceLabel,
} from "@/types";
import { isPlausibleHsCode, normalizeHsCode } from "@/lib/tariff-data/hs-chapters";

export const HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.75;

export function confidenceLabel(confidence: number): ConfidenceLabel {
  if (confidence > 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

/**
 * Stage 5: calculateConfidence.
 *
 * Reconciles the model's self-reported confidence with the retrieval signal so
 * a model can't claim "high" confidence on a weak lexical match. Returns a new
 * result with a normalized confidence + matching label.
 */
export function calculateConfidence(
  result: ClassificationResult,
  candidates: CandidateCode[],
): ClassificationResult {
  // Match tolerantly: a model echoing "610910" for candidate "6109.10" is an
  // in-dataset pick, not an outside proposal.
  const normalized = result.recommended_code
    ? normalizeHsCode(result.recommended_code)
    : null;
  const matched = candidates.find(
    (c) => c.code === result.recommended_code || (normalized && c.code === normalized),
  );
  const modelConfidence = clamp(result.confidence, 0, 1);

  // Model proposed a structurally valid HS code from OUTSIDE the local
  // dataset (validateClassification keeps it and forces human review). The
  // retrieval score is meaningless for such codes — the local data simply
  // doesn't cover this product — so instead of pinning confidence near zero,
  // discount the model's own confidence and cap below the review threshold:
  // "plausible but unverified" is exactly what the number should say.
  if (!matched && result.recommended_code && isPlausibleHsCode(result.recommended_code)) {
    const confidence = Math.round(clamp(modelConfidence * 0.85, 0, 0.7) * 100) / 100;
    return { ...result, confidence, confidence_label: confidenceLabel(confidence) };
  }

  const retrievalScore = matched?.score ?? candidates[0]?.score ?? 0;

  // Weighted blend; cap model confidence by retrieval strength + a margin.
  // The retrieval score is an absolute, saturating match-strength signal
  // (see lib/tariff-data/search.ts) — strong keyword evidence lifts the
  // ceiling to ~0.97, weak/no evidence pins it low so a model can't claim
  // high confidence on a code the data doesn't support.
  const ceiling = clamp(retrievalScore + 0.4, 0.35, 0.97);
  const blended = clamp(modelConfidence * 0.7 + retrievalScore * 0.3, 0, ceiling);
  const confidence = Math.round(blended * 100) / 100;

  return {
    ...result,
    confidence,
    confidence_label: confidenceLabel(confidence),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
