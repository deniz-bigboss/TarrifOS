import { isStripeConfigured } from "./stripe";
import { isPaddleConfigured } from "./paddle";

/**
 * Which payment provider is active.
 *
 *   PAYMENT_PROVIDER=paddle  -> Paddle (merchant of record — sells worldwide,
 *                               handles VAT, pays out to a personal bank
 *                               account; no registered company required)
 *   PAYMENT_PROVIDER=stripe  -> Stripe (kept for the future EU move)
 *   (unset)                  -> auto: paddle if configured, else stripe if
 *                               configured, else "mock" (plan applied directly)
 *
 * Keeping both behind one switch means the EU migration is a config change,
 * not a rewrite.
 */
export type PaymentProvider = "paddle" | "stripe" | "mock";

export function getPaymentProvider(): PaymentProvider {
  const explicit = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (explicit === "paddle") return "paddle";
  if (explicit === "stripe") return "stripe";
  if (explicit === "mock") return "mock";
  if (isPaddleConfigured()) return "paddle";
  if (isStripeConfigured()) return "stripe";
  return "mock";
}

/** True when a real (non-mock) provider is active. */
export function isPaymentLive(): boolean {
  return getPaymentProvider() !== "mock";
}
