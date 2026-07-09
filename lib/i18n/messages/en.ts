/**
 * English message dictionary — the source of truth. Every other locale
 * implements this same `Messages` shape, so missing keys are a type error.
 */
export const en = {
  nav: {
    workflow: "How it works",
    customers: "Who it's for",
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up free",
  },
  hero: {
    badge: "Self-serve customs-readiness workspace",
    headline: "Classify products for customs before they ship.",
    description:
      "Generate HS-code candidates, missing-information questions, document checklists, risk flags, and customs-readiness reports directly in your browser.",
    ctaPrimary: "Start free classification",
    ctaSecondary: "Upload SKU list",
    trust:
      "Built for importers, exporters, e-commerce brands, and freight teams handling repeat SKUs.",
  },
  compare: {
    badge: "Why Kustaro",
    heading: "Not just an HS-code guess.",
    genericTitle: "Generic AI tariff tools",
    kustaroTitle: "Kustaro",
    genericRows: [
      "One text box",
      "Returns a code",
      "No confidence improvement",
      "No saved SKU library",
      "No readiness workflow",
      "Weak export/reporting",
      "Hard to reuse for repeat products",
    ],
    kustaroRows: [
      "Guided classification wizard",
      "HS-code candidates with reasoning",
      "Missing-info questions to improve confidence",
      "Customs-readiness score",
      "Saved product/SKU library",
      "Exportable classification report",
      "Built for repeat-SKU workflows",
    ],
  },
  problem: {
    badge: "Problem",
    heading:
      "Product-level customs work is still trapped in email, spreadsheets, and brittle lookups.",
    cards: [
      {
        title: "Classification uncertainty",
        body: "Product titles rarely map cleanly to an HS code. Kustaro grounds every candidate in evidence, a confidence score, and review flags.",
      },
      {
        title: "Missing documents",
        body: "Certificates and origin proofs usually surface at the border. Kustaro builds the document checklist before you ship, not after.",
      },
      {
        title: "Unclear readiness",
        body: "Duty, risk, and missing information tend to appear after the deal is priced. Kustaro scores customs-readiness up front so you know what to fix.",
      },
    ],
  },
  workflow: {
    badge: "How it works",
    steps: [
      "Describe the product in the guided wizard",
      "Get HS-code candidates with reasoning and confidence",
      "Answer missing-info questions to improve confidence",
      "Export a customs-readiness report for review",
    ],
  },
  customers: {
    badge: "Who it is for",
    heading: "Built for repeat-SKU trade on any lane, anywhere in the world.",
    rows: [
      "Shopify and e-commerce importers",
      "Small importers/exporters",
      "Freight teams handling repeat SKUs",
      "Brokers doing pre-classification review",
    ],
  },
  example: {
    badge: "Example output",
    heading: "Customs-readiness reports, not chatbot transcripts.",
    body: "Every result includes HS-code candidates, a confidence score, missing-information questions, a required-document checklist, risk flags, and a customs-readiness score out of 100.",
    readiness: "Customs readiness",
    ready: "ready for review",
    actions: ["Confirm HS-code candidate", "Collect origin proof", "Answer 3 open questions"],
    planText:
      "Example for a cotton t-shirt: 6109.10 is the recommended candidate at 84% confidence; the certificate of origin is not confirmed and one alternative code remains plausible — readiness 78/100, with the open questions listed for review.",
  },
  pricingPreview: {
    badge: "Pricing preview",
    heading: "Start free, upgrade when the SKUs pile up.",
    plans: {
      free: "3 free classifications a month — no card required.",
      starter: "50 classifications with a saved SKU library and exports.",
      pro: "250 classifications, bulk upload beta, and full history.",
    },
  },
  disclaimer:
    "Compliance note: Kustaro outputs are customs-readiness recommendations generated from available product information and tariff-reference data. They are not legal advice and do not guarantee acceptance by customs authorities. Final classification and customs declarations should be verified before official use.",
  footer: {
    tagline:
      "Kustaro provides customs-readiness recommendations generated from product information and tariff-reference data. It is not legal advice and does not guarantee acceptance by customs authorities. Final classification and declarations should be verified before official use.",
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up",
  },
  legal: {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    refunds: "Refund Policy",
    lastUpdated: "Last updated",
    authoritativeNote:
      "This document is provided in English. The English version is the authoritative text; translations of the interface do not modify it.",
    consentPrefix: "By creating an account, you agree to the",
    and: "and",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to your Kustaro workspace.",
    signupTitle: "Create your workspace",
    signupSubtitle:
      "Classify your first product in minutes. A workspace is created automatically — no credit card required.",
    fullName: "Full name",
    email: "Work email",
    password: "Password",
    createAccount: "Create account",
    login: "Log in",
    haveAccount: "Already have an account?",
    noAccount: "New to Kustaro?",
    checkEmail: "Check your email to confirm your account, then log in.",
  },
  language: "Language",
  pricing: {
    badge: "Pricing",
    title: "Self-serve plans that scale with your SKUs.",
    subtitle:
      "Every plan produces the same HS-code candidates, readiness scores, and exportable reports — upgrade for volume, the SKU library, bulk upload, and team features.",
    mostPopular: "Most popular",
    perMonth: "/month",
    starting: "starting",
    meteringBadge: "API",
    meteringTitle: "Kustaro API — waitlist.",
    meteringBody:
      "The Kustaro API will let teams classify products, retrieve customs-readiness reports, and integrate HS-code candidate workflows into internal systems. Contact us for early access.",
    howItWorks: "How limits work",
    notePre: "Each",
    notePost:
      "classification counts as one credit toward your monthly plan limit and is recorded as a usage event.",
    tiles: [
      "1 product = 1 classification credit",
      "Limits reset monthly",
      "Old classifications stay viewable",
    ],
    plans: {
      free: {
        desc: "Try Kustaro on your first products.",
        cta: "Start free",
        features: [
          "3 classifications / month",
          "Guided classification wizard",
          "Customs-readiness score",
          "Basic export (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "For small importers with repeat SKUs.",
        cta: "Choose Starter",
        features: [
          "50 classifications / month",
          "Saved SKU library",
          "Classification history",
          "Export reports",
        ],
      },
      pro: {
        desc: "For growing brands classifying at volume.",
        cta: "Choose Pro",
        features: [
          "250 classifications / month",
          "Bulk upload (beta)",
          "PDF / CSV exports",
          "Classification history",
          "Saved SKU library",
        ],
      },
      business: {
        desc: "For teams that classify every shipment.",
        cta: "Choose Business",
        features: [
          "1,000 classifications / month",
          "Team workspace (early access)",
          "API access",
          "Priority limits",
          "Bulk upload (beta)",
        ],
      },
      forwarder: {
        desc: "For forwarders and brokers at custom volume.",
        cta: "Talk to us",
        features: [
          "Custom volume",
          "Team workspace (early access)",
          "API access",
          "Custom workflows",
          "Onboarding support",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Customs-readiness workspace",
      newPlan: "New classification",
      nav: {
        dashboard: "Dashboard",
        plans: "Classifications",
        products: "Products",
        bulkUpload: "Bulk upload",
        apiKeys: "API keys",
        billing: "Plans",
      },
    },
    topbar: {
      plan: "plan",
      upgrade: "Upgrade",
      signOut: "Sign out",
    },
    plansTitle: "Classifications",
    plansSubtitle: "Every classification your workspace has run.",
    wizard: {
      newTitle: "Classify a product",
      newSubtitle:
        "Guided details in, customs-readiness out: HS-code candidates with reasoning, a confidence score, open questions, document checklist, risk flags, and an exportable report.",
      steps: ["Product", "Facts", "Trade lane", "Documents", "Generate"] as [
        string,
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
        "The fields below are now editable (unit weight, on the trade-lane step, is pre-filled too) — review them, fix anything wrong, then confirm before continuing.",
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
        model: "Model",
        sku: "SKU",
        originCountry: "Origin country",
        destinationCountry: "Destination country",
        supplierCountry: "Supplier country",
        shippingMethod: "Shipping method",
        declaredValue: "Declared value",
        currency: "Currency",
        quantity: "Quantity",
        unitWeight: "Unit weight (kg)",
        invoiceText: "Invoice text (paste)",
        specText: "Product spec text (paste)",
        certificate: "A certificate of origin is available for this product",
      },
      factsIntro: "Which of these describe the product?",
      factsHint:
        "These flags route high-risk categories (batteries, food, cosmetics, chemicals, medical, dual-use…) to the right checks and documents.",
      flags: {
        is_textile: "Textile product",
        is_electronics: "Electronics",
        contains_battery: "Contains a battery",
        is_food: "Food product",
        is_cosmetic: "Cosmetic product",
        is_medical_or_health_related: "Medical / health-related",
        is_chemical: "Chemical product",
        is_dual_use_or_restricted: "Dual-use or restricted",
      },
      invoicePlaceholder: "Paste the commercial-invoice line items here (optional)…",
      specPlaceholder: "Paste the product spec or datasheet text here (optional)…",
      supplierHint:
        "Where you buy or ship from — set it only if different from the origin (manufacturing) country. A mismatch adds an origin-evidence checkpoint.",
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
        "Optionally paste invoice or spec text and note available certificates — they improve the readiness assessment. File upload captures metadata only for now (full extraction is coming).",
      clickToSelect: "Click to select files",
      fileTypes: "PDF, text, images",
      reviewTitle: "Review & generate",
      reviewProduct: "Product",
      reviewTradeLane: "Trade lane",
      reviewDocuments: "Documents attached",
      reviewFlags: "Product facts",
      reviewNote:
        "We'll normalize the description, retrieve candidate codes, reason over them, and produce a customs-readiness report with a confidence score. High-risk or low-confidence items are flagged for review.",
      confirmRecommendation:
        "I understand this result is a customs-readiness recommendation for review — not a final customs classification or legal advice.",
      confirmNudge: "Please confirm the recommendation-only note before generating.",
      back: "Back",
      continue: "Continue",
      classify: "Generate classification",
    },
  },
};

export type Messages = typeof en;
