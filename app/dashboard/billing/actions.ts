"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { PLANS } from "@/lib/billing/plans";
import { getPaymentProvider } from "@/lib/billing/payment";
import { getStripe, priceIdForPlan } from "@/lib/billing/stripe";
import {
  IYZICO_PLANS,
  getIyzico,
  iyzicoCall,
  pricingPlanRefForPlan,
} from "@/lib/billing/iyzico";
import { encodeConversationId } from "@/lib/billing/iyzico-callback";
import type { PlanId } from "@/types/database";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/** Billing details iyzico requires for a subscription checkout. */
export interface BillingDetails {
  name: string;
  surname: string;
  gsmNumber: string;
  identityNumber: string;
  city: string;
  country: string;
  address: string;
}

export type CheckoutOutcome = {
  plan?: PlanId;
  /** Stripe hosted checkout redirect. */
  checkoutUrl?: string;
  /** iyzico embedded form: HTML/JS to inject, plus whether details are needed. */
  iyzicoFormContent?: string;
  needsBillingDetails?: boolean;
};

/**
 * Plan change entry point. Routes by the active payment provider:
 *   iyzico -> initialize a subscription checkout form (returns embed content)
 *   stripe -> hosted Checkout session (returns redirect URL)
 *   mock   -> apply the plan directly (demo/local)
 */
export async function changePlanAction(
  planId: PlanId,
  billing?: BillingDetails,
): Promise<ActionResult<CheckoutOutcome>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (!PLANS[planId]) return { ok: false, error: "Unknown plan." };

  const provider = getPaymentProvider();

  if (planId === "enterprise" && provider !== "mock") {
    return {
      ok: false,
      error: "Enterprise is sales-led — contact us and we'll set it up.",
    };
  }

  if (provider === "iyzico") {
    return startIyzicoCheckout(session, planId, billing);
  }
  if (provider === "stripe") {
    return startStripeCheckout(session, planId);
  }
  return applyMockPlan(session.organization.id, planId);
}

// ---------------------------------------------------------------- iyzico
async function startIyzicoCheckout(
  session: NonNullable<Awaited<ReturnType<typeof getSessionContext>>>,
  planId: PlanId,
  billing?: BillingDetails,
): Promise<ActionResult<CheckoutOutcome>> {
  if (planId === "free") {
    return {
      ok: false,
      error: "To downgrade to Free, cancel your subscription (Manage billing).",
    };
  }
  if (!IYZICO_PLANS.includes(planId)) {
    return { ok: false, error: "This plan can't be purchased online." };
  }
  const ref = pricingPlanRefForPlan(planId);
  if (!ref) {
    return {
      ok: false,
      error: `No iyzico pricing plan is configured for ${PLANS[planId].name} (set IYZICO_PLAN_${planId.toUpperCase()}).`,
    };
  }
  if (!billing) {
    // The UI collects these once, then re-calls with them.
    return { ok: true, data: { needsBillingDetails: true } };
  }

  try {
    const iyzico = getIyzico();
    const result = await iyzicoCall(
      iyzico.subscriptionCheckoutForm.initialize.bind(iyzico.subscriptionCheckoutForm),
      {
        locale: "tr",
        conversationId: encodeConversationId(session.organization.id, planId),
        pricingPlanReferenceCode: ref,
        subscriptionInitialStatus: "ACTIVE",
        callbackUrl: `${siteUrl()}/api/iyzico/callback`,
        customer: {
          name: billing.name,
          surname: billing.surname,
          email: session.user.email ?? "",
          gsmNumber: billing.gsmNumber,
          identityNumber: billing.identityNumber,
          billingAddress: {
            contactName: `${billing.name} ${billing.surname}`.trim(),
            city: billing.city,
            country: billing.country || "Türkiye",
            address: billing.address,
          },
          shippingAddress: {
            contactName: `${billing.name} ${billing.surname}`.trim(),
            city: billing.city,
            country: billing.country || "Türkiye",
            address: billing.address,
          },
        },
      },
    );

    const status = (result as { status?: string }).status;
    const content = (result as { checkoutFormContent?: string }).checkoutFormContent;
    if (status !== "success" || !content) {
      const msg = (result as { errorMessage?: string }).errorMessage;
      return { ok: false, error: msg || "iyzico did not return a checkout form." };
    }
    return { ok: true, data: { iyzicoFormContent: content } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "iyzico checkout failed.",
    };
  }
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
 * Cancels the active iyzico subscription (used for downgrade to Free). Stripe
 * cancellation is handled by its customer portal.
 */
export async function cancelIyzicoSubscriptionAction(): Promise<ActionResult<null>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (getPaymentProvider() !== "iyzico") {
    return { ok: false, error: "iyzico is not the active provider." };
  }

  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("iyzico_subscription_reference")
    .eq("id", session.organization.id)
    .single();
  const ref = org?.iyzico_subscription_reference as string | null;
  if (!ref) return { ok: false, error: "No active subscription to cancel." };

  try {
    const iyzico = getIyzico();
    await iyzicoCall(
      iyzico.subscription.cancel.bind(iyzico.subscription),
      { locale: "tr", subscriptionReferenceCode: ref },
    );
    await supabase
      .from("organizations")
      .update({ plan: "free", iyzico_subscription_reference: null })
      .eq("id", session.organization.id);
    await supabase.from("billing_events").insert({
      organization_id: session.organization.id,
      plan: "free",
      status: "iyzico_cancelled",
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

/** Opens the Stripe customer portal (EU / future). */
export async function openBillingPortalAction(): Promise<
  ActionResult<{ portalUrl: string }>
> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (getPaymentProvider() !== "stripe") {
    return { ok: false, error: "The Stripe portal is not active." };
  }

  const supabase = createClient();
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
