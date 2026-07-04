import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured, planFromPriceId } from "@/lib/billing/stripe";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import { applyStripeEvent } from "@/lib/billing/webhook-handler";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook endpoint.
 *
 * Verifies the signature against STRIPE_WEBHOOK_SECRET (raw body — never
 * parse before verifying), then applies subscription lifecycle events to the
 * organization's plan via the service-role client (webhooks carry no user
 * session). Always returns 200 for events we simply don't care about, so
 * Stripe doesn't retry them forever.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "supabase admin not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await applyStripeEvent(event, {
    planFromPriceId,
    updateOrg: async (match, fields) => {
      const query = admin.from("organizations").update(fields);
      const { error } =
        "organizationId" in match
          ? await query.eq("id", match.organizationId)
          : await query.eq("stripe_customer_id", match.stripeCustomerId);
      if (error) throw new Error(error.message);
    },
    recordBillingEvent: async (organizationId, plan, status) => {
      await admin.from("billing_events").insert({
        organization_id: organizationId,
        plan,
        status,
      });
    },
  });

  return NextResponse.json(result);
}
