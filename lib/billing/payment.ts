import { isStripeConfigured } from "./stripe";
import { isIyzicoConfigured } from "./iyzico";

/**
 * Which payment provider is active.
 *
 *   PAYMENT_PROVIDER=iyzico  -> iyzico (Türkiye: TRY, local cards, installments)
 *   PAYMENT_PROVIDER=stripe  -> Stripe (kept for the future EU move)
 *   (unset)                  -> auto: iyzico if configured, else stripe if
 *                               configured, else "mock" (plan applied directly)
 *
 * Keeping both behind one switch means the EU migration is a config change,
 * not a rewrite.
 */
export type PaymentProvider = "iyzico" | "stripe" | "mock";

export function getPaymentProvider(): PaymentProvider {
  const explicit = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (explicit === "iyzico") return "iyzico";
  if (explicit === "stripe") return "stripe";
  if (explicit === "mock") return "mock";
  if (isIyzicoConfigured()) return "iyzico";
  if (isStripeConfigured()) return "stripe";
  return "mock";
}

/** True when a real (non-mock) provider is active. */
export function isPaymentLive(): boolean {
  return getPaymentProvider() !== "mock";
}
