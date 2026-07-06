import type { ClassificationResult, ProductInput } from "@/types";
import { countryName } from "@/lib/utils";
import type { ReadinessBreakdown } from "@/lib/scoring/readiness";
import { REPORT_MESSAGES, type ReportMessages } from "./report-messages";

/** Kept for callers that want the English disclaimer string directly. */
export const REPORT_DISCLAIMER = REPORT_MESSAGES.en.disclaimer;

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

/**
 * Render the Kustaro Customs-Readiness Report as Markdown.
 *
 * The TEMPLATE (headings, field labels, readiness labels, disclaimer, footer)
 * is localized via `m`. The AI-generated ANALYSIS (reasoning, key factors,
 * questions, explanation, risk-flag wording, document names) stays in the
 * language the classifier produced it in (English) — `analysisNote` flags
 * this for non-English reports.
 */
export function toMarkdown(
  ctx: ReportContext,
  m: ReportMessages = REPORT_MESSAGES.en,
  opts: { machineTranslated?: boolean } = {},
): string {
  const { input, result } = ctx;
  const lines: string[] = [];

  lines.push(`# ${m.title}`);
  if (ctx.classificationId) lines.push(`**${m.classificationId}:** ${ctx.classificationId}`);
  if (ctx.createdAt) lines.push(`**${m.generated}:** ${ctx.createdAt}`);
  if (m.analysisNote) {
    lines.push("");
    lines.push(`> ${m.analysisNote}`);
  }
  lines.push("");

  lines.push(`## ${m.product}`);
  lines.push(`- **${m.name}:** ${input.product_name}`);
  lines.push(`- **${m.description}:** ${input.product_description}`);
  if (input.material_composition) lines.push(`- **${m.material}:** ${input.material_composition}`);
  if (input.intended_use) lines.push(`- **${m.intendedUse}:** ${input.intended_use}`);
  lines.push(
    `- **${m.tradeLane}:** ${countryName(input.origin_country)} (${input.origin_country}) → ${countryName(input.destination_country)} (${input.destination_country})`,
  );
  if (input.declared_value != null)
    lines.push(`- **${m.declaredValue}:** ${input.declared_value} ${input.currency ?? ""}`);
  lines.push("");

  lines.push(`## ${m.hsCodeCandidates}`);
  lines.push(`### ${m.recommendedCandidate}`);
  lines.push(`- **${m.code}:** \`${result.recommended_code || "—"}\``);
  lines.push(`- **${m.codeTitle}:** ${result.recommended_title}`);
  lines.push(
    `- **${m.confidence}:** ${(result.confidence * 100).toFixed(0)}% (${m.confidenceLabels[result.confidence_label]})`,
  );
  lines.push(
    `- **${m.humanReviewRequired}:** ${result.human_review_required ? m.yes : m.no}`,
  );
  if (result.human_review_required && result.human_review_reason) {
    lines.push(`- **${m.reviewReason}:** ${result.human_review_reason}`);
  }
  lines.push("");

  if (result.alternative_codes.length) {
    lines.push(`### ${m.alternativeCandidates}`);
    for (const alt of result.alternative_codes) {
      lines.push(
        `- \`${alt.code}\` — ${alt.title} (${(alt.confidence * 100).toFixed(0)}%): ${alt.reason}`,
      );
    }
    lines.push("");
  }

  lines.push(`## ${m.reasoning}`);
  lines.push(result.reasoning_summary || "—");
  lines.push("");

  if (result.key_factors.length) {
    lines.push(`## ${m.keyFactors}`);
    result.key_factors.forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  if (result.duty_estimate) {
    lines.push(`## ${m.dutyTaxEstimate}${result.duty_estimate.is_placeholder ? ` (${m.reference})` : ""}`);
    lines.push(`- **${m.dutyRate}:** ${result.duty_estimate.duty_rate_placeholder}`);
    if (result.duty_estimate.vat_rate_placeholder)
      lines.push(`- **${m.vatTax}:** ${result.duty_estimate.vat_rate_placeholder}`);
    if (result.duty_estimate.estimated_duty_value != null)
      lines.push(
        `- **${m.estimatedDuty}:** ${result.duty_estimate.estimated_duty_value} ${result.duty_estimate.currency ?? ""}`,
      );
    lines.push("");
  }

  if (result.shipment_plan) {
    const plan = result.shipment_plan;
    lines.push(`## ${m.shipmentPlan}`);
    lines.push(plan.summary);
    lines.push(
      `**${m.planReadiness}:** ${plan.readiness_score}% (${plan.readiness_label})`,
    );
    if (plan.actions.length) {
      lines.push(`**${m.agentNextActions}:**`);
      for (const a of plan.actions) {
        lines.push(
          `- [${a.priority.toUpperCase()}] ${a.title} — ${a.owner}; ${a.timing}. ${a.context} ${a.impact}`,
        );
      }
    }
    if (plan.documents.length) {
      lines.push(`**${m.documentChecklist}:**`);
      for (const d of plan.documents) {
        lines.push(`- ${d.name} — ${d.owner} (${d.status}). ${d.reason}`);
      }
    }
    if (plan.checkpoints.length) {
      lines.push(`**${m.complianceCheckpoints}:**`);
      for (const c of plan.checkpoints) {
        lines.push(`- [${c.severity.toUpperCase()}] ${c.title}: ${c.status_note} ${c.instruction}`);
      }
    }
    if (plan.timeline.length) {
      lines.push(`**${m.timeline}:**`);
      for (const s of plan.timeline) {
        lines.push(`- ${s.stage}: ${s.tasks.join(" ")}`);
      }
    }
    lines.push(`> ${plan.disclaimer}`);
    lines.push("");
  }

  if (result.cost_optimization) {
    const opt = result.cost_optimization;
    lines.push(`## ${m.costOptimization}`);
    if (opt.duty_comparison.length) {
      lines.push(`**${m.dutyByCandidate}:**`);
      for (const d of opt.duty_comparison) {
        lines.push(
          `- \`${d.code}\`${d.is_recommended ? " (recommended)" : ""} — ${d.title}: ${d.duty_rate_placeholder}${d.estimated_duty_value != null ? ` (~${d.estimated_duty_value} ${input.currency ?? ""})` : ""}`,
        );
      }
    }
    if (opt.trade_programs.length) {
      lines.push(`**${m.preferentialPrograms}:**`);
      for (const p of opt.trade_programs) {
        lines.push(
          `- ${p.name} (${p.may_apply ? "may apply" : "no program found"}): ${p.potential_duty_rate}. ${p.notes}`,
        );
      }
    }
    if (opt.recommendations.length) {
      lines.push(`**${m.suggestedActions}:**`);
      opt.recommendations.forEach((r) => lines.push(`- ${r}`));
    }
    lines.push(`> ${opt.disclaimer}`);
    lines.push("");
  }

  if (result.required_documents.length) {
    lines.push(`## ${m.requiredDocuments}`);
    result.required_documents.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
  }

  if (result.restriction_warnings.length) {
    lines.push(`## ${m.riskFlags}`);
    result.restriction_warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  if (result.missing_information.length) {
    lines.push(`## ${m.missingInformation}`);
    result.missing_information.forEach((q) => lines.push(`- ${q}`));
    lines.push("");
  }

  lines.push(`## ${m.explanation}`);
  lines.push(result.broker_ready_explanation || "—");
  lines.push("");

  if (ctx.readiness) {
    lines.push(`## ${m.readinessScore}`);
    lines.push(`**${ctx.readiness.score}/100**`);
    if (ctx.readiness.strong.length) {
      lines.push(`**${m.strong}:**`);
      ctx.readiness.strong.forEach((s) => lines.push(`- ${s}`));
    }
    if (ctx.readiness.attention.length) {
      lines.push(`**${m.needsAttention}:**`);
      ctx.readiness.attention.forEach((s) => lines.push(`- ${s}`));
    }
    lines.push("");
  }

  if (result.shipment_plan?.actions.length) {
    lines.push(`## ${m.suggestedNextActions}`);
    for (const a of result.shipment_plan.actions.slice(0, 6)) {
      lines.push(`- [${a.priority.toUpperCase()}] ${a.title}`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`> ${m.disclaimer}`);
  lines.push("");
  lines.push(`_${m.footer}_`);

  // Machine-translated reports carry the English legal text verbatim as the
  // authoritative version, so the binding wording is always present in the
  // file regardless of the display language.
  if (opts.machineTranslated && m.machineTranslatedNotice) {
    lines.push("");
    lines.push(`> ${m.machineTranslatedNotice}`);
    lines.push("");
    lines.push(`**Authoritative version (English):**`);
    lines.push(`> ${REPORT_MESSAGES.en.disclaimer}`);
  }

  return lines.join("\n");
}

/** Plain-text report (used for copy-to-clipboard). */
export function toPlainText(
  ctx: ReportContext,
  m: ReportMessages = REPORT_MESSAGES.en,
  opts: { machineTranslated?: boolean } = {},
): string {
  return toMarkdown(ctx, m, opts)
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "");
}
