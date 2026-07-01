import type { ProductInput } from "@/types";

function inputText(input: ProductInput): string {
  return [
    input.product_name,
    input.product_description,
    input.material_composition,
    input.intended_use,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * True when the product might plausibly BE a standalone battery/power-bank
 * (so "is it shipped alone or installed?" is a real, open question) — as
 * opposed to a finished device (phone, watch, tracker, laptop) that merely
 * contains one, where the battery is obviously already installed and asking
 * is nonsensical.
 */
function looksLikeStandaloneBattery(input: ProductInput, text: string): boolean {
  if (input.category === "batteries") return true;
  return /\b(power bank|battery pack|replacement batter\w*|spare batter\w*|battery cell|loose batter\w*)\b/.test(
    text,
  );
}

/**
 * Deterministic missing-information question generator.
 * Used directly by MockAIProvider and as a safety-net fallback for real
 * providers. Questions are tailored to what the user left blank plus
 * category-specific essentials (batteries, electronics, chemicals, etc.) —
 * and, critically, only asked when the answer isn't already stated in the
 * product name/description/material/use (e.g. don't ask for battery
 * chemistry if the description already says "lithium-ion").
 */
export function deterministicMissingInfo(input: ProductInput): string[] {
  const questions: string[] = [];
  const text = inputText(input);
  const has = (re: RegExp) => re.test(text);

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

  if (has(/(battery|batteries|lithium|li-ion|power bank)/)) {
    if (!has(/(lithium-?ion|li-?ion|lifepo4|lithium[\s-]?polymer|li-?po\b|nimh|ni-mh|nicd|ni-cd|alkaline|lead-?acid)/)) {
      questions.push("What is the battery chemistry (e.g. Li-ion, LiFePO4, NiMH)?");
    }
    if (!has(/(\d+(\.\d+)?\s?(wh|watt-hour|mah|milliamp))/)) {
      questions.push("What is the capacity in watt-hours (Wh) and voltage?");
    }
    if (
      looksLikeStandaloneBattery(input, text) &&
      !has(/(built-?in|integrated|internal|embedded|installed)/)
    ) {
      questions.push("Is the battery shipped alone, with equipment, or installed in equipment?");
    }
    // Not inferable from any product description — always a genuine gap.
    questions.push("Do you have a UN38.3 test summary and safety data sheet?");
  }

  if (has(/(electronic|wireless|bluetooth|wifi|wi-fi|radio|smart)/)) {
    if (!has(/(bluetooth|wi-?fi|cellular|\b[3-6]g\b|lte|nfc|radio module|wireless)/)) {
      questions.push("Does the device contain a radio/wireless module (Bluetooth, Wi-Fi, cellular)?");
    }
    // Compliance paperwork — never stated in a product description itself.
    questions.push("Do you have a declaration of conformity (CE/UKCA/FCC)?");
  }

  if (has(/(chemical|solvent|paint|detergent|acid|liquid)/)) {
    questions.push("Do you have a safety data sheet (SDS) and the CAS number(s)?");
    questions.push("Is the product classified as a dangerous good for transport?");
  }

  if (has(/(food|supplement|edible|drink|beverage|cosmetic|cream|skincare)/)) {
    questions.push("Can you provide the full ingredient/INCI list and any health claims?");
  }

  if (!input.origin_country) {
    questions.push("What is the country of origin (where the goods were produced/manufactured)?");
  }

  // De-duplicate while preserving order.
  return Array.from(new Set(questions));
}

/**
 * Known "question topic -> should we drop it?" pairs. Used to catch
 * redundant/inapplicable questions in ANY provider's missing_information
 * output (not just mock) — models phrase questions in many different ways
 * ("battery's chemistry composition?", "confirm the chemistry of the
 * cells?"), so topicMatch is a loose proximity check (two topic words within
 * ~40 chars of each other, in either order) rather than a fixed phrase — a
 * code-level safety net that doesn't depend on prompt-following alone.
 */
const REDUNDANCY_RULES: {
  topicMatch: RegExp;
  shouldDrop: (input: ProductInput, text: string) => boolean;
}[] = [
  {
    // battery chemistry / composition / type
    topicMatch:
      /batter\w*.{0,40}(chemistry|composition|type|cells?)|(chemistry|composition|type).{0,40}batter\w*/i,
    shouldDrop: (_input, text) =>
      /(lithium-?ion|li-?ion|lifepo4|lithium[\s-]?polymer|li-?po\b|nimh|ni-mh|nicd|ni-cd|alkaline|lead-?acid)/i.test(
        text,
      ),
  },
  {
    // battery capacity / watt-hours / voltage
    topicMatch:
      /(watt-?hour|capacity|voltage|\bwh\b).{0,40}batter\w*|batter\w*.{0,40}(watt-?hour|capacity|voltage|\bwh\b)/i,
    shouldDrop: (_input, text) =>
      /(\d+(\.\d+)?\s?(wh\b|watt-hour|mah|milliamp|volt))/i.test(text),
  },
  {
    // radio / wireless module presence
    topicMatch:
      /(radio|wireless|bluetooth|wi-?fi|cellular|nfc).{0,40}(module|communication|connectivity|present|contain|include)|(module|communication|connectivity|present|contain|include).{0,40}(radio|wireless|bluetooth|wi-?fi|cellular|nfc)/i,
    shouldDrop: (_input, text) =>
      /(bluetooth|wi-?fi|cellular|\b[3-6]g\b|lte|nfc|radio module|wireless)/i.test(text),
  },
  {
    // battery installed vs. shipped separately — drop if already stated, OR
    // if the product isn't plausibly a standalone battery to begin with
    // (a finished device's battery is obviously installed; asking is
    // nonsensical for a phone/watch/tracker/laptop).
    topicMatch:
      /batter\w*.{0,40}(install|shipped|separat|alone|equipment)|(install|shipped|separat|alone).{0,40}batter\w*/i,
    shouldDrop: (input, text) =>
      /(built-?in|integrated|internal|embedded|installed)/i.test(text) ||
      !looksLikeStandaloneBattery(input, text),
  },
];

/**
 * Drops missing-information questions that are either already answered
 * elsewhere in the product input, or don't make sense for this product to
 * begin with. Applied to every provider's output in the pipeline
 * (lib/classification/pipeline.ts) so a model that ignores the "don't ask
 * what's already answered" prompt instruction can't still surface a
 * redundant question to the user.
 */
export function filterRedundantMissingInfo(
  questions: string[],
  input: ProductInput,
): string[] {
  if (questions.length === 0) return questions;
  const text = inputText(input);
  return questions.filter((q) => {
    const rule = REDUNDANCY_RULES.find((r) => r.topicMatch.test(q));
    if (!rule) return true; // no known rule for this question — keep it
    return !rule.shouldDrop(input, text);
  });
}
