import type { ProductInput } from "@/types";

/**
 * High-risk category detection.
 *
 * Compliance requirement: products in these categories ALWAYS require human
 * review, regardless of model confidence. Detection is keyword-based over the
 * combined product text so it is deterministic and explainable.
 */
export interface RiskCategory {
  id: string;
  label: string;
  /** Keywords that, if present, flag this category. */
  keywords: string[];
  /** Human-review reason surfaced to the user. */
  reason: string;
}

export const HIGH_RISK_CATEGORIES: RiskCategory[] = [
  {
    id: "food",
    label: "Food / beverage",
    keywords: ["food", "coffee", "chocolate", "juice", "snack", "edible", "drink", "beverage", "supplement", "tea", "spice", "sauce", "dairy", "meat", "seafood", "fish"],
    reason: "Food and beverages are subject to food-safety, labelling and sanitary import controls.",
  },
  {
    id: "cosmetics",
    label: "Cosmetics",
    keywords: ["cosmetic", "skincare", "skin care", "cream", "lotion", "serum", "makeup", "make-up", "perfume", "fragrance", "shampoo", "lipstick", "mascara", "moisturizer"],
    reason: "Cosmetics require ingredient safety assessment and EU/UK product notification.",
  },
  {
    id: "chemicals",
    label: "Chemicals",
    keywords: ["chemical", "solvent", "acid", "detergent", "paint", "varnish", "adhesive", "reagent", "caustic", "hydroxide", "corrosive", "flammable", "pesticide"],
    reason: "Chemicals are subject to REACH/CLP, safety data sheet and dangerous-goods controls.",
  },
  {
    id: "batteries",
    label: "Batteries",
    keywords: ["battery", "batteries", "lithium", "li-ion", "lithium-ion", "accumulator", "power bank", "cell"],
    reason: "Lithium batteries are Class 9 dangerous goods requiring UN38.3 testing and transport controls.",
  },
  {
    id: "radio_electronics",
    label: "Electronics with radio modules",
    keywords: ["wireless", "bluetooth", "wifi", "wi-fi", "radio", "rf module", "5g", "lte", "transmitter", "router", "smartphone", "drone"],
    reason: "Devices with radio modules require RED/FCC/CE conformity and frequency compliance.",
  },
  {
    id: "medical",
    label: "Medical devices",
    keywords: ["medical", "medical device", "syringe", "needle", "catheter", "surgical", "diagnostic", "orthopaedic", "orthopedic", "bandage", "dressing", "implant"],
    reason: "Medical devices require MDR/UKCA registration and conformity assessment.",
  },
  {
    id: "pharma",
    label: "Pharmaceuticals",
    // "tablet"/"capsule" removed: they overwhelmingly mean tablet computers
    // and coffee capsules in trade descriptions, not medicine forms.
    keywords: ["pharmaceutical", "medicine", "medicament", "drug", "vaccine", "antibiotic", "pharma"],
    reason: "Pharmaceuticals require marketing authorisation and import licensing.",
  },
  {
    id: "dual_use",
    label: "Dual-use goods",
    keywords: ["dual-use", "dual use", "radar", "encryption", "drone", "uav", "night vision", "gyroscope", "centrifuge"],
    reason: "Potential dual-use item requiring export-control screening and possible licensing.",
  },
  {
    id: "weapons",
    label: "Weapons",
    keywords: ["weapon", "firearm", "gun", "handgun", "shotgun", "ammunition", "rifle", "pistol", "knife", "knives", "dagger", "sword", "explosive", "small arms"],
    reason: "Weapons and parts are controlled goods requiring licensing and may be prohibited.",
  },
  {
    id: "alcohol",
    label: "Alcohol",
    keywords: ["alcohol", "wine", "beer", "spirits", "whisky", "whiskey", "vodka", "liquor", "champagne", "ethanol"],
    reason: "Alcohol is an excise good with duty, licensing and age-restriction controls.",
  },
  {
    id: "tobacco",
    label: "Tobacco",
    keywords: ["tobacco", "cigarette", "cigar", "vape", "e-cigarette", "nicotine"],
    reason: "Tobacco is an excise good with track-and-trace, health-warning and licensing rules.",
  },
  {
    id: "animal",
    label: "Animal products",
    keywords: ["animal", "meat", "poultry", "dairy", "leather", "fur", "rawhide", "animal hide", "cowhide", "seafood", "fish", "shellfish", "honey", "egg"],
    reason: "Animal products are subject to veterinary/SPS controls and border inspection.",
  },
  {
    id: "plant",
    label: "Plant products",
    keywords: ["live plant", "houseplant", "seedling", "seed", "flower", "wood", "wooden", "plywood", "timber", "fruit", "vegetable", "wheat", "rice", "cereal", "flower bulb"],
    reason: "Plant products require phytosanitary certification and import checks.",
  },
];

export interface RiskAssessment {
  isHighRisk: boolean;
  categories: RiskCategory[];
  reason: string;
}

/**
 * Whole-word keyword match. Plain substring matching produced false
 * high-risk flags: "fur" matched "furniture", "bulb" matched "LED bulb",
 * "arms" matched "alarms", "rifle" matched "trifle", "tea" matched "steak".
 * Every false hit forces an unnecessary human review, so keywords only
 * match at word boundaries (multi-word keywords like "power bank" work too).
 */
const KEYWORD_REGEX_CACHE = new Map<string, RegExp>();

function keywordMatches(haystack: string, keyword: string): boolean {
  let re = KEYWORD_REGEX_CACHE.get(keyword);
  if (!re) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // "(s|es)?" keeps singular keywords matching their plurals ("cigarettes",
    // "weapons") which plain \b boundaries would otherwise stop matching.
    re = new RegExp(`\\b${escaped}(s|es)?\\b`);
    KEYWORD_REGEX_CACHE.set(keyword, re);
  }
  return re.test(haystack);
}

/** Detect high-risk categories from the combined product text. */
export function assessRisk(input: ProductInput): RiskAssessment {
  const haystack = [
    input.product_name,
    input.product_description,
    input.material_composition,
    input.intended_use,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = HIGH_RISK_CATEGORIES.filter((cat) =>
    cat.keywords.some((kw) => keywordMatches(haystack, kw)),
  );

  return {
    isHighRisk: matched.length > 0,
    categories: matched,
    reason: matched.map((c) => c.reason).join(" "),
  };
}
