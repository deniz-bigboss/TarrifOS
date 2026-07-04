import type Stripe from "stripe";
import type { PlanId } from "@/types/database";

/**
 * Pure Stripe-event → plan-change logic, extracted from the webhook route so
 * it can be unit-tested offline against fixture events. All persistence goes
 * through the injected callbacks.
 */

export type OrgMatch =
  | { organizationId: string }
  | { stripeCustomerId: string };

export interface WebhookDeps {
  planFromPriceId: (priceId: string | null | undefined) => PlanId | null;
  updateOrg: (
    match: OrgMatch,
    fields: {
      plan?: PlanId;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
    },
  ) => Promise<void>;
  recordBillingEvent: (
    organizationId: string | null,
    plan: PlanId | null,
    status: string,
  ) => Promise<void>;
}

export interface WebhookResult {
  received: true;
  handled: boolean;
  action?: string;
}

function firstPriceId(sub: Stripe.Subscription): string | null {
  return sub.items?.data?.[0]?.price?.id ?? null;
}

function customerId(c: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!c) return null;
  return typeof c === "string" ? c : c.id;
}

export async function applyStripeEvent(
  event: Stripe.Event,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  switch (event.type) {
    // Checkout finished: the buyer's org id travels in the session metadata
    // (set when we created the session), the customer id links future events.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organization_id ?? null;
      const plan = (session.metadata?.plan_id as PlanId | undefined) ?? null;
      const customer = customerId(session.customer);
      if (!orgId || !plan) return { received: true, handled: false };

      await deps.updateOrg(
        { organizationId: orgId },
        {
          plan,
          stripe_customer_id: customer,
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null,
        },
      );
      await deps.recordBillingEvent(orgId, plan, "checkout_completed");
      return { received: true, handled: true, action: `plan → ${plan}` };
    }

    // Plan changed in the customer portal (upgrade/downgrade between paid
    // plans) — resolve the plan from the subscription's price.
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = customerId(sub.customer);
      if (!customer) return { received: true, handled: false };

      // A subscription heading for cancellation keeps its plan until it
      // actually ends; the deleted event handles the downgrade.
      if (sub.status === "canceled") return { received: true, handled: false };

      const plan = deps.planFromPriceId(firstPriceId(sub));
      if (!plan) return { received: true, handled: false };

      await deps.updateOrg(
        { stripeCustomerId: customer },
        { plan, stripe_subscription_id: sub.id },
      );
      await deps.recordBillingEvent(null, plan, "subscription_updated");
      return { received: true, handled: true, action: `plan → ${plan}` };
    }

    // Subscription ended (canceled, payment failure exhausted retries…):
    // drop the org back to the free plan.
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = customerId(sub.customer);
      if (!customer) return { received: true, handled: false };

      await deps.updateOrg(
        { stripeCustomerId: customer },
        { plan: "free", stripe_subscription_id: null },
      );
      await deps.recordBillingEvent(null, "free", "subscription_deleted");
      return { received: true, handled: true, action: "plan → free" };
    }

    default:
      return { received: true, handled: false };
  }
}
