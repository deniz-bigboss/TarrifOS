import type { CandidateCode, ProductInput } from "@/types";
import { countryName } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

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

/**
 * Quick Find product lookup — identify a product from a short brand/model
 * string (e.g. "S-Works Tarmac SL9") to pre-fill the classification wizard.
 * Explicitly forbids guessing: an unrecognized product must come back as
 * found=false, never a fabricated-but-plausible description.
 */
export const PRODUCT_LOOKUP_SYSTEM_PROMPT = `You identify commercial products from a brand/model name for a customs classification tool, to help pre-fill a form. Respond with ONLY a single valid JSON object, no markdown, no commentary.

Rules:
- If web search is available to you, use it — especially for specific model numbers, storage/capacity variants, recent releases, or anything you are not certain of from memory alone. Prefer manufacturer spec pages and major retailers as sources.
- Only fill in details if you recognize this specific product with reasonable confidence (via search or memory). If you cannot confirm it, are unsure, or it is too generic to identify, return {"found": false} and leave the other fields null — never invent plausible-sounding but fabricated specifications.
- "category" MUST be exactly one of: ${PRODUCT_CATEGORIES.join(", ")}. If none fit well, use null.
- Do not include duty rates, prices, or legal/compliance claims — this tool handles that separately.
- product_description must be factual and specific (material, construction, primary function) in 1-2 sentences, written as it would appear on a commercial invoice or spec sheet. Include capacity/variant details (e.g. storage size, connectivity) when the query specifies them.

Output JSON schema:
{
  "found": boolean,
  "product_name": string,
  "product_description": string,
  "material_composition": string | null,
  "intended_use": string | null,
  "category": string | null,
  "brand": string | null,
  "model": string | null
}`;

export function buildProductLookupUserPrompt(query: string): string {
  return `Identify this product: "${query}"`;
}
