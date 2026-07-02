import type { ProductLookupResult } from "./types";

/**
 * A small set of well-known products for Quick Find. This is intentionally
 * curated (not generated) so a handful of common lookups — including the
 * canonical demo product — are instant, free, and identical across every
 * AIProvider, regardless of which model is configured. Real providers fall
 * back to a model call for anything not in this list.
 */
type CuratedResult = Omit<ProductLookupResult, "found" | "source">;

interface CuratedProduct {
  match: (queryLower: string) => boolean;
  /** Static result, or a template built from the query (for product FAMILIES
   *  like pet food where the name/weight vary but the customs-relevant
   *  description is the same honest generic). */
  result: CuratedResult | ((query: string) => CuratedResult);
}

/** Pull "1.5 kg" / "400g" style weights out of a product name, in kg. */
export function weightFromQuery(query: string): number | null {
  const kg = query.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kg) return Math.round(parseFloat(kg[1].replace(",", ".")) * 1000) / 1000;
  const g = query.match(/(\d+(?:[.,]\d+)?)\s*g(?:r|ram)?s?\b/i);
  if (g) return Math.round(parseFloat(g[1].replace(",", ".")) ) / 1000;
  return null;
}

const CURATED_PRODUCTS: CuratedProduct[] = [
  {
    // "tarmac" alone is UK English for asphalt — require bike-model context
    // (S-Works/Specialized branding or an SL-generation suffix) so someone
    // looking up road surfacing doesn't get a bicycle autofilled.
    match: (q) =>
      /(?:s-?works|specialized).*tarmac|tarmac.*(?:s-?works|specialized)|tarmac\s*sl\s*\d/.test(q),
    result: {
      product_name: "Specialized S-Works Tarmac SL9",
      product_description:
        "Complete carbon fiber road racing bicycle, aerodynamic design, for competitive road cycling.",
      material_composition: "Carbon fiber frame, aluminum alloy and steel components",
      intended_use: "road cycling",
      category: "sporting goods",
      brand: "Specialized",
      model: "S-Works Tarmac SL9",
      unit_weight_kg: 7,
    },
  },
  {
    match: (q) => /iphone\s?15\s?pro/.test(q),
    result: {
      product_name: "Apple iPhone 15 Pro",
      product_description:
        "Titanium-body smartphone with integrated cellular and Wi-Fi/Bluetooth radio modules, a lithium-ion battery, and a multi-lens camera system.",
      material_composition:
        "Titanium frame, glass front/back, lithium-ion battery, electronic components",
      intended_use: "personal mobile communication device",
      category: "electronics",
      brand: "Apple",
      model: "iPhone 15 Pro",
      unit_weight_kg: 0.187,
    },
  },
  {
    match: (q) => q.includes("galaxy s25 ultra") || q.includes("s25 ultra"),
    result: {
      product_name: "Samsung Galaxy S25 Ultra 5G",
      product_description:
        "5G smartphone with integrated cellular and Wi-Fi/Bluetooth radio modules, a lithium-ion battery, multi-lens camera system, and titanium frame.",
      material_composition:
        "Titanium frame, glass front/back, lithium-ion battery, electronic components",
      intended_use: "personal mobile communication device",
      category: "electronics",
      brand: "Samsung",
      model: "Galaxy S25 Ultra 5G 256GB",
      unit_weight_kg: 0.218,
    },
  },
  {
    match: (q) => q.includes("aeron"),
    result: {
      product_name: "Herman Miller Aeron Chair",
      product_description:
        "Ergonomic office task chair with a tensioned mesh seat and back suspended in a polymer frame on an aluminum base.",
      material_composition: "Polymer frame, woven mesh, aluminum base, steel components",
      intended_use: "office seating",
      category: "furniture",
      brand: "Herman Miller",
      model: "Aeron",
      unit_weight_kg: 19,
    },
  },
  {
    match: (q) => q.includes("powercore") || (q.includes("anker") && q.includes("power")),
    result: {
      product_name: "Anker PowerCore 10000 Power Bank",
      product_description:
        "Compact portable power bank with an internal lithium-ion battery and USB output for charging mobile devices.",
      material_composition: "Lithium-ion cells, plastic housing, electronic circuitry",
      intended_use: "portable device charging",
      category: "batteries",
      brand: "Anker",
      model: "PowerCore 10000",
      unit_weight_kg: 0.18,
    },
  },
  {
    match: (q) => q.includes("yeti") && q.includes("rambler"),
    result: {
      product_name: "YETI Rambler 20 oz Tumbler",
      product_description:
        "Double-wall vacuum-insulated stainless steel drinking tumbler with a removable lid.",
      material_composition: "18/8 stainless steel",
      intended_use: "beverage container",
      category: "metal goods",
      brand: "YETI",
      model: "Rambler 20 oz",
      unit_weight_kg: 0.4,
    },
  },
  {
    match: (q) => q.includes("better sweater"),
    result: {
      product_name: "Patagonia Better Sweater 1/4-Zip Fleece",
      product_description:
        "Midweight fleece pullover with a sweater-knit face, made primarily from recycled polyester.",
      material_composition: "100% recycled polyester fleece",
      intended_use: "outerwear / casual apparel",
      category: "apparel",
      brand: "Patagonia",
      model: "Better Sweater 1/4-Zip",
      unit_weight_kg: 0.5,
    },
  },
  {
    // Product FAMILY: retail cat/dog food ("Purina Pro Plan Sterilised
    // Chicken Cat Food 1.5 Kg", "Royal Canin dog food 12kg", …). The
    // customs-relevant facts are the same across brands, so this echoes the
    // user's product name and fills an honest generic description — no
    // brand-specific specs are invented. Classifies to 2309.10 (high-risk,
    // SPS-controlled), which is exactly right for pet food.
    match: (q) =>
      /(cat|dog|pet)\s?food\b/.test(q) &&
      // "…cat food bowl/dispenser" is an accessory, not food — let the AI handle it.
      !/(bowl|dispenser|container|storage|mat|scoop|holder|feeder)/.test(q),
    result: (query) => {
      const q = query.toLowerCase();
      const animal = q.includes("cat") ? "cat" : q.includes("dog") ? "dog" : "pet";
      const form = /\bwet\b|pouch|can(?:ned)?\b/.test(q)
        ? "Wet"
        : /\bdry\b|kibble/.test(q)
          ? "Dry"
          : "Prepared";
      return {
        product_name: query.trim(),
        product_description: `${form} ${animal} food put up for retail sale.`,
        material_composition: null,
        intended_use: `${animal} food / animal feeding`,
        category: "food products",
        brand: null,
        model: null,
        unit_weight_kg: weightFromQuery(query),
      };
    },
  },
];

/** Look up a product against the curated list. Returns null if no match. */
export function findCuratedProduct(query: string): ProductLookupResult | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const match = CURATED_PRODUCTS.find((p) => p.match(q));
  if (!match) return null;
  const result =
    typeof match.result === "function" ? match.result(query) : match.result;
  return { found: true, source: "curated", ...result };
}
