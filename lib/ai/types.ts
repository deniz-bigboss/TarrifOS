import type {
  CandidateCode,
  ClassificationResult,
  ProductInput,
} from "@/types";

/**
 * Result of a "quick find" product lookup (Quick Find toggle in the
 * classification wizard). `found: false` means the provider did not
 * recognize the product with reasonable confidence — callers must treat
 * that as "no data," never fabricate plausible-looking specs.
 */
export interface ProductLookupResult {
  found: boolean;
  product_name: string;
  product_description: string;
  material_composition: string | null;
  intended_use: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  /** Approximate net weight of a single unit, in kilograms. Estimate — the
   *  user reviews/edits it before submitting. null when not confidently known. */
  unit_weight_kg: number | null;
  source: "curated" | "ai";
  /**
   * Set when the live AI lookup failed (rate limit, quota, network) and the
   * result came from the offline fallback instead. Surfaced in the UI so a
   * quota problem isn't mistaken for "this product doesn't exist".
   */
  degraded_reason?: string;
}

/**
 * AIProvider is the model-provider abstraction. Implementations:
 *  - MockAIProvider       (deterministic, no API key — default)
 *  - OpenAIProvider       (AI_PROVIDER=openai, OPENAI_API_KEY)
 *  - AnthropicProvider    (AI_PROVIDER=anthropic, ANTHROPIC_API_KEY)
 *
 * Every provider must return a fully-formed ClassificationResult. The
 * classification pipeline then validates and enforces compliance rules on top.
 */
export interface AIProvider {
  readonly name: string;

  /** Reason over retrieved candidate codes and return a structured result. */
  classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult>;

  /** Generate clarifying questions when product information is incomplete. */
  generateMissingInfoQuestions(input: ProductInput): Promise<string[]>;

  /** Produce a broker-ready narrative explanation for a finished result. */
  generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string>;

  /**
   * Quick Find: identify a product from a short name/model (e.g. a brand +
   * model string) and return fields to pre-fill the wizard. Must return
   * `found: false` rather than guessing when the product isn't recognized.
   */
  lookupProduct(query: string): Promise<ProductLookupResult>;
}
