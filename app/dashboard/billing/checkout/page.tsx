import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/billing/payment";
import { IYZICO_PLANS } from "@/lib/billing/iyzico";
import { PLANS } from "@/lib/billing/plans";
import { IyzicoCheckout } from "@/components/billing/iyzico-checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanId } from "@/types/database";

export const metadata = { title: "Checkout — TariffOS" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login?redirect=/dashboard/billing");

  const planId = searchParams?.plan as PlanId | undefined;
  // Only iyzico uses this page; other providers redirect straight to their host.
  if (
    getPaymentProvider() !== "iyzico" ||
    !planId ||
    !PLANS[planId] ||
    !IYZICO_PLANS.includes(planId)
  ) {
    redirect("/dashboard/billing");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Billing & plans
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Subscribe to {PLANS[planId].name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IyzicoCheckout planId={planId} />
        </CardContent>
      </Card>
    </div>
  );
}
