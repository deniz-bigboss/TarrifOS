import type { PlanId } from "@/types/database";

/**
 * Paddle Billing helpers: configuration checks, plan ↔ price-ID mapping, and a
 * tiny REST client (the API is plain JSON over Bearer auth, no SDK needed).
 *
 * Paddle is a merchant of record: it is the legal seller of record, collects
 * worldwide VAT/sales tax, and pays out to a personal bank account — so an
 * individual (no registered company) can sell from Türkiye. Env:
 *
 *   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN   test_... / live_...  (Paddle.js checkout)
 *   PADDLE_API_KEY                    pdl_sdmy_apikey_... / pdl_live_apikey_...
 *   PADDLE_WEBHOOK_SECRET             pdl_ntfset_... (notification destination)
 *   PADDLE_PRICE_STARTER/_GROWTH/_FORWARDER   pri_... (monthly recurring)
 *   PADDLE_ENV                        sandbox | production (auto-detected from
 *                                     the client token prefix when unset)
 *
 * Free needs no price (downgrade = cancel) and Enterprise is sales-led, so
 * neither has a checkout price.
 */

export function isPaddleConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
}

export function paddleEnvironment(): "sandbox" | "production" {
  const explicit = (process.env.PADDLE_ENV || "").toLowerCase();
  if (explicit === "sandbox" || explicit === "production") return explicit;
  // Sandbox client tokens start with test_, live ones with live_.
  return (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "").startsWith("test_")
    ? "sandbox"
    : "production";
}

const API_BASE: Record<"sandbox" | "production", string> = {
  sandbox: "https://sandbox-api.paddle.com",
  production: "https://api.paddle.com",
};

/** Plans purchasable through Paddle checkout (paid, self-serve). */
export const PADDLE_PLANS: PlanId[] = ["starter", "growth", "forwarder"];

export function paddlePriceIdForPlan(planId: PlanId): string | null {
  switch (planId) {
    case "starter":
      return process.env.PADDLE_PRICE_STARTER || null;
    case "growth":
      return process.env.PADDLE_PRICE_GROWTH || null;
    case "forwarder":
      return process.env.PADDLE_PRICE_FORWARDER || null;
    default:
      return null;
  }
}

/** Reverse lookup used by the webhook: which plan does a price ID grant? */
export function planFromPaddlePriceId(
  priceId: string | null | undefined,
): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.PADDLE_PRICE_STARTER) return "starter";
  if (priceId === process.env.PADDLE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.PADDLE_PRICE_FORWARDER) return "forwarder";
  return null;
}

/** Minimal Paddle REST call. Throws with Paddle's error detail on failure. */
export async function paddleFetch<T = unknown>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY is not configured.");
  const res = await fetch(`${API_BASE[paddleEnvironment()]}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: init?.body != null ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    data?: T;
    error?: { detail?: string; code?: string };
  } | null;
  if (!res.ok) {
    throw new Error(
      json?.error?.detail || `Paddle API error (HTTP ${res.status}).`,
    );
  }
  return (json?.data ?? json) as T;
}

/** Cancels a subscription immediately (used for downgrade to Free). */
export async function cancelPaddleSubscription(
  subscriptionId: string,
): Promise<void> {
  await paddleFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: { effective_from: "immediately" },
  });
}

/**
 * Creates a hosted customer-portal session (update card, view invoices,
 * cancel) and returns its overview URL.
 */
export async function createPaddlePortalSession(
  customerId: string,
  subscriptionIds: string[] = [],
): Promise<string> {
  const data = await paddleFetch<{
    urls?: { general?: { overview?: string } };
  }>(`/customers/${customerId}/portal-sessions`, {
    method: "POST",
    body: subscriptionIds.length ? { subscription_ids: subscriptionIds } : {},
  });
  const url = data?.urls?.general?.overview;
  if (!url) throw new Error("Paddle did not return a portal URL.");
  return url;
}
