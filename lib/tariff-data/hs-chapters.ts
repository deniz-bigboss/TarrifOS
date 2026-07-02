/**
 * The complete Harmonized System chapter map (2-digit level, chapters 01–97;
 * chapter 77 is reserved and unused in the HS). Titles are short summaries of
 * the official WCO chapter headings.
 *
 * This is the structural skeleton of the entire nomenclature. It serves two
 * jobs:
 *  1. It is injected into the classification prompt so the model anchors in
 *     the correct chapter even when the product isn't covered by the local
 *     seed dataset.
 *  2. It validates chapter prefixes when the model proposes a code from
 *     outside the seed dataset (see validateClassification) — a code whose
 *     first two digits aren't a real HS chapter is rejected outright.
 */
export const HS_CHAPTERS: Record<string, string> = {
  "01": "Live animals",
  "02": "Meat and edible meat offal",
  "03": "Fish, crustaceans, molluscs",
  "04": "Dairy produce; eggs; honey",
  "05": "Products of animal origin, n.e.s.",
  "06": "Live trees, plants; cut flowers",
  "07": "Edible vegetables",
  "08": "Edible fruit and nuts",
  "09": "Coffee, tea, maté, spices",
  "10": "Cereals",
  "11": "Milling products; malt; starches",
  "12": "Oil seeds; miscellaneous grains, seeds",
  "13": "Lac; gums, resins, vegetable saps",
  "14": "Vegetable plaiting materials",
  "15": "Animal or vegetable fats and oils",
  "16": "Preparations of meat, fish, crustaceans",
  "17": "Sugars and sugar confectionery",
  "18": "Cocoa and cocoa preparations",
  "19": "Preparations of cereals, flour, starch, milk",
  "20": "Preparations of vegetables, fruit, nuts",
  "21": "Miscellaneous edible preparations",
  "22": "Beverages, spirits and vinegar",
  "23": "Food industry residues; prepared animal feed",
  "24": "Tobacco and manufactured tobacco substitutes",
  "25": "Salt; sulphur; earths, stone; plastering materials",
  "26": "Ores, slag and ash",
  "27": "Mineral fuels, oils and products",
  "28": "Inorganic chemicals",
  "29": "Organic chemicals",
  "30": "Pharmaceutical products",
  "31": "Fertilisers",
  "32": "Tanning/dyeing extracts; paints, varnishes; inks",
  "33": "Essential oils; perfumery, cosmetics, toiletries",
  "34": "Soap, washing preparations, waxes, candles",
  "35": "Albuminoidal substances; glues; enzymes",
  "36": "Explosives; pyrotechnics; matches",
  "37": "Photographic or cinematographic goods",
  "38": "Miscellaneous chemical products",
  "39": "Plastics and articles thereof",
  "40": "Rubber and articles thereof",
  "41": "Raw hides, skins and leather",
  "42": "Articles of leather; travel goods, handbags",
  "43": "Furskins and artificial fur",
  "44": "Wood and articles of wood; wood charcoal",
  "45": "Cork and articles of cork",
  "46": "Straw, esparto, basketware",
  "47": "Pulp of wood; waste paper",
  "48": "Paper and paperboard; articles thereof",
  "49": "Printed books, newspapers, pictures",
  "50": "Silk",
  "51": "Wool, animal hair; yarn and fabric",
  "52": "Cotton",
  "53": "Other vegetable textile fibres",
  "54": "Man-made filaments",
  "55": "Man-made staple fibres",
  "56": "Wadding, felt, nonwovens; ropes, cordage",
  "57": "Carpets and other textile floor coverings",
  "58": "Special woven fabrics; lace; embroidery",
  "59": "Impregnated, coated or laminated textiles",
  "60": "Knitted or crocheted fabrics",
  "61": "Apparel and clothing accessories, knitted or crocheted",
  "62": "Apparel and clothing accessories, not knitted",
  "63": "Other made-up textile articles; rags",
  "64": "Footwear, gaiters and parts",
  "65": "Headgear and parts",
  "66": "Umbrellas, walking sticks, whips",
  "67": "Prepared feathers; artificial flowers",
  "68": "Articles of stone, plaster, cement, asbestos",
  "69": "Ceramic products",
  "70": "Glass and glassware",
  "71": "Pearls, precious stones and metals; jewellery; coin",
  "72": "Iron and steel",
  "73": "Articles of iron or steel",
  "74": "Copper and articles thereof",
  "75": "Nickel and articles thereof",
  "76": "Aluminium and articles thereof",
  "78": "Lead and articles thereof",
  "79": "Zinc and articles thereof",
  "80": "Tin and articles thereof",
  "81": "Other base metals; cermets",
  "82": "Tools, implements, cutlery of base metal",
  "83": "Miscellaneous articles of base metal",
  "84": "Nuclear reactors, boilers, machinery, mechanical appliances; computers",
  "85": "Electrical machinery and equipment; electronics; sound/image recorders",
  "86": "Railway locomotives, rolling stock",
  "87": "Vehicles other than railway; parts (incl. bicycles)",
  "88": "Aircraft, spacecraft and parts",
  "89": "Ships, boats and floating structures",
  "90": "Optical, photographic, measuring, medical instruments",
  "91": "Clocks and watches and parts",
  "92": "Musical instruments",
  "93": "Arms and ammunition",
  "94": "Furniture; bedding, mattresses; lamps; prefabricated buildings",
  "95": "Toys, games and sports requisites",
  "96": "Miscellaneous manufactured articles",
  "97": "Works of art, collectors' pieces, antiques",
};

/** One chapter per line, for injection into the classification prompt. */
export const HS_CHAPTER_PROMPT_BLOCK = Object.entries(HS_CHAPTERS)
  .map(([num, title]) => `${num} ${title}`)
  .join("\n");

/**
 * Normalize an HS-style code to dotted display form:
 * "610910" -> "6109.10", "6109" stays "6109", "6109.10" unchanged.
 * Returns null when the input isn't a plausibly-shaped code.
 */
export function normalizeHsCode(raw: string): string | null {
  const digits = raw.replace(/[.\s]/g, "");
  if (!/^\d{4}(\d{2})?(\d{2})?$/.test(digits)) return null;
  const parts = [digits.slice(0, 4)];
  if (digits.length >= 6) parts.push(digits.slice(4, 6));
  if (digits.length >= 8) parts.push(digits.slice(6, 8));
  return parts.join(".");
}

/**
 * True when a code is structurally plausible HS nomenclature: 4/6/8 digits
 * (dotted or not) AND its chapter prefix is a real HS chapter. This does NOT
 * verify the code semantically exists — that is exactly why model-proposed
 * codes from outside the seed dataset always force human review.
 */
export function isPlausibleHsCode(raw: string): boolean {
  const normalized = normalizeHsCode(raw);
  if (!normalized) return false;
  return normalized.slice(0, 2) in HS_CHAPTERS;
}
