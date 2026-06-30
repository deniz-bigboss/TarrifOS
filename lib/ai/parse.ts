import type {
  AlternativeCode,
  CandidateCode,
  ClassificationResult,
  ConfidenceLabel,
  ProductInput,
} from "@/types";
import { LEGAL_DISCLAIMER } from "@/types";

/** Extract the first JSON object/array from a model response string. */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  // Strip ```json fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : trimmed;

  const firstBrace = body.search(/[{[]/);
  if (firstBrace === -1) throw new Error("No JSON found in model response");

  // Find the matching closing bracket by scanning.
  const open = body[firstBrace];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = firstBrace; i < body.length; i++) {
    if (body[i] === open) depth++;
    else if (body[i] === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(body.slice(firstBrace, i + 1));
      }
    }
  }
  return JSON.parse(body.slice(firstBrace));
}

function labelFor(confidence: number): ConfidenceLabel {
  if (confidence > 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/**
 * Normalize an arbitrary model JSON object into a safe ClassificationResult,
 * filling missing fields from the retrieved candidates so the result is always
 * well-formed even if the model omits something.
 */
export function normalizeModelResult(
  parsed: unknown,
  input: ProductInput,
  candidates: CandidateCode[],
): ClassificationResult {
  const obj = (parsed ?? {}) as Record<string, unknown>;
  const top = candidates[0];

  const recommendedCode =
    typeof obj.recommended_code === "string" && obj.recommended_code
      ? obj.recommended_code
      : (top?.code ?? "");

  // Anchor title/documents/restrictions to the matched candidate when possible.
  const matched =
    candidates.find((c) => c.code === recommendedCode) ?? top;

  const confidenceRaw =
    typeof obj.confidence === "number" ? obj.confidence : 0.5;
  const confidence = Math.round(Math.max(0, Math.min(1, confidenceRaw)) * 100) / 100;

  const alternatives: AlternativeCode[] = Array.isArray(obj.alternative_codes)
    ? (obj.alternative_codes as Record<string, unknown>[])
        .map((a) => ({
          code: String(a.code ?? ""),
          title: String(a.title ?? ""),
          reason: String(a.reason ?? ""),
          confidence:
            typeof a.confidence === "number"
              ? Math.round(Math.max(0, Math.min(1, a.confidence)) * 100) / 100
              : 0,
        }))
        .filter((a) => a.code)
    : [];

  const requiredDocuments = asStringArray(obj.required_documents);
  const restrictionWarnings = asStringArray(obj.restriction_warnings);

  return {
    recommended_code: recommendedCode,
    recommended_title:
      typeof obj.recommended_title === "string" && obj.recommended_title
        ? obj.recommended_title
        : (matched?.title ?? ""),
    confidence,
    confidence_label:
      obj.confidence_label === "low" ||
      obj.confidence_label === "medium" ||
      obj.confidence_label === "high"
        ? obj.confidence_label
        : labelFor(confidence),
    alternative_codes: alternatives,
    reasoning_summary:
      typeof obj.reasoning_summary === "string" ? obj.reasoning_summary : "",
    key_factors: asStringArray(obj.key_factors),
    missing_information: asStringArray(obj.missing_information),
    required_documents: requiredDocuments.length
      ? requiredDocuments
      : [...(matched?.requiredDocuments ?? [])],
    restriction_warnings: restrictionWarnings.length
      ? restrictionWarnings
      : [...(matched?.restrictionNotes ?? [])],
    human_review_required: Boolean(obj.human_review_required),
    human_review_reason:
      typeof obj.human_review_reason === "string" ? obj.human_review_reason : "",
    broker_ready_explanation:
      typeof obj.broker_ready_explanation === "string"
        ? obj.broker_ready_explanation
        : "",
    disclaimer: LEGAL_DISCLAIMER,
  };
}
