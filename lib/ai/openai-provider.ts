import OpenAI from "openai";
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
 * OpenAIProvider — real classification via the OpenAI Chat Completions API.
 * Falls back to the deterministic MockAIProvider if the API errors, so a
 * transient outage never breaks the product.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;
  private fallback = new MockAIProvider();

  constructor(apiKey: string, model = process.env.OPENAI_MODEL || "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildClassificationUserPrompt(input, candidates),
          },
        ],
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      return normalizeModelResult(extractJson(raw), input, candidates);
    } catch (err) {
      console.error("[OpenAIProvider] classifyProduct failed, using mock:", err);
      return this.fallback.classifyProduct(input, candidates);
    }
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: MISSING_INFO_SYSTEM_PROMPT },
          { role: "user", content: buildMissingInfoUserPrompt(input) },
        ],
      });
      const raw = completion.choices[0]?.message?.content ?? "[]";
      const parsed = extractJson(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (err) {
      console.error("[OpenAIProvider] missingInfo failed, using mock:", err);
      return this.fallback.generateMissingInfoQuestions(input);
    }
  }

  async generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string> {
    // Reuse the deterministic narrative builder for a consistent broker format.
    return this.fallback.generateBrokerReport(input, result);
  }

  async lookupProduct(query: string): Promise<ProductLookupResult> {
    const curated = findCuratedProduct(query);
    if (curated) return curated;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PRODUCT_LOOKUP_SYSTEM_PROMPT },
          { role: "user", content: buildProductLookupUserPrompt(query) },
        ],
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      return normalizeLookupResult(extractJson(raw), query);
    } catch (err) {
      console.error("[OpenAIProvider] lookupProduct failed, using mock:", err);
      return this.fallback.lookupProduct(query);
    }
  }
}
