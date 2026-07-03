/**
 * Tiny in-memory TTL cache shared by the live tariff adapters. Government
 * tariff APIs are rate-limited and their data changes at most daily, so we
 * cache successful lookups for a while and never hammer them per request.
 *
 * Module-level state lives for the lifetime of the serverless instance; the
 * scheduled refresh route can clear it to force a re-fetch (see
 * app/api/cron/refresh-tariffs).
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

/** Default time-to-live: 12 hours. */
export const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000;

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

/** Clears the whole cache (used by the scheduled refresh). Returns count cleared. */
export function cacheClear(): number {
  const n = store.size;
  store.clear();
  return n;
}

/**
 * fetch() with a hard timeout so a slow government API can never hang a
 * classification request. Returns null on any failure — callers fall back to
 * seed data, so the product degrades gracefully instead of erroring.
 */
export async function fetchJson<T>(
  url: string,
  opts: { timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 6000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", ...opts.headers },
      // Let Next cache at the fetch layer too; our TTL cache is the primary.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
