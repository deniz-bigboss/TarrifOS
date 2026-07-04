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
  legal: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    lastUpdated: "Last updated",
    authoritativeNote:
      "This document is provided in English. The English version is the authoritative text; translations of the interface do not modify it.",
    consentPrefix: "By creating an account, you agree to the",
    and: "and",
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
  pricing: {
    badge: "Pricing",
    title: "Start free, scale to API volume.",
    subtitle:
      "Every plan produces the same shipment plans, document checklists, and broker-ready reports — upgrade for volume, team seats, and the API.",
    mostPopular: "Most popular",
    perMonth: "/month",
    starting: "starting",
    meteringBadge: "API metering",
    meteringTitle: "Usage-based API pricing.",
    meteringBody:
      "$0.20–$2.00 per classification depending on volume and enrichment level. Volume and enrichment-level discounts are available on Forwarder and Enterprise plans.",
    howItWorks: "How metering works",
    notePre: "Each",
    notePost:
      "call counts as one classification toward your plan and is recorded as a usage event for metering.",
    tiles: [
      "1 API call = 1 classification",
      "Volume discounts at scale",
      "Priced by enrichment level",
    ],
    plans: {
      free: {
        desc: "Try TariffOS with manual classifications.",
        cta: "Start free",
        features: [
          "10 classifications / month",
          "Manual entry only",
          "Basic export (Markdown / JSON)",
          "Single user",
        ],
      },
      starter: {
        desc: "For small importers shipping repeat SKUs.",
        cta: "Choose Starter",
        features: [
          "100 classifications / month",
          "Classification history",
          "Export reports",
          "Basic email support",
        ],
      },
      growth: {
        desc: "For scaling brands and teams that need the API.",
        cta: "Choose Growth",
        features: [
          "1,000 classifications / month",
          "API access",
          "Document uploads",
          "Team workspace",
          "Feedback & learning loop",
        ],
      },
      forwarder: {
        desc: "For freight forwarders and brokers at volume.",
        cta: "Talk to sales",
        features: [
          "5,000+ classifications / month",
          "API access",
          "Custom workflows",
          "Priority review queue",
          "Onboarding support",
        ],
      },
      enterprise: {
        desc: "For organizations with custom data and compliance needs.",
        cta: "Contact us",
        features: [
          "Custom tariff-data adapters",
          "SSO & audit logs",
          "SLA & dedicated support",
          "Custom volume",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Shipping operations agent",
      newPlan: "New shipment plan",
      nav: {
        dashboard: "Dashboard",
        plans: "Shipment plans",
        apiKeys: "API keys",
        billing: "Plans",
      },
    },
    topbar: {
      plan: "plan",
      upgrade: "Upgrade",
      signOut: "Sign out",
    },
    plansTitle: "Shipment plans",
    plansSubtitle: "Every classification your workspace has run.",
    wizard: {
      newTitle: "New classification",
      newSubtitle:
        "Enter product details to get a recommended tariff code with evidence, confidence, and a broker-ready report.",
      steps: ["Product", "Trade lane", "Documents", "Review"] as [
        string,
        string,
        string,
        string,
      ],
      prefill: "Prefill a demo:",
      demoTshirt: "Cotton t-shirt",
      demoBattery: "E-bike battery",
      quickFind: "Quick Find",
      quickFindPlaceholder: "e.g. S-Works Tarmac SL9",
      quickFindHelp:
        "Type a brand + model and we'll fill in the description, material, use, category, brand, model and unit weight.",
      quickFindConfirm:
        "The fields below are now editable (unit weight, on the next step, is pre-filled too) — review them, fix anything wrong, then confirm before continuing.",
      quickFindNudge: "Please confirm the details are correct before continuing.",
      optional: "(optional)",
      select: "Select…",
      fields: {
        productName: "Product name",
        productDescription: "Product description",
        material: "Material / composition",
        intendedUse: "Intended use",
        category: "Category",
        brand: "Brand",
        sku: "Model / SKU",
        originCountry: "Origin country",
        destinationCountry: "Destination country",
        supplierCountry: "Supplier country",
        shippingMethod: "Shipping method",
        declaredValue: "Declared value",
        currency: "Currency",
        quantity: "Quantity",
        unitWeight: "Unit weight (kg)",
      },
      supplierHint:
        "Where you buy or ship from — set it only if different from the origin (manufacturing) country. A mismatch adds an origin-evidence checkpoint to your plan.",
      roadUnavailable:
        "Road is unavailable for this lane — there is no land route between these countries.",
      methods: {
        sea: "Sea freight",
        air: "Air freight",
        road: "Road",
        roadNoRoute: "Road (no land route)",
        courier: "Courier / parcel",
      },
      documentsIntro:
        "Optionally attach supporting documents (commercial invoice, packing list, supplier spec sheet, product catalog). For now we capture file metadata — full extraction is a placeholder and won't change the classification yet.",
      clickToSelect: "Click to select files",
      fileTypes: "PDF, text, images",
      reviewTitle: "Review & classify",
      reviewProduct: "Product",
      reviewTradeLane: "Trade lane",
      reviewDocuments: "Documents attached",
      reviewNote:
        "We'll normalize the description, retrieve candidate codes, reason over them, and produce a broker-ready report with a confidence score. High-risk or low-confidence items are flagged for review.",
      back: "Back",
      continue: "Continue",
      classify: "Classify product",
    },
  },
};

export type Messages = typeof en;
