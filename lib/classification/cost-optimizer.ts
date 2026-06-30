import type {
  CandidateCode,
  ClassificationResult,
  CostOptimization,
  DutyComparisonEntry,
  ProductInput,
} from "@/types";
import { findTradePrograms } from "@/lib/tariff-data/trade-programs";
import { getDeMinimis } from "@/lib/tariff-data/de-minimis";
import { estimateDutyValue } from "./duty";

const MAX_COMPARISON_CANDIDATES = 6;

/**
 * generateCostOptimization — the first "assistant" capability layered on top
 * of the core classification pipeline (lib/classification/pipeline.ts).
 *
 * This never changes the recommended code or its confidence — classification
 * reflects what the product IS, not what is cheapest. It only surfaces
 * legitimate, evidence-based ways to reduce landed cost: comparing duty
 * across the already-retrieved candidates (so classification accuracy reads
 * as a real cost lever, not a reason to pick a cheaper-but-wrong code),
 * checking preferential trade program eligibility, and noting de minimis
 * thresholds. Everything here is informational; a human always decides.
 */
export function generateCostOptimization(
  input: ProductInput,
  candidates: CandidateCode[],
  result: ClassificationResult,
): CostOptimization {
  const declaredValue = input.declared_value ?? null;

  const dutyComparison: DutyComparisonEntry[] = candidates
    .slice(0, MAX_COMPARISON_CANDIDATES)
    .map((c) => ({
      code: c.code,
      title: c.title,
      is_recommended: c.code === result.recommended_code,
      duty_rate_placeholder: c.dutyRatePlaceholder,
      estimated_duty_value: estimateDutyValue(c.dutyRatePlaceholder, declaredValue),
    }));

  const tradePrograms = findTradePrograms(
    input.origin_country,
    input.destination_country,
  );

  const deMinimis = getDeMinimis(input.destination_country);

  const recommendations: string[] = [];

  for (const program of tradePrograms) {
    if (program.may_apply) {
      recommendations.push(
        `If this shipment qualifies under the ${program.name} (rules of origin must be met), duty could drop to ${program.potential_duty_rate} with a ${program.proof_required}.`,
      );
    }
  }

  if (deMinimis) {
    recommendations.push(
      `${deMinimis.country} has a de minimis reference threshold of ${deMinimis.threshold_placeholder} — shipments under this value may avoid duty entirely. ${deMinimis.notes}`,
    );
  }

  const dutyValues = dutyComparison
    .map((d) => parsePercent(d.duty_rate_placeholder))
    .filter((v): v is number => v != null);
  if (dutyValues.length >= 2) {
    const spread = Math.max(...dutyValues) - Math.min(...dutyValues);
    if (spread >= 3) {
      recommendations.push(
        `Duty rates among the retrieved candidate codes range from ${Math.min(...dutyValues)}% to ${Math.max(...dutyValues)}% — accurate classification has a real cost impact. Confirm the recommended code's description genuinely matches the product before filing; never choose a code because it is cheaper.`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "No specific cost-reduction opportunities were identified for this lane in the current reference data. Standard duty applies.",
    );
  }

  return {
    duty_comparison: dutyComparison,
    trade_programs: tradePrograms,
    de_minimis: deMinimis ? [deMinimis] : [],
    recommendations,
    disclaimer:
      "These are cost-reduction opportunities to evaluate, not classification advice — a tariff code must always reflect what the product actually is, never what is cheapest. Under-declaring value or misrepresenting origin to reduce duty is unlawful. Confirm eligibility and figures with a customs broker before relying on them.",
  };
}

function parsePercent(ratePlaceholder: string): number | null {
  const match = ratePlaceholder.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const pct = parseFloat(match[1]);
  return Number.isNaN(pct) ? null : pct;
}
