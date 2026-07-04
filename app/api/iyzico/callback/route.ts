import { NextResponse } from "next/server";
import {
  getIyzico,
  isIyzicoConfigured,
  iyzicoCall,
  planFromPricingPlanRef,
} from "@/lib/billing/iyzico";
import {
  interpretIyzicoResult,
  type IyzicoResult,
} from "@/lib/billing/iyzico-callback";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";

export const dynamic = "force-dynamic";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * iyzico posts the checkout-form token here after payment. We retrieve the
 * subscription result server-side (the token is meaningless to a client),
 * verify it succeeded, and apply the plan via the service-role client (the
 * callback carries no user session). Then we redirect the browser back to the
 * billing page with a status.
 */
export async function POST(request: Request) {
  const back = (status: string) =>
    NextResponse.redirect(`${siteUrl()}/dashboard/billing?checkout=${status}`, 303);

  if (!isIyzicoConfigured() || !isAdminConfigured()) {
    return back("error");
  }

  let token: string | null = null;
  try {
    const form = await request.formData();
    token = (form.get("token") as string) || null;
  } catch {
    token = null;
  }
  if (!token) return back("error");

  try {
    const iyzico = getIyzico();
    const result = (await iyzicoCall(
      iyzico.subscriptionCheckoutForm.retrieve.bind(iyzico.subscriptionCheckoutForm),
      { locale: "tr", checkoutFormToken: token },
    )) as IyzicoResult;

    const interp = interpretIyzicoResult(result, planFromPricingPlanRef);
    if (!interp.ok || !interp.organizationId || !interp.plan) {
      return back("failed");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({
        plan: interp.plan,
        iyzico_subscription_reference: interp.subscriptionReferenceCode,
      })
      .eq("id", interp.organizationId);
    if (error) return back("error");

    await admin.from("billing_events").insert({
      organization_id: interp.organizationId,
      plan: interp.plan,
      status: "iyzico_active",
    });

    return back("success");
  } catch {
    return back("error");
  }
}
