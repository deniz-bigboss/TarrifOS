import type { ClassificationResult, ProductInput } from "@/types";
import { countryName } from "@/lib/utils";

export interface ReportContext {
  input: Pick<
    ProductInput,
    | "product_name"
    | "product_description"
    | "material_composition"
    | "intended_use"
    | "origin_country"
    | "destination_country"
    | "declared_value"
    | "currency"
  >;
  result: ClassificationResult;
  classificationId?: string;
  createdAt?: string;
}

/** Render a broker-ready classification report as Markdown. */
export function toMarkdown(ctx: ReportContext): string {
  const { input, result } = ctx;
  const lines: string[] = [];

  lines.push(`# TariffOS Classification Report`);
  if (ctx.classificationId) lines.push(`**Classification ID:** ${ctx.classificationId}`);
  if (ctx.createdAt) lines.push(`**Generated:** ${ctx.createdAt}`);
  lines.push("");

  lines.push(`## Product`);
  lines.push(`- **Name:** ${input.product_name}`);
  lines.push(`- **Description:** ${input.product_description}`);
  if (input.material_composition) lines.push(`- **Material:** ${input.material_composition}`);
  if (input.intended_use) lines.push(`- **Intended use:** ${input.intended_use}`);
  lines.push(
    `- **Trade lane:** ${countryName(input.origin_country)} (${input.origin_country}) → ${countryName(input.destination_country)} (${input.destination_country})`,
  );
  if (input.declared_value != null)
    lines.push(`- **Declared value:** ${input.declared_value} ${input.currency ?? ""}`);
  lines.push("");

  lines.push(`## Recommended Classification`);
  lines.push(`- **Code:** \`${result.recommended_code || "—"}\``);
  lines.push(`- **Title:** ${result.recommended_title}`);
  lines.push(
    `- **Confidence:** ${(result.confidence * 100).toFixed(0)}% (${result.confidence_label})`,
  );
  lines.push(
    `- **Human review required:** ${result.human_review_required ? "YES" : "No"}`,
  );
  if (result.human_review_required && result.human_review_reason) {
    lines.push(`- **Review reason:** ${result.human_review_reason}`);
  }
  lines.push("");

  if (result.alternative_codes.length) {
    lines.push(`## Alternative Codes`);
    for (const alt of result.alternative_codes) {
      lines.push(
        `- \`${alt.code}\` — ${alt.title} (${(alt.confidence * 100).toFixed(0)}%): ${alt.reason}`,
      );
    }
    lines.push("");
  }

  lines.push(`## Reasoning`);
  lines.push(result.reasoning_summary || "—");
  lines.push("");

  if (result.key_factors.length) {
    lines.push(`## Key Factors`);
    result.key_factors.forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  if (result.duty_estimate) {
    lines.push(`## Duty / Tax Estimate (placeholder)`);
    lines.push(`- **Duty rate:** ${result.duty_estimate.duty_rate_placeholder}`);
    if (result.duty_estimate.vat_rate_placeholder)
      lines.push(`- **VAT/tax:** ${result.duty_estimate.vat_rate_placeholder}`);
    if (result.duty_estimate.estimated_duty_value != null)
      lines.push(
        `- **Estimated duty:** ${result.duty_estimate.estimated_duty_value} ${result.duty_estimate.currency ?? ""} (placeholder)`,
      );
    lines.push("");
  }

  if (result.required_documents.length) {
    lines.push(`## Required Documents`);
    result.required_documents.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (result.restriction_warnings.length) {
    lines.push(`## Restrictions & Warnings`);
    result.restriction_warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (result.missing_information.length) {
    lines.push(`## Missing Information`);
    result.missing_information.forEach((m) => lines.push(`- ${m}`));
    lines.push("");
  }

  lines.push(`## Broker-Ready Explanation`);
  lines.push(result.broker_ready_explanation || "—");
  lines.push("");

  lines.push(`---`);
  lines.push(`> ${result.disclaimer}`);

  return lines.join("\n");
}

/** Plain-text report (used for copy-to-clipboard). */
export function toPlainText(ctx: ReportContext): string {
  return toMarkdown(ctx)
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "");
}
