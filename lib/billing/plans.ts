import type { PlanId } from "@/types/database";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceValue: number | null; // null = custom
  cadence: string;
  /** Monthly classification limit. null = unlimited / custom. */
  monthlyLimit: number | null;
  apiAccess: boolean;
  highlight?: boolean;
  description: string;
  features: string[];
  cta: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    priceValue: 0,
    cadence: "/month",
    monthlyLimit: 10,
    apiAccess: false,
    description: "Try TariffOS with manual classifications.",
    features: [
      "10 classifications / month",
      "Manual entry only",
      "Basic export (Markdown / JSON)",
      "Single user",
    ],
    cta: "Start free",
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "$99",
    priceValue: 99,
    cadence: "/month",
    monthlyLimit: 100,
    apiAccess: false,
    description: "For small importers shipping repeat SKUs.",
    features: [
      "100 classifications / month",
      "Classification history",
      "Export reports",
      "Basic email support",
    ],
    cta: "Choose Starter",
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: "$499",
    priceValue: 499,
    cadence: "/month",
    monthlyLimit: 1000,
    apiAccess: true,
    highlight: true,
    description: "For scaling brands and teams that need the API.",
    features: [
      "1,000 classifications / month",
      "API access",
      "Document uploads",
      "Team workspace",
      "Feedback & learning loop",
    ],
    cta: "Choose Growth",
  },
  forwarder: {
    id: "forwarder",
    name: "Forwarder",
    price: "$1,500",
    priceValue: 1500,
    cadence: "/month starting",
    monthlyLimit: 5000,
    apiAccess: true,
    description: "For freight forwarders and brokers at volume.",
    features: [
      "5,000+ classifications / month",
      "API access",
      "Custom workflows",
      "Priority review queue",
      "Onboarding support",
    ],
    cta: "Talk to sales",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceValue: null,
    cadence: "",
    monthlyLimit: null,
    apiAccess: true,
    description: "For organizations with custom data and compliance needs.",
    features: [
      "Custom tariff-data adapters",
      "SSO & audit logs",
      "SLA & dedicated support",
      "Custom volume",
    ],
    cta: "Contact us",
  },
};

export const PLAN_ORDER: PlanId[] = [
  "free",
  "starter",
  "growth",
  "forwarder",
  "enterprise",
];

export function getPlan(planId: string | null | undefined): Plan {
  return PLANS[(planId as PlanId) ?? "free"] ?? PLANS.free;
}

/** Usage-based API pricing placeholder copy. */
export const API_USAGE_PRICING =
  "$0.20–$2.00 per classification depending on volume and enrichment level.";
