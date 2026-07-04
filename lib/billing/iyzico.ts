// @ts-expect-error — iyzipay ships no type declarations
import Iyzipay from "iyzipay";
import type { PlanId } from "@/types/database";

/**
 * iyzico helpers: client factory, plan ↔ pricing-plan-reference mapping, and
 * config checks.
 *
 * iyzico subscriptions work differently from Stripe: you first create a
 * Product and monthly Pricing Plans in the iyzico merchant panel, each with a
 * "reference code". We map our plans to those reference codes via env:
 *
 *   IYZICO_API_KEY            your API key
 *   IYZICO_SECRET_KEY         your secret key
 *   IYZICO_URI                https://sandbox-api.iyzipay.com (test) or
 *                             https://api.iyzipay.com (production)
 *   IYZICO_PLAN_STARTER       pricing-plan reference code for Starter
 *   IYZICO_PLAN_GROWTH        …for Growth
 *   IYZICO_PLAN_FORWARDER     …for Forwarder
 */

let cached: Iyzipay | null = null;

export function getIyzico(): Iyzipay {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com";
  if (!apiKey || !secretKey) {
    throw new Error("IYZICO_API_KEY and IYZICO_SECRET_KEY are required.");
  }
  if (!cached) cached = new Iyzipay({ apiKey, secretKey, uri });
  return cached;
}

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

/** Plans purchasable through iyzico (paid, self-serve). */
export const IYZICO_PLANS: PlanId[] = ["starter", "growth", "forwarder"];

export function pricingPlanRefForPlan(planId: PlanId): string | null {
  switch (planId) {
    case "starter":
      return process.env.IYZICO_PLAN_STARTER || null;
    case "growth":
      return process.env.IYZICO_PLAN_GROWTH || null;
    case "forwarder":
      return process.env.IYZICO_PLAN_FORWARDER || null;
    default:
      return null;
  }
}

/** Reverse lookup used by the callback/webhook to resolve which plan was bought. */
export function planFromPricingPlanRef(ref: string | null | undefined): PlanId | null {
  if (!ref) return null;
  if (ref === process.env.IYZICO_PLAN_STARTER) return "starter";
  if (ref === process.env.IYZICO_PLAN_GROWTH) return "growth";
  if (ref === process.env.IYZICO_PLAN_FORWARDER) return "forwarder";
  return null;
}

/** Promise wrapper around the callback-style iyzipay SDK. */
export function iyzicoCall<T = Record<string, unknown>>(
  fn: (params: Record<string, unknown>, cb: (err: unknown, result: T) => void) => void,
  params: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn(params, (err, result) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)));
      else resolve(result);
    });
  });
}
