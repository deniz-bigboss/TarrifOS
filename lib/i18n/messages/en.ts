/**
 * English message dictionary — the source of truth. Every other locale
 * implements this same `Messages` shape, so missing keys are a type error.
 */
export const en = {
  nav: {
    workflow: "Workflow",
    customers: "Customers",
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up free",
  },
  hero: {
    badge: "AI shipping operations agent",
    description:
      "An AI-assisted workspace for importers and exporters that turns product facts into HS recommendations, document checklists, compliance checkpoints, cost-saving actions, and shipment execution plans.",
    ctaPrimary: "Create shipment plan",
    ctaSecondary: "View pricing",
  },
  problem: {
    badge: "Problem",
    heading:
      "Product-level customs work is still trapped in email, spreadsheets, and brittle lookups.",
    cards: [
      {
        title: "Classification uncertainty",
        body: "Product titles rarely map cleanly to an HS code. TariffOS grounds every recommendation in evidence, confidence scores, and review gates.",
      },
      {
        title: "Missing documents",
        body: "Certificates and origin proofs usually surface at the border. TariffOS builds the document checklist before you book, not after.",
      },
      {
        title: "Late landed-cost surprises",
        body: "Duty, VAT, and fees tend to appear after the deal is priced. TariffOS estimates them up front and suggests legitimate cost levers.",
      },
    ],
  },
  workflow: {
    badge: "How it works",
    steps: [
      "Normalize product and trade-lane data",
      "Retrieve candidate HS codes with evidence",
      "Generate document and compliance gates",
      "Produce cost actions and a shipment plan",
    ],
  },
  customers: {
    badge: "Who it is for",
    heading: "Built for repeat-SKU trade on any lane, anywhere in the world.",
    rows: [
      "Shopify and e-commerce importers",
      "Small importers/exporters",
      "Freight forwarders handling repeat SKUs",
      "Customs brokers doing pre-classification",
    ],
  },
  example: {
    badge: "Example output",
    heading: "Shipment execution plans, not chatbot transcripts.",
    body: "Every result includes candidate codes, confidence, missing information, required documents, warnings, next actions, compliance gates, and cost-reduction levers.",
    readiness: "Shipment readiness",
    ready: "ready with review",
    actions: ["Confirm HS code", "Collect origin proof", "Compare freight quotes"],
    planText:
      "Agent plan for a cotton t-shirt shipment: use 6109.10 as the working classification, collect the invoice and origin evidence, validate value basis, and benchmark carrier options before booking.",
  },
  pricingPreview: {
    badge: "Pricing preview",
    heading: "Start narrow, scale to API volume.",
    plans: {
      free: "Try TariffOS with manual classifications.",
      starter: "For small importers shipping repeat SKUs.",
      growth: "For scaling brands and teams that need the API.",
    },
  },
  disclaimer:
    "Compliance disclaimer: TariffOS outputs are recommendations generated from available product information and tariff data. They are not legal advice. Final classification, duty treatment, and customs declarations should be confirmed by a qualified customs broker or customs authority.",
  footer: {
    tagline:
      "TariffOS provides classification recommendations generated from product information and tariff data. It is not legal advice. Final classification and duty treatment must be confirmed by a qualified customs broker or customs authority.",
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to your TariffOS workspace.",
    signupTitle: "Create your workspace",
    signupSubtitle:
      "Build your first shipment plan in minutes. A workspace is created automatically — no credit card required.",
    fullName: "Full name",
    email: "Work email",
    password: "Password",
    createAccount: "Create account",
    login: "Log in",
    haveAccount: "Already have an account?",
    noAccount: "New to TariffOS?",
    checkEmail: "Check your email to confirm your account, then log in.",
  },
  language: "Language",
};

export type Messages = typeof en;
