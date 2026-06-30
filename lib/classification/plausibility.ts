import type { ProductInput } from "@/types";

/**
 * Conservative, currency-agnostic per-unit weight ceilings (kg) by product
 * category — generous on purpose. These only catch implausible data entry
 * (e.g. mistaking total shipment weight for per-unit weight, or a kg/g
 * mix-up), not genuine product variation. Keys match the wizard's category
 * options; unrecognized/free-text categories (e.g. from the API) fall back
 * to DEFAULT_WEIGHT_CEILING_KG.
 */
const CATEGORY_WEIGHT_CEILING_KG: Record<string, number> = {
  apparel: 5,
  textiles: 30,
  footwear: 3,
  "leather goods": 5,
  electronics: 50,
  batteries: 50,
  cosmetics: 5,
  "food products": 50,
  "plastic goods": 50,
  "metal goods": 200,
  furniture: 250,
  "books/paper": 30,
  toys: 20,
  machinery: 2000,
  chemicals: 1000,
  medical: 50,
  "sporting goods": 25,
};

const DEFAULT_WEIGHT_CEILING_KG = 500;

/**
 * Generous per-category ceilings on declared-value-per-kg, expressed in
 * whatever currency the user entered (intentionally currency-naive — EUR,
 * GBP, USD and TRY are all "close enough" at these wide multiples that a
 * fixed ceiling per category avoids both false positives across currencies
 * and false negatives within one). Light, high-value categories
 * (electronics, cosmetics, medical) get a much higher ceiling than bulky,
 * low-value ones (apparel, food, furniture).
 */
const CATEGORY_VALUE_PER_KG_CEILING: Record<string, number> = {
  apparel: 500,
  textiles: 200,
  footwear: 500,
  "leather goods": 2000,
  electronics: 50_000,
  batteries: 2000,
  cosmetics: 5000,
  "food products": 200,
  "plastic goods": 200,
  "metal goods": 500,
  furniture: 200,
  "books/paper": 200,
  toys: 1000,
  machinery: 2000,
  chemicals: 500,
  medical: 50_000,
  "sporting goods": 10_000,
};

const DEFAULT_VALUE_PER_KG_CEILING = 5000;
const VALUE_PER_KG_FLOOR = 0.05;

/**
 * Stage: assessDataPlausibility (runs alongside validateClassification).
 *
 * This is NOT a classification-confidence signal and NOT a regulatory
 * restriction — HS/HTS codes are determined by what a product is (material,
 * function, composition), not its declared value or weight. This check only
 * flags declared value/weight combinations that look like data-entry errors
 * (extra digit, swapped fields, unit mismatch) so they can be corrected
 * before a customs declaration is filed. Returns plain warning strings,
 * merged into the same restriction_warnings list shown in the UI/exports,
 * prefixed "Data quality:" to distinguish them from compliance warnings.
 */
export function assessDataPlausibility(input: ProductInput): string[] {
  const warnings: string[] = [];

  const quantity = input.quantity && input.quantity > 0 ? input.quantity : null;
  const unitWeight = input.unit_weight ?? null;
  const declaredValue = input.declared_value ?? null;

  // --- Weight plausibility (currency-independent) ---
  if (unitWeight != null) {
    if (unitWeight <= 0) {
      warnings.push(
        "Data quality: unit weight is zero or negative — confirm this is the correct per-unit weight in kg.",
      );
    } else {
      const ceiling =
        CATEGORY_WEIGHT_CEILING_KG[(input.category || "").toLowerCase().trim()] ??
        DEFAULT_WEIGHT_CEILING_KG;
      if (unitWeight > ceiling) {
        warnings.push(
          `Data quality: unit weight of ${unitWeight}kg is unusually high for category "${input.category || "this product"}" (expected under ~${ceiling}kg). Confirm this is per-unit weight, not total shipment weight.`,
        );
      }
    }
  }

  // --- Value-to-weight ratio plausibility (category-aware) ---
  if (declaredValue != null && declaredValue > 0 && unitWeight != null && unitWeight > 0) {
    const perUnitValue = quantity ? declaredValue / quantity : declaredValue;
    const ratio = perUnitValue / unitWeight;
    const currency = input.currency ? ` ${input.currency}` : "";
    const ceiling =
      CATEGORY_VALUE_PER_KG_CEILING[(input.category || "").toLowerCase().trim()] ??
      DEFAULT_VALUE_PER_KG_CEILING;
    if (ratio > ceiling) {
      warnings.push(
        `Data quality: declared value relative to weight (~${perUnitValue.toFixed(2)}${currency} per unit / ${unitWeight}kg) looks unusually high for category "${input.category || "this product"}" (expected under ~${ceiling}${currency}/kg). Check for an extra digit, wrong currency, or a unit mismatch before declaring.`,
      );
    } else if (ratio < VALUE_PER_KG_FLOOR) {
      warnings.push(
        `Data quality: declared value relative to weight (~${perUnitValue.toFixed(2)}${currency} per unit / ${unitWeight}kg) looks unusually low. Check the declared value and quantity are correct.`,
      );
    }
  }

  // --- Declared value vs quantity sanity ---
  if (declaredValue != null && quantity != null) {
    const perUnitValue = declaredValue / quantity;
    if (perUnitValue <= 0) {
      warnings.push(
        "Data quality: declared value per unit is zero or negative — confirm declared value and quantity.",
      );
    }
  }

  return warnings;
}
