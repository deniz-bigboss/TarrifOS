/* Quick offline verification of the mock classification engine. */
import { runClassification } from "../lib/classification/pipeline";
import type { ProductInput } from "../types";

async function run(label: string, input: ProductInput) {
  const { candidates, result } = await runClassification(input);
  console.log(`\n=== ${label} ===`);
  console.log("candidates:", candidates.map((c) => `${c.code}(${c.score.toFixed(2)})`).join(", "));
  console.log("recommended:", result.recommended_code, "-", result.recommended_title);
  console.log("confidence:", result.confidence, result.confidence_label);
  console.log("human_review_required:", result.human_review_required);
  console.log("review_reason:", result.human_review_reason || "(none)");
  console.log("required_documents:", result.required_documents.join(" | "));
  console.log("restriction_warnings:", result.restriction_warnings.join(" | ") || "(none)");
  console.log("missing_information:", result.missing_information.length, "questions");
}

async function main() {
  await run("Cotton t-shirt TR->DE", {
    product_name: "Men's short-sleeve knitted t-shirt",
    product_description: "100% cotton knitted short-sleeve t-shirt",
    material_composition: "100% cotton",
    intended_use: "apparel",
    origin_country: "TR",
    destination_country: "DE",
    declared_value: 1200,
    currency: "EUR",
  });

  await run("E-bike battery CN->GB", {
    product_name: "Rechargeable lithium-ion battery pack for e-bike",
    product_description: "Rechargeable lithium-ion battery pack for electric bicycle",
    origin_country: "CN",
    destination_country: "GB",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
