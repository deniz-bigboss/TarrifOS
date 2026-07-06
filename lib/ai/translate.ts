import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

/**
 * Standalone text translator for report localization. It is intentionally
 * separate from the AIProvider abstraction (which is about classification):
 * it just needs one chat completion, and it reuses whatever provider key is
 * configured, in the same free-first order as the classifier's fallback chain.
 *
 * Returns null when no translation provider is configured (e.g. AI_PROVIDER=
 * mock with no keys) or every configured provider fails — callers then keep
 * the English report. Translation is best-effort and always machine-assisted;
 * the report UI labels it and keeps English as the authoritative version.
 */

const TRANSLATE_SYSTEM =
  "You are a professional translator for customs and international-trade documents. " +
  "Translate the given JSON array of strings into the target language. " +
  "Rules: return ONLY a JSON array of the same length and order; translate each string faithfully; " +
  "keep HS/commodity codes, numbers, percentages, currency codes and country codes unchanged; " +
  "preserve any leading marker like [HIGH] or a trailing colon; do not add or drop items; " +
  "use standard customs terminology in the target language.";

function keyFor(name: string): string | null {
  switch (name) {
    case "gemini":
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
    case "openai":
      return process.env.OPENAI_API_KEY || null;
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

const OPENAI_COMPAT: Record<string, { baseURL: string; model: string }> = {
  openai: { baseURL: "https://api.openai.com/v1", model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
  groq: { baseURL: "https://api.groq.com/openai/v1", model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" },
  openrouter: { baseURL: "https://openrouter.ai/api/v1", model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free" },
  cerebras: { baseURL: "https://api.cerebras.ai/v1", model: process.env.CEREBRAS_MODEL || "llama-3.3-70b" },
};

/** Provider order: primary (AI_PROVIDER) first, then the free fallbacks. */
function providerOrder(): string[] {
  const primary = (process.env.AI_PROVIDER || "").toLowerCase();
  const order = [primary, "gemini", "groq", "openrouter", "cerebras", "openai"];
  return order.filter((n, i) => n && order.indexOf(n) === i && keyFor(n));
}

function parseArray(text: string, expected: number): string[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < 0) return null;
  try {
    const arr = JSON.parse(text.slice(start, end + 1));
    if (Array.isArray(arr) && arr.length === expected) return arr.map((x) => String(x));
  } catch {
    /* fall through */
  }
  return null;
}

async function translateWith(
  provider: string,
  strings: string[],
  targetLanguage: string,
): Promise<string[] | null> {
  const key = keyFor(provider);
  if (!key) return null;
  const user =
    `Target language: ${targetLanguage}\n` +
    `Translate this JSON array:\n${JSON.stringify(strings)}`;

  if (provider === "gemini") {
    const client = new GoogleGenAI({ apiKey: key });
    const res = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: user,
      config: { systemInstruction: TRANSLATE_SYSTEM, temperature: 0 },
    });
    return parseArray(res.text ?? "", strings.length);
  }

  const cfg = OPENAI_COMPAT[provider];
  if (!cfg) return null;
  const client = new OpenAI({ apiKey: key, baseURL: cfg.baseURL });
  const completion = await client.chat.completions.create({
    model: cfg.model,
    temperature: 0,
    max_tokens: 3000,
    messages: [
      { role: "system", content: TRANSLATE_SYSTEM },
      { role: "user", content: user },
    ],
  });
  return parseArray(completion.choices[0]?.message?.content ?? "", strings.length);
}

/**
 * Translate an ordered batch of strings into `targetLanguage` in one call,
 * trying configured providers in order. Returns null if none succeed.
 */
export async function translateStrings(
  strings: string[],
  targetLanguage: string,
): Promise<string[] | null> {
  if (strings.length === 0) return [];
  for (const provider of providerOrder()) {
    try {
      const out = await translateWith(provider, strings, targetLanguage);
      if (out) return out;
    } catch (err) {
      console.warn(`[translate] ${provider} failed:`, err);
    }
  }
  return null;
}

/** True when at least one translation provider is configured. */
export function isTranslationAvailable(): boolean {
  return providerOrder().length > 0;
}
