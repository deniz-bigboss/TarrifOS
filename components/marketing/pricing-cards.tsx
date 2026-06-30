import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

export function PricingCards({ compact = false }: { compact?: boolean }) {
  const plans = PLAN_ORDER.map((id) => PLANS[id]);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "flex flex-col",
            plan.highlight && "border-primary shadow-md ring-1 ring-primary/20",
          )}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.highlight && <Badge>Most popular</Badge>}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
              {plan.cadence && (
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-6">
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {!compact && (
              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                className="w-full"
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
