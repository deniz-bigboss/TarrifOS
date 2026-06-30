"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { PLANS } from "@/lib/billing/plans";
import type { PlanId } from "@/types/database";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

/**
 * Mock plan upgrade.
 *
 * Stripe is a placeholder for the MVP: if STRIPE_SECRET_KEY is set you would
 * create a Checkout session here and redirect. Without it, we update the
 * organization plan directly and record a billing_event so the rest of the app
 * (limits, API gating) reflects the change.
 */
export async function changePlanAction(
  planId: PlanId,
): Promise<ActionResult<{ plan: PlanId }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (!PLANS[planId]) return { ok: false, error: "Unknown plan." };

  // TODO: when STRIPE_SECRET_KEY is configured, create a Stripe Checkout
  // session and return its URL instead of mutating the plan directly.
  if (process.env.STRIPE_SECRET_KEY) {
    return {
      ok: false,
      error: "Stripe checkout is configured but not yet wired up in this MVP.",
    };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("organizations")
    .update({ plan: planId })
    .eq("id", session.organization.id);

  if (error) {
    return { ok: false, error: `Failed to change plan: ${error.message}` };
  }

  await supabase.from("billing_events").insert({
    organization_id: session.organization.id,
    plan: planId,
    status: "mock_active",
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return { ok: true, data: { plan: planId } };
}
