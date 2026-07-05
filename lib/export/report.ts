import type { ClassificationResult, ProductInput } from "@/types";
import { countryName } from "@/lib/utils";
import type { ReadinessBreakdown } from "@/lib/scoring/readiness";

export const REPORT_DISCLAIMER =
  "This report is a customs-readiness recommendation generated from available product information and tariff-reference data. It is not legal advice and does not guarantee acceptance by customs authorities. Final classification and customs declarations should be verified before official use.";

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
  readiness?: ReadinessBreakdown;
}

/** Render the Kustaro Customs-Readiness Report as Markdown. */
export function toMarkdown(ctx: ReportContext): string {
  const { input, result } = ctx;
  const lines: string[] = [];

  lines.push(`# Kustaro Customs-Readiness Report`);
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

  lines.push(`## HS-Code Candidates`);
  lines.push(`### Recommended candidate`);
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
    lines.push(`### Alternative candidates`);
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

  if (result.shipment_plan) {
    const plan = result.shipment_plan;
    lines.push(`## Shipment Execution Plan`);
    lines.push(plan.summary);
    lines.push(
      `**Readiness:** ${plan.readiness_score}% (${plan.readiness_label})`,
    );
    if (plan.actions.length) {
      lines.push(`**Agent next actions:**`);
      for (const a of plan.actions) {
        lines.push(
          `- [${a.priority.toUpperCase()}] ${a.title} — Owner: ${a.owner}; Timing: ${a.timing}. ${a.context} ${a.impact}`,
        );
      }
    }
    if (plan.documents.length) {
      lines.push(`**Document checklist:**`);
      for (const d of plan.documents) {
        lines.push(`- ${d.name} — Owner: ${d.owner} (${d.status}). ${d.reason}`);
      }
    }
    if (plan.checkpoints.length) {
      lines.push(`**Compliance checkpoints:**`);
      for (const c of plan.checkpoints) {
        lines.push(`- [${c.severity.toUpperCase()}] ${c.title}: ${c.status_note} ${c.instruction}`);
      }
    }
    if (plan.timeline.length) {
      lines.push(`**Timeline:**`);
      for (const s of plan.timeline) {
        lines.push(`- ${s.stage}: ${s.tasks.join(" ")}`);
      }
    }
    lines.push(`> ${plan.disclaimer}`);
    lines.push("");
  }

  if (result.cost_optimization) {
    const opt = result.cost_optimization;
    lines.push(`## Cost Optimization`);
    if (opt.duty_comparison.length) {
      lines.push(`**Duty by candidate code:**`);
      for (const d of opt.duty_comparison) {
        lines.push(
          `- \`${d.code}\`${d.is_recommended ? " (recommended)" : ""} — ${d.title}: ${d.duty_rate_placeholder}${d.estimated_duty_value != null ? ` (~${d.estimated_duty_value} ${input.currency ?? ""})` : ""}`,
        );
      }
    }
    if (opt.trade_programs.length) {
      lines.push(`**Preferential trade programs:**`);
      for (const p of opt.trade_programs) {
        lines.push(
          `- ${p.name} (${p.may_apply ? "may apply" : "no program found"}): ${p.potential_duty_rate}. ${p.notes}`,
        );
      }
    }
    if (opt.recommendations.length) {
      lines.push(`**Suggested actions:**`);
      opt.recommendations.forEach((r) => lines.push(`- ${r}`));
    }
    lines.push(`> ${opt.disclaimer}`);
    lines.push("");
  }

  if (result.required_documents.length) {
    lines.push(`## Required Documents`);
    result.required_documents.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (result.restriction_warnings.length) {
    lines.push(`## Risk Flags`);
    result.restriction_warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (result.missing_information.length) {
    lines.push(`## Missing Information`);
    result.missing_information.forEach((m) => lines.push(`- ${m}`));
    lines.push("");
  }

  lines.push(`## Explanation for Customs Review`);
  lines.push(result.broker_ready_explanation || "—");
  lines.push("");

  if (ctx.readiness) {
    lines.push(`## Customs-Readiness Score`);
    lines.push(`**${ctx.readiness.score}/100**`);
    if (ctx.readiness.strong.length) {
      lines.push(`**Strong:**`);
      ctx.readiness.strong.forEach((s) => lines.push(`- ${s}`));
    }
    if (ctx.readiness.attention.length) {
      lines.push(`**Needs attention:**`);
      ctx.readiness.attention.forEach((s) => lines.push(`- ${s}`));
    }
    lines.push("");
  }

  if (result.shipment_plan?.actions.length) {
    lines.push(`## Suggested Next Actions`);
    for (const a of result.shipment_plan.actions.slice(0, 6)) {
      lines.push(`- [${a.priority.toUpperCase()}] ${a.title}`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`> ${REPORT_DISCLAIMER}`);
  lines.push("");
  lines.push(`_Generated by Kustaro — customs-readiness recommendations for review._`);

  return lines.join("\n");
}

/** Plain-text report (used for copy-to-clipboard). */
export function toPlainText(ctx: ReportContext): string {
  return toMarkdown(ctx)
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "");
}
