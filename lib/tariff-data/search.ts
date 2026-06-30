import type { CandidateCode, TariffCode } from "@/types";

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "for", "with", "and", "or", "to", "in", "on",
  "made", "from", "type", "product", "item", "new", "used", "high", "quality",
]);

/** Tokenize free text into lowercased, de-noised search terms.
 *  Hyphenated terms are kept whole AND split into parts (so "short-sleeve"
 *  contributes "short" and "sleeve" while "t-shirt" still matches as a unit).
 *  Pure numeric / percentage tokens (e.g. "100%", "2.5") are dropped as noise. */
export function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9%\s.-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tokens: string[] = [];
  for (const t of raw) {
    if (t.includes("-")) {
      tokens.push(t, ...t.split("-"));
    } else {
      tokens.push(t);
    }
  }

  const isNumericNoise = (t: string) => /^\d+(\.\d+)?%?$/.test(t);

  return tokens
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t) && !isNumericNoise(t));
}

/**
 * Lexical keyword scorer.
 *
 * Scores a tariff code against query tokens using weighted matches on the
 * code's keywords (strongest), title, and description. Returns a 0..1 score.
 */
export function scoreCode(code: TariffCode, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;

  const keywordSet = new Set(code.keywords.map((k) => k.toLowerCase()));
  const titleTokens = new Set(tokenize(code.title));
  const descTokens = new Set(tokenize(code.description));
  const keywordPhrase = code.keywords.join(" ").toLowerCase();

  let score = 0;
  let matched = 0;

  for (const token of queryTokens) {
    let tokenScore = 0;

    // Exact keyword hit is the strongest signal.
    if (keywordSet.has(token)) {
      tokenScore = 1;
    } else if (
      // Partial keyword containment (e.g. "tshirt" vs "t-shirt" handled via phrase).
      keywordPhrase.includes(token)
    ) {
      tokenScore = 0.7;
    } else if (titleTokens.has(token)) {
      tokenScore = 0.6;
    } else if (descTokens.has(token)) {
      tokenScore = 0.35;
    } else {
      // Fuzzy substring against keywords for compound words.
      for (const kw of keywordSet) {
        if (kw.length > 3 && (kw.includes(token) || token.includes(kw))) {
          tokenScore = Math.max(tokenScore, 0.45);
        }
      }
    }

    if (tokenScore > 0) matched += 1;
    score += tokenScore;
  }

  // Normalize by query length, with a coverage bonus so codes matching many
  // distinct query terms rank above codes matching one term strongly.
  const normalized = score / queryTokens.length;
  const coverage = matched / queryTokens.length;
  return Math.min(1, normalized * 0.7 + coverage * 0.3);
}

/** Search a code list, returning the top-N scored candidates (default 8). */
export function searchSeedCodes(
  codes: TariffCode[],
  query: string,
  limit = 8,
): CandidateCode[] {
  const tokens = tokenize(query);
  const scored = codes
    .map<CandidateCode>((code) => ({ ...code, score: scoreCode(code, tokens) }))
    .filter((c) => c.score > 0.05)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
