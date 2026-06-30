import type { ProductInput } from "@/types";

/**
 * Deterministic missing-information question generator.
 * Used directly by MockAIProvider and as a safety-net fallback for real
 * providers. Questions are tailored to what the user left blank plus
 * category-specific essentials (batteries, electronics, chemicals, etc.).
 */
export function deterministicMissingInfo(input: ProductInput): string[] {
  const questions: string[] = [];
  const text = [
    input.product_name,
    input.product_description,
    input.material_composition,
    input.intended_use,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!input.material_composition) {
    questions.push(
      "What is the exact material composition (e.g. % of each material)?",
    );
  }
  if (!input.intended_use) {
    questions.push("What is the product's intended use or end application?");
  }
  if ((input.product_description?.trim().length ?? 0) < 25) {
    questions.push(
      "Can you provide a more detailed product description (function, form, key features)?",
    );
  }

  if (/(battery|batteries|lithium|li-ion|power bank)/.test(text)) {
    questions.push("What is the battery chemistry (e.g. Li-ion, LiFePO4, NiMH)?");
    questions.push("What is the capacity in watt-hours (Wh) and voltage?");
    questions.push("Is the battery shipped alone, with equipment, or installed in equipment?");
    questions.push("Do you have a UN38.3 test summary and safety data sheet?");
  }

  if (/(electronic|wireless|bluetooth|wifi|wi-fi|radio|smart)/.test(text)) {
    questions.push("Does the device contain a radio/wireless module (Bluetooth, Wi-Fi, cellular)?");
    questions.push("Do you have a declaration of conformity (CE/UKCA/FCC)?");
  }

  if (/(chemical|solvent|paint|detergent|acid|liquid)/.test(text)) {
    questions.push("Do you have a safety data sheet (SDS) and the CAS number(s)?");
    questions.push("Is the product classified as a dangerous good for transport?");
  }

  if (/(food|supplement|edible|drink|beverage|cosmetic|cream|skincare)/.test(text)) {
    questions.push("Can you provide the full ingredient/INCI list and any health claims?");
  }

  if (!input.origin_country) {
    questions.push("What is the country of origin (where the goods were produced/manufactured)?");
  }

  // De-duplicate while preserving order.
  return Array.from(new Set(questions));
}
