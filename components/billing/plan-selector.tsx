"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import {
  changePlanAction,
  cancelIyzicoSubscriptionAction,
  openBillingPortalAction,
} from "@/app/dashboard/billing/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import type { PlanId } from "@/types/database";
import type { PaymentProvider } from "@/lib/billing/payment";

export function PlanSelector({
  currentPlan,
  provider,
  hasBillingAccount,
}: {
  currentPlan: PlanId;
  provider: PaymentProvider;
  hasBillingAccount: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(planId: PlanId) {
    setError(null);

    // iyzico: card capture happens on a dedicated checkout page.
    if (provider === "iyzico") {
      if (planId === "free") {
        setPending(planId);
        const res = await cancelIyzicoSubscriptionAction();
        setPending(null);
        if (!res.ok) return setError(res.error);
        router.refresh();
        return;
      }
      if (planId === "enterprise") {
        setError("Enterprise is sales-led — contact us and we'll set it up.");
        return;
      }
      router.push(`/dashboard/billing/checkout?plan=${planId}`);
      return;
    }

    // stripe / mock: the action returns a redirect URL or applies directly.
    setPending(planId);
    const res = await changePlanAction(planId);
    if (!res.ok) {
      setError(res.error);
      setPending(null);
      return;
    }
    if (res.data.checkoutUrl) {
      window.location.assign(res.data.checkoutUrl);
      return;
    }
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
      {provider === "stripe" && hasBillingAccount && (
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
