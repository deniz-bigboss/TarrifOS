import type { ClassificationResult, ProductInput } from "@/types";

/**
 * Customs-readiness score (0–100). Deliberately NOT just AI confidence: it
 * measures how prepared the shipment is for a customs review — input
 * completeness, documentation, lane data, and open risk — so a user can see
 * exactly what to fix. Deterministic and recomputable from stored data.
 *
 * The score is a readiness indicator for review, never a statement of legal
 * certainty (the UI and reports must always carry the disclaimer).
 */

export interface ReadinessBreakdown {
  score: number; // 0..100
  /** What is already in good shape (human-readable). */
  strong: string[];
  /** What needs attention before filing (human-readable). */
  attention: string[];
}

const HIGH_RISK_FLAGS: Array<{
  key: keyof ProductInput;
  label: string;
}> = [
  { key: "contains_battery", label: "Contains a battery" },
  { key: "is_food", label: "Food product" },
  { key: "is_cosmetic", label: "Cosmetic product" },
  { key: "is_medical_or_health_related", label: "Medical / health-related" },
  { key: "is_chemical", label: "Chemical product" },
  { key: "is_dual_use_or_restricted", label: "Dual-use / restricted" },
];

export function computeReadiness(
  input: ProductInput,
  result: ClassificationResult,
): ReadinessBreakdown {
  let score = 0;
  const strong: string[] = [];
  const attention: string[] = [];

  // --- Classification confidence (up to 35) -------------------------------
  score += Math.round(result.confidence * 35);
  if (result.confidence >= 0.8) {
    strong.push("Classification confidence is high");
  } else {
    attention.push(
      result.missing_information.length > 0
        ? "Confidence can improve — open questions remain unanswered"
        : "Classification confidence is moderate — verify the recommended code",
    );
  }

  // --- Description completeness (up to 15) --------------------------------
  const descLen = (input.product_description ?? "").trim().length;
  if (descLen >= 60) {
    score += 15;
    strong.push("Product description is detailed");
  } else if (descLen >= 25) {
    score += 9;
  } else {
    attention.push("Product description is very short — add function, form, and key features");
  }

  // --- Material / composition (10) ----------------------------------------
  if (input.material_composition) {
    score += 10;
    strong.push("Material composition provided");
  } else {
    attention.push("Material composition not provided");
  }

  // --- Intended use (10) ---------------------------------------------------
  if (input.intended_use) {
    score += 10;
    strong.push("Product use is clear");
  } else {
    attention.push("Intended use not provided");
  }

  // --- Trade lane (10) ------------------------------------------------------
  if (input.origin_country && input.destination_country) {
    score += 10;
    strong.push("Origin and destination known");
  } else {
    attention.push("Origin or destination country missing");
  }

  // --- Documents / certificate (up to 10) ----------------------------------
  if (input.certificate_of_origin_available) {
    score += 7;
    strong.push("Certificate of origin available");
  } else {
    attention.push("Certificate of origin not confirmed");
  }
  if (input.invoice_text || input.product_spec_text) {
    score += 3;
    strong.push("Supporting document text attached");
  }

  // --- Open questions (penalty up to 10) ------------------------------------
  const missing = result.missing_information.length;
  score += Math.max(0, 10 - missing * 3);

  // --- Risk posture (penalties) ---------------------------------------------
  const flaggedRisks = HIGH_RISK_FLAGS.filter((f) => input[f.key] === true);
  for (const f of flaggedRisks) {
    attention.push(`${f.label} — extra controls and documents usually apply`);
  }
  if (result.human_review_required) {
    score -= 8;
    attention.push("Flagged for review before official use");
  }
  score -= Math.min(12, flaggedRisks.length * 4);

  if (
    result.alternative_codes.some(
      (a) => a.confidence >= result.confidence - 0.15 && a.code !== result.recommended_code,
    )
  ) {
    attention.push("An alternative code remains plausible — review before filing");
  }
  attention.push("Final customs declaration should be verified before official use");

  return {
    score: Math.max(0, Math.min(100, score)),
    strong,
    attention: Array.from(new Set(attention)),
  };
}

export function readinessLabel(score: number): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}
