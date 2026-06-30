import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "tariffos_sk_";

export interface GeneratedApiKey {
  /** Full plaintext key — shown to the user exactly once. */
  plaintext: string;
  /** Stored, searchable prefix (first chars) for display/lookup. */
  keyPrefix: string;
  /** SHA-256 hash stored in the database. */
  keyHash: string;
}

/** Generate a new API key. The plaintext is never persisted. */
export function generateApiKey(): GeneratedApiKey {
  const secret = randomBytes(24).toString("base64url");
  const plaintext = `${KEY_PREFIX}${secret}`;
  return {
    plaintext,
    keyPrefix: plaintext.slice(0, KEY_PREFIX.length + 6),
    keyHash: hashApiKey(plaintext),
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** Pull a bearer token out of an Authorization header. */
export function parseBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
