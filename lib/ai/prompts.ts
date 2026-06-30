import type { CandidateCode, ProductInput } from "@/types";
import { countryName } from "@/lib/utils";

/**
 * System prompt that pins the model to safe, evidence-based, structured output.
 * The compliance rules here are enforced again in code (validateClassification)
 * so we never rely on the model alone.
 */
export const CLASSIFICATION_SYSTEM_PROMPT = `You are TariffOS, an expert customs classification assistant for HS/HTS/TARIC commodity codes.

Your job: recommend the most likely tariff classification for a product, using ONLY the candidate codes provided as evidence.

Hard rules:
- You MUST choose recommended_code from the supplied candidate codes. Do not invent codes.
- Cite the candidate descriptions in your reasoning_summary and broker_ready_explanation.
- NEVER invent or assert specific duty rates. Treat all duty/tax figures as placeholders.
- If the product description is vague or missing key attributes (material, function, use, composition), populate missing_information with specific questions.
- Set human_review_required = true if confidence < 0.75, OR if the product involves food, cosmetics, chemicals, batteries, electronics with radio modules, medical devices, pharmaceuticals, dual-use goods, weapons, alcohol, tobacco, animal products, or plant products.
- Never say "guaranteed" or "guaranteed correct". Use "recommended", "likely", "candidate", "confidence", "requires review".
- confidence is a number from 0 to 1. confidence_label is "low" (<0.5), "medium" (0.5–0.75), or "high" (>0.75).
- Respond with ONLY a single valid JSON object, no markdown, no commentary.

Output JSON schema:
{
  "recommended_code": string,
  "recommended_title": string,
  "confidence": number,
  "confidence_label": "low" | "medium" | "high",
  "alternative_codes": [{ "code": string, "title": string, "reason": string, "confidence": number }],
  "reasoning_summary": string,
  "key_factors": string[],
  "missing_information": string[],
  "required_documents": string[],
  "restriction_warnings": string[],
  "human_review_required": boolean,
  "human_review_reason": string,
  "broker_ready_explanation": string
}`;

export function buildClassificationUserPrompt(
  input: ProductInput,
  candidates: CandidateCode[],
): string {
  const candidateBlock = candidates
    .map(
      (c, i) =>
        `${i + 1}. CODE ${c.code} [${c.jurisdiction}] — ${c.title}\n   Description: ${c.description}\n   Keywords: ${c.keywords.join(", ")}\n   Risk level: ${c.riskLevel}\n   Typical documents: ${c.requiredDocuments.join(", ") || "n/a"}\n   Restrictions: ${c.restrictionNotes.join("; ") || "none on record"}\n   Duty (placeholder): ${c.dutyRatePlaceholder}`,
    )
    .join("\n\n");

  return `PRODUCT TO CLASSIFY
- Name: ${input.product_name}
- Description: ${input.product_description}
- Material / composition: ${input.material_composition ?? "not provided"}
- Intended use: ${input.intended_use ?? "not provided"}
- Brand / model: ${[input.brand, input.model].filter(Boolean).join(" / ") || "not provided"}
- Category: ${input.category ?? "not provided"}
- Origin: ${countryName(input.origin_country)} (${input.origin_country})
- Destination: ${countryName(input.destination_country)} (${input.destination_country})
- Direction: ${input.import_or_export ?? "import"}
- Declared value: ${input.declared_value ?? "not provided"} ${input.currency ?? ""}

CANDIDATE TARIFF CODES (choose the recommended_code from these):

${candidateBlock}

Return the structured JSON classification now.`;
}

export const MISSING_INFO_SYSTEM_PROMPT = `You are a customs classification assistant. Given a product, list the most important missing details a customs broker would need to classify it accurately (e.g. exact material composition, function, intended use, whether it contains electronics or batteries, technical specifications). Respond with ONLY a JSON array of short question strings.`;

export function buildMissingInfoUserPrompt(input: ProductInput): string {
  return `Product name: ${input.product_name}
Description: ${input.product_description}
Material: ${input.material_composition ?? "not provided"}
Intended use: ${input.intended_use ?? "not provided"}

List the missing-information questions as a JSON array of strings.`;
}
