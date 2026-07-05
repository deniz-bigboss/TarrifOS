"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import {
  changePlanAction,
  cancelSubscriptionAction,
  openBillingPortalAction,
} from "@/app/dashboard/billing/actions";
import { openPaddleCheckout } from "@/components/billing/paddle-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER, SALES_CONTACT_EMAIL } from "@/lib/billing/plans";
import type { PlanId } from "@/types/database";
import type { PaymentProvider } from "@/lib/billing/payment";

export function PlanSelector({
  currentPlan,
  provider,
  hasBillingAccount,
  demoMode = false,
}: {
  currentPlan: PlanId;
  provider: PaymentProvider;
  hasBillingAccount: boolean;
  /** True only when PAYMENT_PROVIDER=mock is set explicitly (local demo):
   * plan changes apply directly. When no provider is configured at all,
   * upgrades open the contact/manual-payment dialog instead. */
  demoMode?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contactPlan, setContactPlan] = useState<PlanId | null>(null);

  async function choose(planId: PlanId) {
    setError(null);

    // Billing not configured (and not an explicit local demo): self-serve
    // checkout isn't live yet, so upgrades go through contact/manual payment.
    if (provider === "mock" && !demoMode) {
      setContactPlan(planId);
      return;
    }

    // Paddle: downgrading to Free = cancel the subscription.
    if (provider === "paddle" && planId === "free") {
      setPending(planId);
      const res = await cancelSubscriptionAction();
      setPending(null);
      if (!res.ok) return setError(res.error);
      router.refresh();
      return;
    }

    setPending(planId);
    const res = await changePlanAction(planId);
    if (!res.ok) {
      setError(res.error);
      setPending(null);
      return;
    }
    // Paddle: card capture happens in Paddle's hosted overlay right here.
    if (res.data.paddle) {
      try {
        await openPaddleCheckout(res.data.paddle);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not open the checkout.",
        );
      }
      setPending(null);
      return;
    }
    // Stripe: hosted checkout redirect.
    if (res.data.checkoutUrl) {
      window.location.assign(res.data.checkoutUrl);
      return;
    }
    // Mock: the plan was applied directly.
    window.location.reload();
  }

  async function openPortal() {
    setPending("portal");
    setError(null);
    const res = await openBillingPortalAction();
    if (!res.ok) {
      setError(res.error);
      setPending(null);
      return;
    }
    window.location.assign(res.data.portalUrl);
  }

  return (
    <div className="space-y-4">
      {contactPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setContactPlan(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">
              Upgrade to {PLANS[contactPlan].name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Self-serve checkout is being set up. To upgrade now, email us and
              we&apos;ll activate the plan manually (invoice or bank transfer) —
              usually within a day.
            </p>
            <a
              href={`mailto:${SALES_CONTACT_EMAIL}?subject=Kustaro ${PLANS[contactPlan].name} plan`}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Email {SALES_CONTACT_EMAIL}
            </a>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => setContactPlan(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {provider !== "mock" && hasBillingAccount && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={pending !== null}
            onClick={openPortal}
          >
            {pending === "portal" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Manage billing
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          return (
            <Card
              key={id}
              className={cn(
                "flex flex-col",
                plan.highlight && "border-primary/40",
                isCurrent && "ring-2 ring-primary",
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.cadence && (
                    <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <ul className="space-y-1.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? "outline" : plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || pending !== null}
                  onClick={() => choose(id)}
                  className="w-full"
                >
                  {pending === id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : `Switch to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
