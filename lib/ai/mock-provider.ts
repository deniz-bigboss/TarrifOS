import type {
  AlternativeCode,
  CandidateCode,
  ClassificationResult,
  ConfidenceLabel,
  ProductInput,
} from "@/types";
import { LEGAL_DISCLAIMER } from "@/types";
import type { AIProvider, ProductLookupResult } from "./types";
import { countryName } from "@/lib/utils";
import { deterministicMissingInfo } from "./missing-info";
import { findCuratedProduct } from "./curated-products";

/**
 * MockAIProvider — fully deterministic, no API key required.
 *
 * It produces realistic, evidence-grounded results so the entire product
 * (wizard, result page, API, dashboard) works end-to-end offline. The final
 * compliance enforcement (human-review rules, confidence floor) is applied by
 * the pipeline's validateClassification stage, so this provider focuses on
 * sensible defaults derived from the retrieved candidates.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    if (candidates.length === 0) {
      return this.noMatchResult(input);
    }

    const [top, ...rest] = candidates;

    // Confidence blends retrieval strength, gap to the next candidate, and
    // how complete the supplied product information is.
    const completeness = this.inputCompleteness(input);
    const gap = rest.length > 0 ? top.score - rest[0].score : 0.25;
    let confidence = clamp(
      top.score * 0.6 + completeness * 0.25 + Math.min(gap, 0.25) * 0.6,
      0.2,
      0.95,
    );
    confidence = Math.round(confidence * 100) / 100;

    const alternatives: AlternativeCode[] = rest.slice(0, 4).map((c) => ({
      code: c.code,
      title: c.title,
      reason: `Possible alternative — matched on: ${c.keywords.slice(0, 4).join(", ")}.`,
      confidence: Math.round(c.score * 80) / 100,
    }));

    const keyFactors = this.deriveKeyFactors(input, top);
    const missingInfo = deterministicMissingInfo(input);

    const reasoningSummary =
      `Based on the product "${input.product_name}", the strongest candidate is ${top.code} — ${top.title}. ` +
      `The seed tariff entry describes it as: "${top.description}" ` +
      `Matching factors include ${keyFactors.slice(0, 3).join(", ")}. ` +
      (alternatives.length
        ? `Alternatives such as ${alternatives.map((a) => a.code).join(", ")} were considered but ranked lower on the available evidence.`
        : `No close alternatives were found in the seed dataset.`);

    const result: ClassificationResult = {
      recommended_code: top.code,
      recommended_title: top.title,
      confidence,
      confidence_label: labelFor(confidence),
      alternative_codes: alternatives,
      reasoning_summary: reasoningSummary,
      key_factors: keyFactors,
      missing_information: missingInfo,
      required_documents: [...top.requiredDocuments],
      restriction_warnings: [...top.restrictionNotes],
      human_review_required: false, // pipeline enforces the real rule
      human_review_reason: "",
      broker_ready_explanation: "", // filled by generateBrokerReport
      disclaimer: LEGAL_DISCLAIMER,
    };

    result.broker_ready_explanation = await this.generateBrokerReport(input, result);
    return result;
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    return deterministicMissingInfo(input);
  }

  async lookupProduct(query: string): Promise<ProductLookupResult> {
    return (
      findCuratedProduct(query) ?? {
        found: false,
        product_name: query,
        product_description: "",
        material_composition: null,
        intended_use: null,
        category: null,
        brand: null,
        model: null,
        unit_weight_kg: null,
        source: "curated",
      }
    );
  }

  async generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string> {
    const lines = [
      `Recommended classification: ${result.recommended_code} — ${result.recommended_title}.`,
      `Trade lane: ${countryName(input.origin_country)} (${input.origin_country}) → ${countryName(input.destination_country)} (${input.destination_country}), ${input.import_or_export ?? "import"}.`,
      `Confidence: ${(result.confidence * 100).toFixed(0)}% (${result.confidence_label}).`,
      `Rationale: ${result.reasoning_summary}`,
    ];

    if (result.required_documents.length) {
      lines.push(
        `Likely required documents: ${result.required_documents.join(", ")}.`,
      );
    }
    if (result.restriction_warnings.length) {
      lines.push(
        `Restrictions / compliance notes: ${result.restriction_warnings.join(" ")}`,
      );
    }
    if (result.missing_information.length) {
      lines.push(
        `Before final declaration, confirm: ${result.missing_information.join(" ")}`,
      );
    }
    lines.push(
      `Duty/tax figures, where shown, are placeholders and must be confirmed against an official tariff source. ${LEGAL_DISCLAIMER}`,
    );

    return lines.join("\n\n");
  }

  // --------------------------------------------------------------- helpers

  private inputCompleteness(input: ProductInput): number {
    const fields = [
      input.product_description && input.product_description.length > 20,
      input.material_composition,
      input.intended_use,
      input.category,
      input.brand || input.model || input.sku,
      input.origin_country,
      input.destination_country,
    ];
    const present = fields.filter(Boolean).length;
    return present / fields.length;
  }

  private deriveKeyFactors(input: ProductInput, top: CandidateCode): string[] {
    const factors: string[] = [];
    if (input.material_composition) factors.push(`material: ${input.material_composition}`);
    if (input.intended_use) factors.push(`use: ${input.intended_use}`);
    factors.push(`function: ${top.title.toLowerCase()}`);
    if (input.origin_country) factors.push(`origin: ${countryName(input.origin_country)}`);
    if (input.destination_country) factors.push(`destination: ${countryName(input.destination_country)}`);
    factors.push(`chapter: ${top.chapter}`);
    return factors;
  }

  private noMatchResult(input: ProductInput): ClassificationResult {
    return {
      recommended_code: "",
      recommended_title: "No confident match found",
      confidence: 0.2,
      confidence_label: "low",
      alternative_codes: [],
      reasoning_summary:
        "The seed tariff dataset did not contain a confident match for this product. Additional product detail and an official tariff source are required.",
      key_factors: [],
      missing_information: deterministicMissingInfo(input),
      required_documents: ["commercial invoice", "packing list"],
      restriction_warnings: [],
      human_review_required: true,
      human_review_reason: "No confident candidate code was retrieved.",
      broker_ready_explanation:
        "No confident classification could be produced from the available information. Manual review by a customs professional is required. " +
        LEGAL_DISCLAIMER,
      disclaimer: LEGAL_DISCLAIMER,
    };
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function labelFor(confidence: number): ConfidenceLabel {
  if (confidence > 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}
