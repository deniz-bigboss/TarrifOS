import type { PlanId } from "@/types/database";

/**
 * Pure interpretation of an iyzico subscription-checkout-form retrieve result,
 * extracted from the callback route so it can be unit-tested offline.
 *
 * We carry our own identifiers in `conversationId` (iyzico echoes it back
 * verbatim) as "organizationId|planId", and fall back to resolving the plan
 * from the pricing-plan reference code in the result.
 */

export interface IyzicoResult {
  status?: string; // "success" | "failure"
  conversationId?: string;
  subscriptionStatus?: string; // "ACTIVE", "PENDING", …
  pricingPlanReferenceCode?: string;
  subscriptionReferenceCode?: string;
  parentReferenceCode?: string;
  errorMessage?: string;
}

export interface IyzicoInterpretation {
  ok: boolean;
  organizationId: string | null;
  plan: PlanId | null;
  subscriptionReferenceCode: string | null;
  reason?: string;
}

/** Encodes org + plan into a conversationId for round-tripping through iyzico. */
export function encodeConversationId(organizationId: string, plan: PlanId): string {
  return `${organizationId}|${plan}`;
}

function decodeConversationId(
  conversationId: string | undefined,
): { organizationId: string | null; plan: PlanId | null } {
  if (!conversationId) return { organizationId: null, plan: null };
  const [organizationId, plan] = conversationId.split("|");
  return {
    organizationId: organizationId || null,
    plan: (plan as PlanId) || null,
  };
}

export function interpretIyzicoResult(
  result: IyzicoResult,
  planFromPricingPlanRef: (ref: string | null | undefined) => PlanId | null,
): IyzicoInterpretation {
  if (result.status !== "success") {
    return {
      ok: false,
      organizationId: null,
      plan: null,
      subscriptionReferenceCode: null,
      reason: result.errorMessage || "iyzico reported a non-success status.",
    };
  }

  const { organizationId, plan: convoPlan } = decodeConversationId(result.conversationId);
  // Prefer the plan derived from the actual pricing plan the customer paid for;
  // fall back to the one we encoded in the conversation id.
  const plan = planFromPricingPlanRef(result.pricingPlanReferenceCode) ?? convoPlan;

  if (!organizationId || !plan) {
    return {
      ok: false,
      organizationId,
      plan,
      subscriptionReferenceCode: result.subscriptionReferenceCode ?? null,
      reason: "Could not resolve the organization or plan from the result.",
    };
  }

  // Only ACTIVE subscriptions grant the plan. PENDING (e.g. awaiting first
  // charge) is left for a later notification.
  const active =
    !result.subscriptionStatus ||
    result.subscriptionStatus.toUpperCase() === "ACTIVE";
  if (!active) {
    return {
      ok: false,
      organizationId,
      plan,
      subscriptionReferenceCode: result.subscriptionReferenceCode ?? null,
      reason: `Subscription not active yet (${result.subscriptionStatus}).`,
    };
  }

  return {
    ok: true,
    organizationId,
    plan,
    subscriptionReferenceCode: result.subscriptionReferenceCode ?? null,
  };
}
