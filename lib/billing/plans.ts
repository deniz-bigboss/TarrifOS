import type { PlanId } from "@/types/database";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceValue: number | null; // null = custom
  cadence: string;
  /** Monthly classification limit. null = unlimited / custom. */
  monthlyLimit: number | null;
  /** Monthly report-translation limit (each machine translation = 1 AI call).
   *  null = unlimited / custom. Bounds AI cost independently of classifications. */
  monthlyTranslationLimit: number | null;
  apiAccess: boolean;
  highlight?: boolean;
  description: string;
  features: string[];
  cta: string;
}

/**
 * Kustaro self-serve credit plans. A "classification" is one credit; limits
 * reset each calendar month (see lib/billing/limits.ts).
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    priceValue: 0,
    cadence: "/month",
    monthlyLimit: 3,
    monthlyTranslationLimit: 5,
    apiAccess: false,
    description: "Try Kustaro on your first products.",
    features: [
      "3 classifications / month",
      "Guided classification wizard",
      "Customs-readiness score",
      "Basic export (Markdown / JSON)",
    ],
    cta: "Start free",
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "$19",
    priceValue: 19,
    cadence: "/month",
    monthlyLimit: 50,
    monthlyTranslationLimit: 50,
    apiAccess: false,
    description: "For small importers with repeat SKUs.",
    features: [
      "50 classifications / month",
      "Saved SKU library",
      "Classification history",
      "Export reports",
    ],
    cta: "Choose Starter",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$49",
    priceValue: 49,
    cadence: "/month",
    monthlyLimit: 250,
    monthlyTranslationLimit: 250,
    apiAccess: false,
    highlight: true,
    description: "For growing brands classifying at volume.",
    features: [
      "250 classifications / month",
      "Bulk upload (beta)",
      "PDF / CSV exports",
      "Classification history",
      "Saved SKU library",
    ],
    cta: "Choose Pro",
  },
  business: {
    id: "business",
    name: "Business",
    price: "$149",
    priceValue: 149,
    cadence: "/month",
    monthlyLimit: 1000,
    monthlyTranslationLimit: 1000,
    apiAccess: true,
    description: "For teams that classify every shipment.",
    features: [
      "1,000 classifications / month",
      "Team workspace (early access)",
      "API access",
      "Priority limits",
      "Bulk upload (beta)",
    ],
    cta: "Choose Business",
  },
  forwarder: {
    id: "forwarder",
    name: "Forwarder",
    price: "$499+",
    priceValue: null,
    cadence: "/month starting",
    monthlyLimit: null,
    monthlyTranslationLimit: null,
    apiAccess: true,
    description: "For forwarders and brokers at custom volume.",
    features: [
      "Custom volume",
      "Team workspace (early access)",
      "API access",
      "Custom workflows",
      "Onboarding support",
    ],
    cta: "Talk to us",
  },
};

export const PLAN_ORDER: PlanId[] = [
  "free",
  "starter",
  "pro",
  "business",
  "forwarder",
];

export function getPlan(planId: string | null | undefined): Plan {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

/** Contact for sales-led plans and manual/invoice payment while self-serve
 * billing is being configured. */
export const SALES_CONTACT_EMAIL = "support@kustaro.app";

/** Usage-based API pricing placeholder copy (API is waitlist/future). */
export const API_USAGE_PRICING =
  "The Kustaro API is in a private waitlist — contact us for early access.";
