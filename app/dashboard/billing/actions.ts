"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { PLANS } from "@/lib/billing/plans";
import { getPaymentProvider } from "@/lib/billing/payment";
import { getStripe, priceIdForPlan } from "@/lib/billing/stripe";
import {
  PADDLE_PLANS,
  cancelPaddleSubscription,
  createPaddlePortalSession,
  paddlePriceIdForPlan,
} from "@/lib/billing/paddle";
import { isPublicAccessSuspended } from "@/lib/site/access";
import type { PlanId } from "@/types/database";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export type CheckoutOutcome = {
  plan?: PlanId;
  /** Stripe hosted checkout redirect. */
  checkoutUrl?: string;
  /** Paddle overlay checkout: the client opens Paddle.js with these. */
  paddle?: {
    priceId: string;
    organizationId: string;
    email: string | null;
  };
};

/**
 * Plan change entry point. Routes by the active payment provider:
 *   paddle -> returns the price the client-side overlay checkout should open
 *   stripe -> hosted Checkout session (returns redirect URL)
 *   mock   -> apply the plan directly (demo/local)
 */
export async function changePlanAction(
  planId: PlanId,
): Promise<ActionResult<CheckoutOutcome>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (!PLANS[planId]) return { ok: false, error: "Unknown plan." };

  // No money changes hands while public access is suspended. Operators can
  // still reach this page through the access gate, so the block belongs here
  // too and not only in middleware. Downgrades and cancellations stay open —
  // never trap someone in a paid plan.
  if (isPublicAccessSuspended() && planId !== "free") {
    return {
      ok: false,
      error: "Kustaro isn't accepting new subscriptions at the moment.",
    };
  }

  const provider = getPaymentProvider();

  if (planId === "forwarder" && provider !== "mock") {
    return {
      ok: false,
      error: "Forwarder is sales-led — contact us and we'll set it up.",
    };
  }

  if (provider === "paddle") {
    return startPaddleCheckout(session, planId);
  }
  if (provider === "stripe") {
    return startStripeCheckout(session, planId);
  }
  return applyMockPlan(session.organization.id, planId);
}

// ---------------------------------------------------------------- paddle
async function startPaddleCheckout(
  session: NonNullable<Awaited<ReturnType<typeof getSessionContext>>>,
  planId: PlanId,
): Promise<ActionResult<CheckoutOutcome>> {
  if (planId === "free") {
    return {
      ok: false,
      error: "To downgrade to Free, cancel your subscription first.",
    };
  }
  if (!PADDLE_PLANS.includes(planId)) {
    return { ok: false, error: "This plan can't be purchased online." };
  }
  const priceId = paddlePriceIdForPlan(planId);
  if (!priceId) {
    return {
      ok: false,
      error: `No Paddle price is configured for ${PLANS[planId].name} (set PADDLE_PRICE_${planId.toUpperCase()}).`,
    };
  }
  // Card capture happens entirely inside Paddle's hosted overlay; we only
  // hand the client the price and the org id to round-trip via custom data.
  return {
    ok: true,
    data: {
      paddle: {
        priceId,
        organizationId: session.organization.id,
        email: session.user.email ?? null,
      },
    },
  };
}

// ---------------------------------------------------------------- stripe
async function startStripeCheckout(
  session: NonNullable<Awaited<ReturnType<typeof getSessionContext>>>,
  planId: PlanId,
): Promise<ActionResult<CheckoutOutcome>> {
  if (planId === "free") {
    return {
      ok: false,
      error:
        "To downgrade to Free, cancel your subscription in the billing portal (Manage billing).",
    };
  }
  const priceId = priceIdForPlan(planId);
  if (!priceId) {
    return {
      ok: false,
      error: `No Stripe price is configured for ${PLANS[planId].name} (set STRIPE_PRICE_${planId.toUpperCase()}).`,
    };
  }

  try {
    const stripe = getStripe();
    const supabase = createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", session.organization.id)
      .single();

    let customerId = org?.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: session.organization.name,
        metadata: { organization_id: session.organization.id },
      });
      customerId = customer.id;
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", session.organization.id);
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl()}/dashboard/billing?checkout=success`,
      cancel_url: `${siteUrl()}/dashboard/billing?checkout=cancelled`,
      metadata: { organization_id: session.organization.id, plan_id: planId },
      subscription_data: {
        metadata: { organization_id: session.organization.id },
      },
    });
    if (!checkout.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true, data: { checkoutUrl: checkout.url } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Stripe checkout failed.",
    };
  }
}

// ---------------------------------------------------------------- mock
async function applyMockPlan(
  organizationId: string,
  planId: PlanId,
): Promise<ActionResult<CheckoutOutcome>> {
  const supabase = createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ plan: planId })
    .eq("id", organizationId);
  if (error) {
    return { ok: false, error: `Failed to change plan: ${error.message}` };
  }
  await supabase.from("billing_events").insert({
    organization_id: organizationId,
    plan: planId,
    status: "mock_active",
  });
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return { ok: true, data: { plan: planId } };
}

/**
 * Cancels the active Paddle subscription immediately (used for downgrade to
 * Free). The webhook also reports the cancellation; applying it here too just
 * makes the UI reflect it without waiting.
 */
export async function cancelSubscriptionAction(): Promise<ActionResult<null>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (getPaymentProvider() !== "paddle") {
    return { ok: false, error: "Cancel your subscription via Manage billing." };
  }

  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("paddle_subscription_id")
    .eq("id", session.organization.id)
    .single();
  const subscriptionId = org?.paddle_subscription_id as string | null;
  if (!subscriptionId) {
    return { ok: false, error: "No active subscription to cancel." };
  }

  try {
    await cancelPaddleSubscription(subscriptionId);
    await supabase
      .from("organizations")
      .update({ plan: "free", paddle_subscription_id: null })
      .eq("id", session.organization.id);
    await supabase.from("billing_events").insert({
      organization_id: session.organization.id,
      plan: "free",
      status: "paddle_cancelled",
    });
    revalidatePath("/dashboard/billing");
    return { ok: true, data: null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not cancel.",
    };
  }
}

/**
 * Opens the provider's customer portal: Paddle's hosted portal (invoices,
 * card updates, cancellation) or Stripe's billing portal (EU / future).
 */
export async function openBillingPortalAction(): Promise<
  ActionResult<{ portalUrl: string }>
> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  const provider = getPaymentProvider();

  const supabase = createClient();

  if (provider === "paddle") {
    const { data: org } = await supabase
      .from("organizations")
      .select("paddle_customer_id, paddle_subscription_id")
      .eq("id", session.organization.id)
      .single();
    const customerId = org?.paddle_customer_id as string | null;
    if (!customerId) {
      return { ok: false, error: "No billing account yet — subscribe first." };
    }
    try {
      const subscriptionId = org?.paddle_subscription_id as string | null;
      const portalUrl = await createPaddlePortalSession(
        customerId,
        subscriptionId ? [subscriptionId] : [],
      );
      return { ok: true, data: { portalUrl } };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Could not open the portal.",
      };
    }
  }

  if (provider !== "stripe") {
    return { ok: false, error: "No billing portal for the current provider." };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", session.organization.id)
    .single();
  const customerId = org?.stripe_customer_id as string | null;
  if (!customerId) {
    return { ok: false, error: "No billing account yet — subscribe first." };
  }

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl()}/dashboard/billing`,
    });
    return { ok: true, data: { portalUrl: portal.url } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not open the portal.",
    };
  }
}
