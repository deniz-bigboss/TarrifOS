import type {
  CandidateCode,
  ClassificationResult,
  ConfidenceLabel,
} from "@/types";

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
  const matched = candidates.find((c) => c.code === result.recommended_code);
  const retrievalScore = matched?.score ?? candidates[0]?.score ?? 0;

  // Weighted blend; cap model confidence by retrieval strength + a margin.
  const modelConfidence = clamp(result.confidence, 0, 1);
  const ceiling = clamp(retrievalScore + 0.35, 0.3, 0.97);
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
