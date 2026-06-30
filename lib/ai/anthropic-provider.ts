import Anthropic from "@anthropic-ai/sdk";
import type {
  CandidateCode,
  ClassificationResult,
  ProductInput,
} from "@/types";
import type { AIProvider, ProductLookupResult } from "./types";
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  MISSING_INFO_SYSTEM_PROMPT,
  PRODUCT_LOOKUP_SYSTEM_PROMPT,
  buildClassificationUserPrompt,
  buildMissingInfoUserPrompt,
  buildProductLookupUserPrompt,
} from "./prompts";
import { extractJson, normalizeModelResult, normalizeLookupResult } from "./parse";
import { MockAIProvider } from "./mock-provider";
import { findCuratedProduct } from "./curated-products";

/**
 * AnthropicProvider — real classification via the Anthropic Messages API.
 * Falls back to the deterministic MockAIProvider on error.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;
  private fallback = new MockAIProvider();

  constructor(
    apiKey: string,
    model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
  ) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        temperature: 0.1,
        system: CLASSIFICATION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildClassificationUserPrompt(input, candidates),
          },
        ],
      });
      const raw = textOf(message);
      return normalizeModelResult(extractJson(raw), input, candidates);
    } catch (err) {
      console.error("[AnthropicProvider] classifyProduct failed, using mock:", err);
      return this.fallback.classifyProduct(input, candidates);
    }
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.2,
        system: MISSING_INFO_SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildMissingInfoUserPrompt(input) },
        ],
      });
      const parsed = extractJson(textOf(message));
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (err) {
      console.error("[AnthropicProvider] missingInfo failed, using mock:", err);
      return this.fallback.generateMissingInfoQuestions(input);
    }
  }

  async generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string> {
    return this.fallback.generateBrokerReport(input, result);
  }

  async lookupProduct(query: string): Promise<ProductLookupResult> {
    const curated = findCuratedProduct(query);
    if (curated) return curated;

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.1,
        system: PRODUCT_LOOKUP_SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildProductLookupUserPrompt(query) },
        ],
      });
      return normalizeLookupResult(extractJson(textOf(message)), query);
    } catch (err) {
      console.error("[AnthropicProvider] lookupProduct failed, using mock:", err);
      return this.fallback.lookupProduct(query);
    }
  }
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
