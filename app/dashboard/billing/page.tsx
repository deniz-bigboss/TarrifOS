import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { getPlan, API_USAGE_PRICING } from "@/lib/billing/plans";
import { PlanSelector } from "@/components/billing/plan-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanId } from "@/types/database";

export const metadata = { title: "Billing — TariffOS" };

export default async function BillingPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = createClient();
  const plan = getPlan(session.organization.plan);
  const limit = await checkClassificationLimit(
    supabase,
    session.organization.id,
    session.organization.plan,
  );

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & plans</h1>
        <p className="text-sm text-muted-foreground">
          {stripeConfigured
            ? "Manage your subscription."
            : "Stripe is not configured — plan changes are applied directly (mock checkout)."}
        </p>
      </div>

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

      <PlanSelector currentPlan={session.organization.plan as PlanId} />

      <p className="text-sm text-muted-foreground">
        Usage-based API pricing: {API_USAGE_PRICING}
      </p>
    </div>
  );
}
