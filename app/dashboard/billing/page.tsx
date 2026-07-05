import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { getPlan, API_USAGE_PRICING } from "@/lib/billing/plans";
import { getPaymentProvider } from "@/lib/billing/payment";
import { PlanSelector } from "@/components/billing/plan-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanId } from "@/types/database";

export const metadata = { title: "Billing — Kustaro" };

const PROVIDER_LABEL: Record<string, string> = {
  paddle:
    "Payments are processed securely by Paddle, our merchant of record — Paddle handles cards, invoices, and VAT/sales tax worldwide.",
  stripe: "Manage your subscription — payments processed by Stripe.",
  mock: "Self-serve checkout is being set up — upgrades are activated manually for now (contact us from any plan button).",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { checkout?: string };
}) {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = createClient();
  const plan = getPlan(session.organization.plan);
  const limit = await checkClassificationLimit(
    supabase,
    session.organization.id,
    session.organization.plan,
  );

  const provider = getPaymentProvider();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id, paddle_customer_id")
    .eq("id", session.organization.id)
    .single();
  const hasBillingAccount =
    provider === "paddle"
      ? Boolean(org?.paddle_customer_id)
      : Boolean(org?.stripe_customer_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & plans</h1>
        <p className="text-sm text-muted-foreground">{PROVIDER_LABEL[provider]}</p>
      </div>

      {searchParams?.checkout === "success" && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Payment received — your plan updates as soon as the provider confirms
          the subscription. Refresh if you don&apos;t see it yet.
        </p>
      )}
      {(searchParams?.checkout === "cancelled" ||
        searchParams?.checkout === "failed" ||
        searchParams?.checkout === "error") && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {searchParams.checkout === "cancelled"
            ? "Checkout was cancelled — no charge was made."
            : "The payment could not be completed — no charge was made. Please try again."}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current usage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="text-lg font-semibold">{plan.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Classifications this month</p>
            <p className="text-lg font-semibold">
              {limit.used}
              {limit.limit != null && (
                <span className="text-muted-foreground"> / {limit.limit}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">API access</p>
            <p className="text-lg font-semibold">{plan.apiAccess ? "Enabled" : "—"}</p>
          </div>
        </CardContent>
      </Card>

      <PlanSelector
        currentPlan={session.organization.plan as PlanId}
        provider={provider}
        hasBillingAccount={hasBillingAccount}
        demoMode={process.env.PAYMENT_PROVIDER === "mock"}
      />

      <p className="text-sm text-muted-foreground">
        Usage-based API pricing: {API_USAGE_PRICING}
      </p>
    </div>
  );
}
