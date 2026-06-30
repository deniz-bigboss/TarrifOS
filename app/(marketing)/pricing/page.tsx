import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { DisclaimerBanner } from "@/components/disclaimer";
import { API_USAGE_PRICING } from "@/lib/billing/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing — TariffOS",
};

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Start free and scale as your classification volume grows. API access is
          included from the Growth plan upward.
        </p>
      </div>

      <div className="mt-14">
        <PricingCards />
      </div>

      <Card className="mx-auto mt-12 max-w-3xl">
        <CardHeader>
          <CardTitle>Usage-based API pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{API_USAGE_PRICING}</p>
          <p>
            Each <code className="rounded bg-muted px-1">POST /api/v1/classify</code>{" "}
            call counts as one classification toward your plan and is recorded as
            a usage event for metering. Volume and enrichment-level discounts are
            available on Forwarder and Enterprise plans.
          </p>
        </CardContent>
      </Card>

      <div className="mx-auto mt-12 max-w-4xl">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
