import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { getI18n } from "@/lib/i18n/server";
import type { PlanId } from "@/types/database";

/** Localized cadence: prices stay universal, "/month" text follows the locale. */
function cadenceFor(
  planId: PlanId,
  t: { perMonth: string; starting: string },
): string {
  if (planId === "enterprise") return "";
  if (planId === "forwarder") return `${t.perMonth} ${t.starting}`;
  return t.perMonth;
}

export function PricingCards({ compact = false }: { compact?: boolean }) {
  const { t } = getI18n();
  const plans = PLAN_ORDER.map((id) => PLANS[id]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {plans.map((plan) => {
        const copy = t.pricing.plans[plan.id];
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-slate-900",
              plan.highlight && "card-shadow border-emerald-300 ring-1 ring-emerald-200",
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {plan.name}
                </h3>
                {plan.highlight && (
                  <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {t.pricing.mostPopular}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {plan.price}
                </span>
                {cadenceFor(plan.id, t.pricing) && (
                  <span className="text-sm text-slate-500">
                    {cadenceFor(plan.id, t.pricing)}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{copy.desc}</p>
            </div>
            <div className="mt-6 flex flex-1 flex-col justify-between gap-6">
              <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                {copy.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {!compact && (
                <Link
                  href="/signup"
                  className={cn(
                    "inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors",
                    plan.highlight
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "border border-border bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  {copy.cta}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
