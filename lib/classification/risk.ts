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
    keywords: ["pharmaceutical", "medicine", "medicament", "drug", "tablet", "capsule", "vaccine", "antibiotic", "pharma"],
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
    keywords: ["weapon", "firearm", "gun", "ammunition", "rifle", "pistol", "knife", "blade", "explosive", "arms"],
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
    keywords: ["animal", "meat", "poultry", "dairy", "leather", "fur", "hide", "seafood", "fish", "shellfish", "honey", "egg"],
    reason: "Animal products are subject to veterinary/SPS controls and border inspection.",
  },
  {
    id: "plant",
    label: "Plant products",
    keywords: ["plant", "seed", "flower", "wood", "timber", "fruit", "vegetable", "grain", "live plant", "bulb"],
    reason: "Plant products require phytosanitary certification and import checks.",
  },
];

export interface RiskAssessment {
  isHighRisk: boolean;
  categories: RiskCategory[];
  reason: string;
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
    cat.keywords.some((kw) => haystack.includes(kw)),
  );

  return {
    isHighRisk: matched.length > 0,
    categories: matched,
    reason: matched.map((c) => c.reason).join(" "),
  };
}
