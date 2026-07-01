import type { ProductLookupResult } from "./types";

/**
 * A small set of well-known products for Quick Find. This is intentionally
 * curated (not generated) so a handful of common lookups — including the
 * canonical demo product — are instant, free, and identical across every
 * AIProvider, regardless of which model is configured. Real providers fall
 * back to a model call for anything not in this list.
 */
interface CuratedProduct {
  match: (queryLower: string) => boolean;
  result: Omit<ProductLookupResult, "found" | "source">;
}

const CURATED_PRODUCTS: CuratedProduct[] = [
  {
    match: (q) => q.includes("tarmac"),
    result: {
      product_name: "Specialized S-Works Tarmac SL9",
      product_description:
        "Complete carbon fiber road racing bicycle, aerodynamic design, for competitive road cycling.",
      material_composition: "Carbon fiber frame, aluminum alloy and steel components",
      intended_use: "road cycling",
      category: "sporting goods",
      brand: "Specialized",
      model: "S-Works Tarmac SL9",
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
    },
  },
];

/** Look up a product against the curated list. Returns null if no match. */
export function findCuratedProduct(query: string): ProductLookupResult | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const match = CURATED_PRODUCTS.find((p) => p.match(q));
  if (!match) return null;
  return { found: true, source: "curated", ...match.result };
}
