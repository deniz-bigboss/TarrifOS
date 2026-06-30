import type {
  CandidateCode,
  ClassificationResult,
  ProductInput,
} from "@/types";

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
}
