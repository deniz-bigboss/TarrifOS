import { GoogleGenAI } from "@google/genai";
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
 * GeminiProvider — classification + Quick Find via Google's Gemini API.
 *
 * Chosen as the "free" real-provider option: Gemini has a genuine free tier
 * (no billing card required for a key from aistudio.google.com) and its
 * `googleSearch` grounding tool gives Quick Find real live web search rather
 * than training-data recall. Falls back to the deterministic MockAIProvider
 * on any error so a missing quota / rejected tool never breaks the product.
 */
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;
  private model: string;
  private fallback = new MockAIProvider();

  constructor(apiKey: string, model = process.env.GEMINI_MODEL || "gemini-2.5-flash") {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    // Search-grounded first: lets Gemini verify HS codes against official
    // sources, which matters most when no local candidate fits the product.
    // Search and forced-JSON mode are mutually exclusive, so this path relies
    // on the system prompt + extractJson; it falls back to the plain JSON
    // call, then to mock, so a rejected tool never breaks classification.
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: buildClassificationUserPrompt(input, candidates),
        config: {
          systemInstruction: CLASSIFICATION_SYSTEM_PROMPT,
          temperature: 0.1,
          tools: [{ googleSearch: {} }],
        },
      });
      return normalizeModelResult(extractJson(response.text ?? ""), input, candidates);
    } catch (err) {
      console.error(
        "[GeminiProvider] search-grounded classifyProduct failed, retrying without search:",
        err,
      );
      return this.classifyProductWithoutSearch(input, candidates);
    }
  }

  /** Fallback when the googleSearch tool isn't available on this key/model. */
  private async classifyProductWithoutSearch(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: buildClassificationUserPrompt(input, candidates),
        config: {
          systemInstruction: CLASSIFICATION_SYSTEM_PROMPT,
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });
      return normalizeModelResult(extractJson(response.text ?? ""), input, candidates);
    } catch (err) {
      console.error("[GeminiProvider] classifyProduct failed, using mock:", err);
      return this.fallback.classifyProduct(input, candidates);
    }
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: buildMissingInfoUserPrompt(input),
        config: {
          systemInstruction: MISSING_INFO_SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });
      const parsed = extractJson(response.text ?? "[]");
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (err) {
      console.error("[GeminiProvider] missingInfo failed, using mock:", err);
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

    // Google Search grounding gives real, current product details. Note the
    // search tool and forced-JSON response mode are mutually exclusive, so we
    // rely on the system prompt + extractJson() (which tolerates surrounding
    // text and any citation markup Gemini appends) instead of responseMimeType.
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: buildProductLookupUserPrompt(query),
        config: {
          systemInstruction: PRODUCT_LOOKUP_SYSTEM_PROMPT,
          temperature: 0.1,
          tools: [{ googleSearch: {} }],
        },
      });
      return normalizeLookupResult(extractJson(response.text ?? ""), query);
    } catch (err) {
      console.error(
        "[GeminiProvider] search-grounded lookupProduct failed, retrying without search:",
        err,
      );
      return this.lookupProductWithoutSearch(query);
    }
  }

  /** Fallback when the googleSearch tool isn't available on this key/model. */
  private async lookupProductWithoutSearch(query: string): Promise<ProductLookupResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: buildProductLookupUserPrompt(query),
        config: {
          systemInstruction: PRODUCT_LOOKUP_SYSTEM_PROMPT,
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });
      return normalizeLookupResult(extractJson(response.text ?? ""), query);
    } catch (err) {
      console.error("[GeminiProvider] lookupProduct failed, using mock:", err);
      const offline = await this.fallback.lookupProduct(query);
      return {
        ...offline,
        degraded_reason:
          "The live Gemini lookup failed (often a free-tier rate limit or daily quota — it resets automatically). Only the built-in product list was checked.",
      };
    }
  }
}
