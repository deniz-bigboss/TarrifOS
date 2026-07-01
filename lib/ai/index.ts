import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GeminiProvider } from "./gemini-provider";

export type { AIProvider } from "./types";
export { MockAIProvider } from "./mock-provider";
export { OpenAIProvider } from "./openai-provider";
export { AnthropicProvider } from "./anthropic-provider";
export { GeminiProvider } from "./gemini-provider";

let cached: AIProvider | null = null;

/** Returns the API key env var name for a provider, or null for mock. */
function keyFor(provider: string): string | null {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || null;
    case "gemini":
      // Accept either GEMINI_API_KEY or Google's conventional GOOGLE_API_KEY.
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
    default:
      return null;
  }
}

/**
 * Returns the active AI provider based on environment configuration.
 *
 *   AI_PROVIDER=mock        -> MockAIProvider (default, no keys needed)
 *   AI_PROVIDER=openai      -> OpenAIProvider (requires OPENAI_API_KEY)
 *   AI_PROVIDER=anthropic   -> AnthropicProvider (requires ANTHROPIC_API_KEY)
 *   AI_PROVIDER=gemini      -> GeminiProvider (requires GEMINI_API_KEY, free tier)
 *
 * If a real provider is selected but its key is missing, we fall back to mock
 * and log a warning so local/dev never hard-fails.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  const key = keyFor(provider);

  if (provider !== "mock" && !key) {
    console.warn(
      `[ai] AI_PROVIDER=${provider} but its API key is missing — using mock.`,
    );
  } else if (provider === "openai" && key) {
    cached = new OpenAIProvider(key);
    return cached;
  } else if (provider === "anthropic" && key) {
    cached = new AnthropicProvider(key);
    return cached;
  } else if (provider === "gemini" && key) {
    cached = new GeminiProvider(key);
    return cached;
  }

  cached = new MockAIProvider();
  return cached;
}

/** Human-readable label for the currently active provider (for UI badges). */
export function activeProviderName(): string {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (provider !== "mock" && keyFor(provider)) return provider;
  return "mock";
}
