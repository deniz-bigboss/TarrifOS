import { createHmac, timingSafeEqual } from "crypto";
import type { PlanId } from "@/types/database";

/**
 * Pure Paddle-webhook logic — signature verification plus event → plan-change
 * mapping — extracted from the route so it can be unit-tested offline against
 * fixture events. All persistence goes through the injected callbacks.
 *
 * Signature scheme (`Paddle-Signature` header):
 *   ts=<unix seconds>;h1=<hex hmac>[;h1=<second hmac during secret rotation>]
 * where each h1 is HMAC-SHA256(secret, `${ts}:${rawBody}`).
 */

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  opts?: { nowSeconds?: number; toleranceSeconds?: number },
): boolean {
  if (!signatureHeader) return false;

  let ts: string | null = null;
  const hashes: string[] = [];
  for (const part of signatureHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!value) continue;
    if (key === "ts") ts = value;
    else if (key === "h1") hashes.push(value);
  }
  if (!ts || hashes.length === 0) return false;

  // Reject stale timestamps to blunt replay attacks.
  const tolerance = opts?.toleranceSeconds ?? 300;
  const now = opts?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(now - tsNum) > tolerance) return false;

  const expected = createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest();
  return hashes.some((hex) => {
    const candidate = Buffer.from(hex, "hex");
    return (
      candidate.length === expected.length && timingSafeEqual(candidate, expected)
    );
  });
}

export interface PaddleEvent {
  event_type?: string;
  data?: {
    id?: string; // sub_... (subscription) or adj_... (adjustment)
    status?: string; // active | trialing | past_due | paused | canceled
    action?: string; // adjustment action: refund | credit | chargeback | ...
    customer_id?: string; // ctm_...
    subscription_id?: string; // sub_... (present on adjustments)
    transaction_id?: string; // txn_... (present on adjustments)
    custom_data?: { organization_id?: string } | null;
    items?: Array<{ price?: { id?: string } | null } | null> | null;
    /** Adjustment amounts, in the currency's minor unit. */
    totals?: { total?: string; currency_code?: string } | null;
  };
}

export type PaddleOrgMatch =
  | { organizationId: string }
  | { paddleCustomerId: string };

export interface PaddleWebhookDeps {
  planFromPriceId: (priceId: string | null | undefined) => PlanId | null;
  updateOrg: (
    match: PaddleOrgMatch,
    fields: {
      plan?: PlanId;
      paddle_customer_id?: string;
      paddle_subscription_id?: string | null;
    },
  ) => Promise<void>;
  recordBillingEvent: (
    organizationId: string | null,
    plan: PlanId | null,
    status: string,
  ) => Promise<void>;
  /** Resolve an org id from a Paddle customer id. Used for adjustment (refund)
   * events, which carry a customer but usually no checkout custom_data. */
  resolveOrgIdByCustomer?: (customerId: string) => Promise<string | null>;
}

export interface PaddleWebhookResult {
  received: true;
  handled: boolean;
  action?: string;
}

/** Statuses under which the customer keeps their paid plan. `past_due` keeps
 * it through the dunning/retry window; Paddle cancels if retries exhaust. */
const GRANTING_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function applyPaddleEvent(
  event: PaddleEvent,
  deps: PaddleWebhookDeps,
): Promise<PaddleWebhookResult> {
  const type = event.event_type ?? "";

  // Adjustment events (refunds, credits, chargebacks) — record them for the
  // billing audit trail. Plan changes are NOT made here: a refund that also
  // ends the subscription arrives separately as subscription.canceled, and a
  // partial refund should not revoke access. The org is resolved from the
  // customer id since adjustments rarely carry checkout custom_data.
  if (type.startsWith("adjustment.")) {
    const adj = event.data ?? {};
    let orgId = adj.custom_data?.organization_id ?? null;
    if (!orgId && adj.customer_id && deps.resolveOrgIdByCustomer) {
      orgId = await deps.resolveOrgIdByCustomer(adj.customer_id);
    }
    if (!orgId) return { received: true, handled: false };
    const action = adj.action ?? "adjustment";
    await deps.recordBillingEvent(orgId, null, `${type}:${action}`);
    return { received: true, handled: true, action: `${action} recorded` };
  }

  if (!type.startsWith("subscription.")) {
    return { received: true, handled: false };
  }

  const sub = event.data ?? {};
  // The org id travels in custom_data (set at checkout); the customer id
  // links later lifecycle events that may arrive without custom data.
  const orgId = sub.custom_data?.organization_id ?? null;
  const customer = sub.customer_id ?? null;
  const match: PaddleOrgMatch | null = orgId
    ? { organizationId: orgId }
    : customer
      ? { paddleCustomerId: customer }
      : null;
  if (!match) return { received: true, handled: false };

  const status = (sub.status ?? "").toLowerCase();

  // Subscription ended (canceled by the customer or by exhausted payment
  // retries) or paused: drop the org back to the free plan.
  if (
    type === "subscription.canceled" ||
    status === "canceled" ||
    status === "paused"
  ) {
    await deps.updateOrg(match, { plan: "free", paddle_subscription_id: null });
    await deps.recordBillingEvent(orgId, "free", type);
    return { received: true, handled: true, action: "plan → free" };
  }

  // created / activated / updated with a live status: grant the plan that the
  // subscription's price maps to.
  if (!GRANTING_STATUSES.has(status)) return { received: true, handled: false };
  const priceId = sub.items?.find((item) => item?.price?.id)?.price?.id ?? null;
  const plan = deps.planFromPriceId(priceId);
  if (!plan) return { received: true, handled: false };

  await deps.updateOrg(match, {
    plan,
    ...(customer ? { paddle_customer_id: customer } : {}),
    paddle_subscription_id: sub.id ?? null,
  });
  await deps.recordBillingEvent(orgId, plan, type);
  return { received: true, handled: true, action: `plan → ${plan}` };
}
