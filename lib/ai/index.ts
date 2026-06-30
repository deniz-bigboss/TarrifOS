import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";

export type { AIProvider } from "./types";
export { MockAIProvider } from "./mock-provider";
export { OpenAIProvider } from "./openai-provider";
export { AnthropicProvider } from "./anthropic-provider";

let cached: AIProvider | null = null;

/**
 * Returns the active AI provider based on environment configuration.
 *
 *   AI_PROVIDER=mock        -> MockAIProvider (default, no keys needed)
 *   AI_PROVIDER=openai      -> OpenAIProvider (requires OPENAI_API_KEY)
 *   AI_PROVIDER=anthropic   -> AnthropicProvider (requires ANTHROPIC_API_KEY)
 *
 * If a real provider is selected but its key is missing, we fall back to mock
 * and log a warning so local/dev never hard-fails.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      cached = new OpenAIProvider(key);
      return cached;
    }
    console.warn("[ai] AI_PROVIDER=openai but OPENAI_API_KEY missing — using mock.");
  }

  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key) {
      cached = new AnthropicProvider(key);
      return cached;
    }
    console.warn("[ai] AI_PROVIDER=anthropic but ANTHROPIC_API_KEY missing — using mock.");
  }

  cached = new MockAIProvider();
  return cached;
}

/** Human-readable label for the currently active provider (for UI badges). */
export function activeProviderName(): string {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (provider === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}
