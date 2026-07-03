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
 * Generic provider for OpenAI-compatible chat APIs — used for the free-tier
 * fallback chain (Groq, OpenRouter, Cerebras all speak this protocol), so
 * one class covers all three.
 *
 * Unlike the primary providers, methods THROW on failure instead of quietly
 * degrading — the FallbackChainProvider catches and advances to the next
 * provider, and is the single place that decides when to hit the offline
 * engine. None of these APIs offer web search, so the lookup prompt's
 * "if search is available" branch simply doesn't fire; results come from
 * model recall, which the chain flags to the user via degraded notices.
 *
 * No response_format is requested: several free OpenRouter models reject it,
 * and the system prompts already pin output to a single JSON object that
 * extractJson() parses tolerantly.
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  private client: OpenAI;
  private model: string;
  private deterministic = new MockAIProvider();

  constructor(opts: { name: string; baseURL: string; apiKey: string; model: string }) {
    this.name = opts.name;
    this.model = opts.model;
    this.client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });
  }

  private async chat(system: string, user: string, maxTokens: number): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const text = completion.choices[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error(`${this.name}: empty completion`);
    return text;
  }

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    const raw = await this.chat(
      CLASSIFICATION_SYSTEM_PROMPT,
      buildClassificationUserPrompt(input, candidates),
      2000,
    );
    return normalizeModelResult(extractJson(raw), input, candidates);
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    const raw = await this.chat(
      MISSING_INFO_SYSTEM_PROMPT,
      buildMissingInfoUserPrompt(input),
      600,
    );
    const parsed = extractJson(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  }

  async generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string> {
    // Deterministic formatter for a consistent broker format across providers.
    return this.deterministic.generateBrokerReport(input, result);
  }

  async lookupProduct(query: string): Promise<ProductLookupResult> {
    const curated = findCuratedProduct(query);
    if (curated) return curated;
    const raw = await this.chat(
      PRODUCT_LOOKUP_SYSTEM_PROMPT,
      buildProductLookupUserPrompt(query),
      700,
    );
    return normalizeLookupResult(extractJson(raw), query);
  }
}

/** Free-tier fallback providers, in the order the chain tries them. */
export function makeGroqProvider(apiKey: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  });
}

export function makeOpenRouterProvider(apiKey: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
  });
}

export function makeCerebrasProvider(apiKey: string): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    name: "cerebras",
    baseURL: "https://api.cerebras.ai/v1",
    apiKey,
    model: process.env.CEREBRAS_MODEL || "llama-3.3-70b",
  });
}
