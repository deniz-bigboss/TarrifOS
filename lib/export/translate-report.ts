import type { ClassificationResult } from "@/types";
import type { ReadinessBreakdown } from "@/lib/scoring/readiness";
import { translateStrings } from "@/lib/ai/translate";

/**
 * Machine-translate the AI-generated ANALYSIS of a report (reasoning, key
 * factors, questions, explanation, plan/cost prose) plus the readiness
 * breakdown sentences, in ONE batched call. Codes, numbers, and the curated
 * template (headings/labels/disclaimer) are never sent — those come from the
 * professionally-translated REPORT_MESSAGES. Returns null if no provider is
 * configured or every provider fails, so callers keep the English report.
 */
export async function translateReportBundle(
  result: ClassificationResult,
  readiness: ReadinessBreakdown | undefined,
  targetLanguage: string,
  /** Injectable for tests; defaults to the live batched translator. */
  translator: (
    strings: string[],
    lang: string,
  ) => Promise<string[] | null> = translateStrings,
): Promise<{ result: ClassificationResult; readiness?: ReadinessBreakdown } | null> {
  const clone: ClassificationResult = JSON.parse(JSON.stringify(result));
  const clonedReadiness: ReadinessBreakdown | undefined = readiness
    ? JSON.parse(JSON.stringify(readiness))
    : undefined;

  const strings: string[] = [];
  const setters: ((v: string) => void)[] = [];
  const add = (val: string | null | undefined, set: (v: string) => void) => {
    if (val && val.trim()) {
      strings.push(val);
      setters.push(set);
    }
  };

  add(clone.recommended_title, (v) => (clone.recommended_title = v));
  add(clone.reasoning_summary, (v) => (clone.reasoning_summary = v));
  add(clone.human_review_reason, (v) => (clone.human_review_reason = v));
  add(clone.broker_ready_explanation, (v) => (clone.broker_ready_explanation = v));
  clone.key_factors.forEach((s, i) => add(s, (v) => (clone.key_factors[i] = v)));
  clone.missing_information.forEach((s, i) => add(s, (v) => (clone.missing_information[i] = v)));
  clone.restriction_warnings.forEach((s, i) => add(s, (v) => (clone.restriction_warnings[i] = v)));
  clone.required_documents.forEach((s, i) => add(s, (v) => (clone.required_documents[i] = v)));
  clone.alternative_codes.forEach((a, i) => {
    add(a.title, (v) => (clone.alternative_codes[i].title = v));
    add(a.reason, (v) => (clone.alternative_codes[i].reason = v));
  });

  const plan = clone.shipment_plan;
  if (plan) {
    add(plan.summary, (v) => (plan.summary = v));
    plan.actions.forEach((a, i) => {
      add(a.title, (v) => (plan.actions[i].title = v));
      add(a.context, (v) => (plan.actions[i].context = v));
      add(a.impact, (v) => (plan.actions[i].impact = v));
      add(a.owner, (v) => (plan.actions[i].owner = v));
      add(a.timing, (v) => (plan.actions[i].timing = v));
    });
    plan.documents.forEach((d, i) => {
      add(d.name, (v) => (plan.documents[i].name = v));
      add(d.reason, (v) => (plan.documents[i].reason = v));
      add(d.owner, (v) => (plan.documents[i].owner = v));
    });
    plan.checkpoints.forEach((c, i) => {
      add(c.title, (v) => (plan.checkpoints[i].title = v));
      add(c.status_note, (v) => (plan.checkpoints[i].status_note = v));
      add(c.instruction, (v) => (plan.checkpoints[i].instruction = v));
    });
    plan.timeline.forEach((s, i) => {
      add(s.stage, (v) => (plan.timeline[i].stage = v));
      s.tasks.forEach((tk, j) => add(tk, (v) => (plan.timeline[i].tasks[j] = v)));
    });
  }

  const opt = clone.cost_optimization;
  if (opt) {
    opt.recommendations.forEach((s, i) => add(s, (v) => (opt.recommendations[i] = v)));
    opt.trade_programs.forEach((p, i) => {
      add(p.name, (v) => (opt.trade_programs[i].name = v));
      add(p.notes, (v) => (opt.trade_programs[i].notes = v));
    });
    opt.duty_comparison.forEach((d, i) => add(d.title, (v) => (opt.duty_comparison[i].title = v)));
  }

  if (clonedReadiness) {
    clonedReadiness.strong.forEach((s, i) => add(s, (v) => (clonedReadiness.strong[i] = v)));
    clonedReadiness.attention.forEach((s, i) => add(s, (v) => (clonedReadiness.attention[i] = v)));
  }

  const translated = await translator(strings, targetLanguage);
  if (!translated || translated.length !== strings.length) return null;
  translated.forEach((t, i) => setters[i](t));

  return { result: clone, readiness: clonedReadiness };
}
