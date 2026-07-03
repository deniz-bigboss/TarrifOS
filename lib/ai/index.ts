import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GeminiProvider } from "./gemini-provider";
import { FallbackChainProvider } from "./fallback-chain";
import {
  makeCerebrasProvider,
  makeGroqProvider,
  makeOpenRouterProvider,
} from "./openai-compatible";

export type { AIProvider } from "./types";
export { MockAIProvider } from "./mock-provider";
export { OpenAIProvider } from "./openai-provider";
export { AnthropicProvider } from "./anthropic-provider";
export { GeminiProvider } from "./gemini-provider";
export { FallbackChainProvider } from "./fallback-chain";

let cached: AIProvider | null = null;

/** Returns the configured API key for a provider name, or null. */
function keyFor(provider: string): string | null {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || null;
    case "gemini":
      // Accept either GEMINI_API_KEY or Google's conventional GOOGLE_API_KEY.
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
    case "groq":
      return process.env.GROQ_API_KEY || null;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY || null;
    case "cerebras":
      return process.env.CEREBRAS_API_KEY || null;
    default:
      return null;
  }
}

/** Build a single provider instance by name (key must already be checked). */
function buildProvider(name: string, key: string): AIProvider | null {
  switch (name) {
    case "openai":
      return new OpenAIProvider(key);
    case "anthropic":
      return new AnthropicProvider(key);
    case "gemini":
      return new GeminiProvider(key);
    case "groq":
      return makeGroqProvider(key);
    case "openrouter":
      return makeOpenRouterProvider(key);
    case "cerebras":
      return makeCerebrasProvider(key);
    default:
      return null;
  }
}

/**
 * Free-tier fallback order tried after the primary provider fails
 * (rate limit, quota, outage). Only providers with a configured key join
 * the chain; the deterministic offline engine is always the final tail.
 */
const FALLBACK_ORDER = ["groq", "openrouter", "cerebras"] as const;

/**
 * Returns the active AI provider based on environment configuration.
 *
 *   AI_PROVIDER=mock                       -> offline engine only (default)
 *   AI_PROVIDER=gemini|openai|anthropic|
 *               groq|openrouter|cerebras   -> that provider as PRIMARY,
 *     wrapped in a fallback chain with any of GROQ_API_KEY /
 *     OPENROUTER_API_KEY / CEREBRAS_API_KEY that are configured (in that
 *     order, skipping the primary itself), ending at the offline engine.
 *
 * Fallback results are never silent: the chain stamps a service notice on
 * classifications and a degraded reason on Quick Find lookups.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const primaryName = (process.env.AI_PROVIDER || "mock").toLowerCase();

  if (primaryName === "mock") {
    cached = new MockAIProvider();
    return cached;
  }

  const primaryKey = keyFor(primaryName);
  const chain: AIProvider[] = [];

  if (primaryKey) {
    const primary = buildProvider(primaryName, primaryKey);
    if (primary) chain.push(primary);
  } else {
    console.warn(
      `[ai] AI_PROVIDER=${primaryName} but its API key is missing — trying fallbacks/mock.`,
    );
  }

  for (const name of FALLBACK_ORDER) {
    if (name === primaryName) continue;
    const key = keyFor(name);
    if (key) {
      const provider = buildProvider(name, key);
      if (provider) chain.push(provider);
    }
  }

  cached = chain.length > 0 ? new FallbackChainProvider(chain) : new MockAIProvider();
  return cached;
}

/** Human-readable label for the currently active provider (for UI badges). */
export function activeProviderName(): string {
  const primary = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (primary === "mock" || !keyFor(primary)) return "mock";
  const fallbacks = FALLBACK_ORDER.filter(
    (name) => name !== primary && keyFor(name),
  ).length;
  return fallbacks > 0 ? `${primary} +${fallbacks}` : primary;
}
