import Stripe from "stripe";
import type { PlanId } from "@/types/database";

/**
 * Stripe helpers: client factory, plan ↔ price-ID mapping, and configuration
 * checks. Price IDs come from env so operators can point at their own Stripe
 * products without code changes:
 *
 *   STRIPE_SECRET_KEY        sk_test_... / sk_live_...
 *   STRIPE_WEBHOOK_SECRET    whsec_... (from the webhook endpoint config)
 *   STRIPE_PRICE_STARTER     price_... (recurring price for Starter)
 *   STRIPE_PRICE_GROWTH      price_...
 *   STRIPE_PRICE_BUSINESS    price_...
 *
 * Free needs no price (downgrade = cancel via the customer portal) and
 * Forwarder is sales-led, so neither has a checkout price.
 */

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Plans purchasable through Checkout (paid, self-serve). */
export const CHECKOUT_PLANS: PlanId[] = ["starter", "pro", "business"];

export function priceIdForPlan(planId: PlanId): string | null {
  switch (planId) {
    case "starter":
      return process.env.STRIPE_PRICE_STARTER || null;
    case "pro":
      return process.env.STRIPE_PRICE_PRO || null;
    case "business":
      return process.env.STRIPE_PRICE_BUSINESS || null;
    default:
      return null;
  }
}

/** Reverse lookup used by the webhook: which plan does a price ID grant? */
export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return null;
}
