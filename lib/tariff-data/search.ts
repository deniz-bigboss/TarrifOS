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

/** Strip a simple plural suffix so "smartphones" matches keyword "smartphone". */
function singular(token: string): string {
  if (token.length > 4 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

/**
 * Lexical keyword scorer.
 *
 * Scores a tariff code against query tokens using weighted matches on the
 * code's keywords (strongest), title, and description. Returns a 0..1 score.
 *
 * The score is an ABSOLUTE, saturating measure of match strength — NOT
 * normalized by query length. The previous version divided by the number of
 * query tokens, which meant a rich, detailed description (exactly what Quick
 * Find produces) scored far LOWER than a terse one: a 40-token spec-sheet
 * description strongly hitting 5 keywords scored ~0.15 while a 6-token query
 * hitting the same keywords scored ~0.8. Since retrieval score caps final
 * confidence downstream, better product info paradoxically produced worse
 * confidence. Now ~4 strong keyword hits saturate the score at 1.0 no matter
 * how much additional (non-matching but harmless) detail surrounds them.
 */
export function scoreCode(
  code: TariffCode,
  queryTokens: string[],
  /**
   * Tokens from the product NAME. These score 2.5x: the name states what the
   * product IS, while descriptions legitimately mention components ("…with a
   * lithium-ion battery…") — without the boost, a smartphone's battery
   * mention could out-score the smartphone code and recommend classifying
   * the phone as a battery pack.
   */
  emphasizedTokens: Set<string> = new Set(),
): number {
  if (queryTokens.length === 0) return 0;

  const keywordSet = new Set(code.keywords.map((k) => k.toLowerCase()));
  const titleTokens = new Set(tokenize(code.title));
  const descTokens = new Set(tokenize(code.description));
  const keywordPhrase = code.keywords.join(" ").toLowerCase();

  let strength = 0;
  let strongHits = 0;

  for (const rawToken of queryTokens) {
    let tokenScore = 0;

    // Try the token as-is and with a plural suffix stripped, so
    // "smartphones" still hits the keyword/title token "smartphone".
    for (const token of rawToken === singular(rawToken)
      ? [rawToken]
      : [rawToken, singular(rawToken)]) {
      // Exact keyword hit is the strongest signal.
      if (keywordSet.has(token)) {
        tokenScore = Math.max(tokenScore, 1);
      } else if (
        // Partial keyword containment (e.g. "tshirt" vs "t-shirt" handled via phrase).
        keywordPhrase.includes(token)
      ) {
        tokenScore = Math.max(tokenScore, 0.7);
      } else if (titleTokens.has(token)) {
        tokenScore = Math.max(tokenScore, 0.6);
      } else if (descTokens.has(token)) {
        tokenScore = Math.max(tokenScore, 0.35);
      } else {
        // Fuzzy substring against keywords for compound words.
        for (const kw of keywordSet) {
          if (kw.length > 3 && (kw.includes(token) || token.includes(kw))) {
            tokenScore = Math.max(tokenScore, 0.45);
          }
        }
      }
    }

    if (tokenScore >= 0.7) strongHits += 1;
    strength += tokenScore * (emphasizedTokens.has(rawToken) ? 2.5 : 1);
  }

  // ~4 strong hits saturate at 1.0. Without at least one strong hit the score
  // is capped low — an accumulation of weak description-overlap tokens alone
  // must not look like a confident match.
  const score = Math.min(1, strength / 4);
  return strongHits === 0 ? Math.min(score, 0.3) : score;
}

/** Search a code list, returning the top-N scored candidates (default 8). */
export function searchSeedCodes(
  codes: TariffCode[],
  query: string,
  limit = 8,
  /** Free text (typically the product name) whose tokens score 2.5x. */
  emphasize?: string,
): CandidateCode[] {
  // Dedupe: the query concatenates name + description + material, so a
  // component word repeated across fields ("battery" in both description and
  // composition) must only count once.
  const tokens = Array.from(new Set(tokenize(query)));
  const emphasized = new Set(emphasize ? tokenize(emphasize) : []);
  const scored = codes
    .map<CandidateCode>((code) => ({
      ...code,
      score: scoreCode(code, tokens, emphasized),
    }))
    .filter((c) => c.score > 0.05)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
