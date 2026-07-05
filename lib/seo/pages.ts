/**
 * Long-tail SEO page content. Every page speaks in HS-code *families* and
 * customs-readiness language — candidates and checklists, never guarantees.
 * One data map renders through three dynamic routes:
 *   /hs-code/[slug], /customs-documents/[slug], /customs-readiness/[slug]
 */

export type SeoKind = "hs-code" | "customs-documents" | "customs-readiness";

export interface SeoPage {
  kind: SeoKind;
  slug: string;
  title: string;
  intro: string;
  exampleProduct: string;
  /** The honest "common HS-code family" note — never an official claim. */
  familyNote: string;
  requiredInfo: string[];
  commonMissing: string[];
  documents: string[];
}

export const SEO_PAGES: SeoPage[] = [
  {
    kind: "hs-code",
    slug: "cotton-tshirt",
    title: "HS code for a cotton t-shirt",
    intro:
      "Cotton t-shirts are one of the most classified products in e-commerce trade — and one of the easiest to get subtly wrong, because knitted and woven garments sit in different chapters.",
    exampleProduct: "Men's 100% cotton knitted short-sleeve t-shirt",
    familyNote:
      "Knitted or crocheted t-shirts commonly fall in the 6109 family (e.g. 6109.10 for cotton); woven shirts fall in chapter 62 instead. The exact subheading depends on knit vs woven construction, fiber composition, and the destination tariff — treat any code as a candidate to verify.",
    requiredInfo: [
      "Knitted or woven construction",
      "Exact fiber composition (% cotton vs blends)",
      "Men's/women's/unisex styling",
      "Country of origin and destination",
    ],
    commonMissing: [
      "Whether the fabric is knitted (6109) or woven (6205/6206)",
      "Blend percentages when not 100% cotton",
      "Printing/embellishment that doesn't change the code but confuses matching",
    ],
    documents: [
      "Commercial invoice",
      "Packing list",
      "Certificate of origin (for preferential duty)",
      "Fiber-composition declaration",
    ],
  },
  {
    kind: "hs-code",
    slug: "leather-wallet",
    title: "HS code for a leather wallet",
    intro:
      "Leather wallets and small leather goods classify by outer-surface material — leather, composition leather, or plastics/textile — which is exactly the detail most product listings omit.",
    exampleProduct: "Bifold wallet, outer surface of full-grain cow leather",
    familyNote:
      "Wallets and similar pocket articles commonly fall in the 4202.3x family (e.g. 4202.31 for an outer surface of leather or composition leather). The subheading shifts with the outer-surface material — verify against the destination tariff before use.",
    requiredInfo: [
      "Outer-surface material (leather vs composition leather vs plastic/textile)",
      "Animal species (exotic leathers can trigger CITES controls)",
      "Country of origin and destination",
    ],
    commonMissing: [
      "Whether 'leather' means genuine, composition, or PU imitation",
      "Species documentation for exotic leather",
    ],
    documents: [
      "Commercial invoice",
      "Material declaration",
      "Certificate of origin",
      "CITES permit (exotic species only)",
    ],
  },
  {
    kind: "hs-code",
    slug: "phone-case",
    title: "HS code for a phone case",
    intro:
      "Phone cases look trivial but split across chapters by material — plastic, silicone, leather, or textile — and destination authorities do check.",
    exampleProduct: "TPU (thermoplastic polyurethane) slim case for a smartphone",
    familyNote:
      "Plastic cases are commonly classified in the 3926.90 family, leather ones near 4202.3x, and some molded holsters under 8517 accessories interpretations vary by administration. Material and function decide it — treat any code as a candidate to verify.",
    requiredInfo: [
      "Primary material (TPU/PC plastic, silicone, leather, textile)",
      "Whether it's a case, a wallet-case, or a mount/holder",
      "Country of origin and destination",
    ],
    commonMissing: [
      "Exact plastic type for 'silicone-feel' cases",
      "Wallet features that pull it toward 4202",
    ],
    documents: ["Commercial invoice", "Material declaration", "Packing list"],
  },
  {
    kind: "hs-code",
    slug: "plastic-bottle",
    title: "HS code for a plastic bottle",
    intro:
      "Plastic bottles classify differently as empty packaging, household drinkware, or filled product — the same bottle can carry three different codes depending on what and how you ship.",
    exampleProduct: "Empty 500 ml PET water bottle, sold as reusable drinkware",
    familyNote:
      "Empty plastic bottles for conveyance/packing commonly fall in the 3923.30 family, while reusable household drinkware tends toward 3924.90. Filled bottles classify as their contents. The use and presentation decide the family — verify before filing.",
    requiredInfo: [
      "Empty packaging vs reusable drinkware vs filled product",
      "Plastic type (PET, HDPE, PP…)",
      "Capacity and closure type",
    ],
    commonMissing: [
      "Whether the bottle ships empty or filled",
      "Food-contact compliance statements for drinkware",
    ],
    documents: [
      "Commercial invoice",
      "Material declaration",
      "Food-contact compliance declaration (drinkware)",
    ],
  },
  {
    kind: "hs-code",
    slug: "wooden-chair",
    title: "HS code for a wooden chair",
    intro:
      "Wooden seating classifies in the furniture chapter, but upholstery, intended room, and knock-down shipping all change the picture — and wood species can trigger phytosanitary checks.",
    exampleProduct: "Solid oak dining chair, unupholstered, shipped assembled",
    familyNote:
      "Wooden seats commonly fall in the 9401.6x family (e.g. 9401.61 upholstered, 9401.69 not upholstered). Flat-pack parts may still classify as complete seats. Wood species matters for ISPM-15 and licensing — verify against the destination tariff.",
    requiredInfo: [
      "Upholstered or not",
      "Wood species",
      "Assembled or knock-down",
      "Country of origin and destination",
    ],
    commonMissing: [
      "Species documentation (Lacey Act / EUTR due diligence)",
      "ISPM-15 treatment of wooden packaging",
    ],
    documents: [
      "Commercial invoice",
      "Packing list",
      "Wood species / due-diligence declaration",
      "Certificate of origin",
    ],
  },
  {
    kind: "hs-code",
    slug: "lithium-battery",
    title: "HS code for a lithium battery",
    intro:
      "Lithium batteries are the classic high-risk classification: the code is only the start — dangerous-goods rules, test summaries, and shipping mode restrictions follow immediately.",
    exampleProduct: "Rechargeable lithium-ion battery pack, 36 V / 10 Ah, for e-bikes",
    familyNote:
      "Rechargeable lithium-ion accumulators commonly fall in the 8507.60 family. Batteries installed in equipment classify with the equipment; packed-with or shipped-alone batteries carry different dangerous-goods provisions (UN3480/UN3481). Always review before filing.",
    requiredInfo: [
      "Chemistry (Li-ion, LiFePO4, Li-metal…)",
      "Watt-hour rating and voltage",
      "Shipped alone, with equipment, or installed",
      "Country of origin and destination",
    ],
    commonMissing: [
      "UN38.3 test summary",
      "Watt-hour rating on the label",
      "State of charge limits for air freight",
    ],
    documents: [
      "Commercial invoice",
      "UN38.3 test summary",
      "Safety data sheet (SDS)",
      "Dangerous-goods declaration (mode-dependent)",
    ],
  },
  {
    kind: "customs-documents",
    slug: "eu-import-checklist",
    title: "EU import documents checklist",
    intro:
      "Importing into the EU means one customs union but 27 member-state practices. This checklist covers the documents nearly every EU import clearance asks for.",
    exampleProduct: "Consumer goods shipment from Türkiye to Germany",
    familyNote:
      "Document demands vary by product family (CE-marked goods, food, textiles) and by preferential-origin claims (e.g. EUR.1 / ATR for Türkiye–EU). Treat this as a readiness checklist, not legal advice.",
    requiredInfo: [
      "EORI number of the importer",
      "Commodity code candidate for each product",
      "Customs value basis (incoterm, freight, insurance)",
      "Preferential origin claim (yes/no)",
    ],
    commonMissing: [
      "Proof of preferential origin (ATR / EUR.1 / statement on origin)",
      "CE declaration of conformity for regulated goods",
      "Accurate customs value including assists and royalties",
    ],
    documents: [
      "Commercial invoice",
      "Packing list",
      "Transport document (B/L, CMR, AWB)",
      "Proof of origin (ATR, EUR.1, or invoice declaration)",
      "CE declaration of conformity (where applicable)",
      "Import declaration (lodged by you or your representative)",
    ],
  },
  {
    kind: "customs-documents",
    slug: "uk-import-checklist",
    title: "UK import documents checklist",
    intro:
      "Post-Brexit UK imports run through CDS with their own EORI, commodity-code, and origin-proof requirements. This is the baseline document set for a standard commercial import.",
    exampleProduct: "E-commerce goods shipment from China to the United Kingdom",
    familyNote:
      "Requirements shift by product family (UKCA-marked goods, food, plants) and by any preferential claim under UK trade agreements. Use it as a readiness checklist and verify against current GOV.UK guidance.",
    requiredInfo: [
      "GB EORI number",
      "Commodity code candidate per product (UK Integrated Tariff)",
      "Customs value and incoterm",
      "Whether postponed VAT accounting is used",
    ],
    commonMissing: [
      "Correct 10-digit commodity codes",
      "Proof of origin for preferential duty claims",
      "UKCA/CE conformity documentation for regulated goods",
    ],
    documents: [
      "Commercial invoice",
      "Packing list",
      "Transport document",
      "Proof of origin (where a preference is claimed)",
      "Import declaration via CDS (self-filed or via an agent)",
    ],
  },
  {
    kind: "customs-readiness",
    slug: "textiles",
    title: "Customs readiness for textiles",
    intro:
      "Textiles are classification-dense: knit vs woven, fiber blends, and gender styling all move the code. Getting readiness right up front prevents the most common re-classification disputes.",
    exampleProduct: "Women's 60% cotton / 40% polyester knitted hoodie",
    familyNote:
      "Knitted apparel lives in chapter 61 and woven in chapter 62, with fiber-composition breakpoints inside each heading. Codes here are candidates to review — composition percentages decide the final subheading.",
    requiredInfo: [
      "Knitted or woven construction",
      "Full fiber composition with percentages",
      "Garment type and gender styling",
      "Country of origin (yarn/fabric/assembly rules can differ)",
    ],
    commonMissing: [
      "Exact blend percentages",
      "Knit/woven statement on the invoice",
      "Origin evidence when preferential duty is claimed",
    ],
    documents: [
      "Commercial invoice with composition",
      "Packing list",
      "Certificate or statement of origin",
      "Labelling compliance info (destination-specific)",
    ],
  },
  {
    kind: "customs-readiness",
    slug: "cosmetics",
    title: "Customs readiness for cosmetics",
    intro:
      "Cosmetics clear customs on more than a code: ingredient lists, responsible-person registrations, and labelling rules decide whether the shipment actually enters commerce.",
    exampleProduct: "Vitamin C facial serum, 30 ml, retail packaging",
    familyNote:
      "Skin-care preparations commonly fall in the 3304.99 family, but any medical or therapeutic claim can push a product toward medicament territory with far heavier requirements. Codes are candidates — claims and ingredients decide.",
    requiredInfo: [
      "Full ingredient (INCI) list",
      "Product claims (cosmetic vs therapeutic)",
      "Responsible person / registration status in the destination",
      "Packaging and label details",
    ],
    commonMissing: [
      "Ingredient percentages for restricted substances",
      "Destination registration (e.g. EU CPNP) before shipping",
      "Claims wording that accidentally sounds medicinal",
    ],
    documents: [
      "Commercial invoice",
      "INCI ingredient list",
      "Safety assessment / product information file reference",
      "Certificate of origin",
    ],
  },
];

export function getSeoPage(kind: SeoKind, slug: string): SeoPage | undefined {
  return SEO_PAGES.find((p) => p.kind === kind && p.slug === slug);
}

export function seoSlugsFor(kind: SeoKind): string[] {
  return SEO_PAGES.filter((p) => p.kind === kind).map((p) => p.slug);
}
