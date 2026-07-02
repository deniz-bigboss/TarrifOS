import type {
  ClassificationResult,
  PlanAction,
  PlanCheckpoint,
  PlanDocument,
  PlanPriority,
  PlanTimelineStage,
  ProductInput,
  ShipmentPlan,
} from "@/types";
import { countryName } from "@/lib/utils";

/**
 * generateShipmentPlan — the "shipping operations agent" layer.
 *
 * Turns a finished classification into a prioritized shipment execution plan:
 * agent next actions (owner/timing/priority), a document checklist, compliance
 * checkpoints, a stage timeline, cost levers, and a heuristic readiness score.
 *
 * Everything here is DERIVED deterministically from the pipeline's existing
 * outputs (review flags, missing documents, missing information, warnings,
 * cost optimization) — no extra AI call, no new failure modes, and identical
 * behavior across mock and real providers. It runs after validation, so it
 * sees the final reconciled result.
 */
export function generateShipmentPlan(
  input: ProductInput,
  result: ClassificationResult,
): ShipmentPlan {
  const documents = buildDocumentChecklist(result);
  const actions = buildActions(input, result, documents);
  const checkpoints = buildCheckpoints(input, result, documents);
  const costLevers = buildCostLevers(input, result);
  const timeline = buildTimeline(input, result, documents);
  const { score, label } = readiness(result, documents);

  return {
    summary: buildSummary(input, result, actions, score),
    readiness_score: score,
    readiness_label: label,
    actions,
    documents,
    checkpoints,
    timeline,
    cost_levers: costLevers,
    disclaimer:
      "This plan is generated from the classification result and available shipment data. Owners and timings are suggestions for a typical import workflow — adapt them to your organization. It is not legal advice.",
  };
}

// --------------------------------------------------------------------------
// Documents
// --------------------------------------------------------------------------

const DOCUMENT_META: { match: RegExp; owner: string; reason: string }[] = [
  {
    match: /commercial invoice/i,
    owner: "Importer",
    reason: "Needed to support customs value, seller/buyer identity, quantity, and currency.",
  },
  {
    match: /packing list/i,
    owner: "Importer",
    reason: "Needed to reconcile cartons, weights, quantities, and shipment handling details.",
  },
  {
    match: /certificate of origin|a\.tr|eur\.1|origin declaration/i,
    owner: "Supplier",
    reason: "Needed to support origin claims, duty treatment, and preferential-rate review.",
  },
  {
    match: /declaration of conformity|ce\b|ukca/i,
    owner: "Importer",
    reason: "Needed to evidence product-safety conformity for the destination market.",
  },
  {
    match: /un38\.3|dangerous goods/i,
    owner: "Supplier",
    reason: "Needed for dangerous-goods transport acceptance (batteries/chemicals).",
  },
  {
    match: /safety data sheet|sds/i,
    owner: "Supplier",
    reason: "Needed for chemical/battery handling, transport, and border compliance.",
  },
  {
    match: /health certificate|veterinary|phytosanitary|catch certificate/i,
    owner: "Supplier",
    reason: "Needed for sanitary/phytosanitary border controls on this product category.",
  },
  {
    match: /ingredient|inci|composition/i,
    owner: "Supplier",
    reason: "Needed to confirm composition for classification and product-safety review.",
  },
  {
    match: /licence|license|authorisation|permit/i,
    owner: "Importer",
    reason: "Needed before controlled or restricted goods can legally move.",
  },
];

function buildDocumentChecklist(result: ClassificationResult): PlanDocument[] {
  return result.required_documents.map((name) => {
    const meta = DOCUMENT_META.find((m) => m.match.test(name));
    return {
      name,
      owner: meta?.owner ?? "Importer",
      // Document upload/extraction is still a placeholder, so everything the
      // classification calls for starts as "missing" until confirmed.
      status: "missing" as const,
      reason:
        meta?.reason ??
        "Requested for this product category — confirm the exact requirement with your broker.",
    };
  });
}

// --------------------------------------------------------------------------
// Actions
// --------------------------------------------------------------------------

function buildActions(
  input: ProductInput,
  result: ClassificationResult,
  documents: PlanDocument[],
): PlanAction[] {
  const actions: PlanAction[] = [];
  const missingDocs = documents.filter((d) => d.status === "missing");
  const dataQuality = result.restriction_warnings.filter((w) =>
    w.startsWith("Data quality"),
  );
  const complianceWarnings = result.restriction_warnings.filter(
    (w) => !w.startsWith("Data quality"),
  );

  if (result.human_review_required) {
    actions.push({
      title: "Confirm the recommended HS code with a broker before filing",
      priority: "critical",
      owner: "Trade compliance",
      timing: "Before customs entry",
      context: result.human_review_reason || "The result was flagged for human review.",
      impact: "Reduces misclassification, customs delay, and post-entry correction risk.",
    });
  }

  if (dataQuality.length > 0) {
    actions.push({
      title: "Correct the flagged declared value / weight figures",
      priority: "high",
      owner: "Operations",
      timing: "Today",
      context: dataQuality[0],
      impact: "Prevents valuation queries and penalties triggered by inconsistent declarations.",
    });
  }

  if (missingDocs.length > 0) {
    actions.push({
      title: "Build the customs filing pack from the document checklist",
      priority: "high",
      owner: "Operations",
      timing: "Before carrier handoff",
      context: `${missingDocs.length} document item${missingDocs.length === 1 ? " is" : "s are"} still missing.`,
      impact: "Prevents broker back-and-forth and improves first-pass clearance readiness.",
    });
  }

  if (result.missing_information.length > 0) {
    actions.push({
      title: "Collect unanswered product facts from supplier or product team",
      priority: "high",
      owner: "Product operations",
      timing: "Today",
      context: result.missing_information.slice(0, 2).join(" "),
      impact: "Improves classification confidence and prevents avoidable manual review.",
    });
  }

  if (complianceWarnings.length > 0) {
    actions.push({
      title: "Run compliance gate for restrictions, labels, permits, and product claims",
      priority: "critical",
      owner: "Compliance",
      timing: "Before booking freight",
      context: complianceWarnings[0],
      impact: "Avoids shipments moving before license, labeling, or controlled-goods questions are resolved.",
    });
  }

  if (input.declared_value != null && input.declared_value > 0) {
    const unit =
      input.quantity && input.quantity > 0
        ? Math.round((input.declared_value / input.quantity) * 100) / 100
        : input.declared_value;
    actions.push({
      title: "Validate invoice value basis against quantity and unit price",
      priority: "medium",
      owner: "Finance",
      timing: "Before document handoff",
      context: `Declared unit value is ${unit} ${input.currency ?? ""}.`.trim() + ".",
      impact: "Reduces valuation disputes, incorrect duty estimates, and margin surprises.",
    });
  }

  actions.push({
    title: "Create a broker handoff note from the generated explanation",
    priority: result.human_review_required ? "critical" : "medium",
    owner: "Operations",
    timing: "Before customs filing",
    context: "Broker-ready explanation is available in the report export.",
    impact: "Cuts manual briefing time and gives brokers a clear audit trail.",
  });

  return sortByPriority(actions);
}

// --------------------------------------------------------------------------
// Checkpoints
// --------------------------------------------------------------------------

function buildCheckpoints(
  input: ProductInput,
  result: ClassificationResult,
  documents: PlanDocument[],
): PlanCheckpoint[] {
  const missingDocs = documents.filter((d) => d.status === "missing");
  const complianceWarnings = result.restriction_warnings.filter(
    (w) => !w.startsWith("Data quality"),
  );

  const checkpoints: PlanCheckpoint[] = [
    {
      title: "Classification sign-off",
      severity: result.human_review_required ? "critical" : "medium",
      status_note: result.recommended_code
        ? `Recommended code ${result.recommended_code} is the working basis for customs filing.`
        : "No confident code was produced — a broker must classify this product.",
      instruction: result.human_review_required
        ? "Send the result and product facts to a qualified broker before booking."
        : "Have a broker confirm the recommended code before the first filing; reuse it for repeat shipments once accepted.",
    },
    {
      title: "Valuation and quantity reconciliation",
      severity: "medium",
      status_note:
        input.declared_value != null
          ? "Invoice value, quantity, unit price, and currency should reconcile cleanly."
          : "No declared value was provided — valuation basis is still open.",
      instruction: "Compare the generated unit-value note with the supplier invoice.",
    },
    {
      title: "Document readiness",
      severity: missingDocs.length > 0 ? "high" : "low",
      status_note:
        missingDocs.length > 0
          ? `${missingDocs.length} checklist item${missingDocs.length === 1 ? " is" : "s are"} still marked missing.`
          : "All checklist documents are accounted for.",
      instruction:
        missingDocs.length > 0
          ? `Collect ${missingDocs.slice(0, 3).map((d) => d.name).join(", ")}${missingDocs.length > 3 ? ", …" : ""}.`
          : "Hand the document pack to your broker with the classification report.",
    },
    {
      title: "Regulated goods review",
      severity: complianceWarnings.length > 0 ? "critical" : "low",
      status_note:
        complianceWarnings.length > 0
          ? complianceWarnings[0]
          : "No regulated-goods triggers were detected for this product.",
      instruction:
        complianceWarnings.length > 0
          ? "Confirm permits, product claims, labeling, safety data, and market-entry obligations before shipment."
          : "No action needed unless the product specification changes.",
    },
  ];

  return checkpoints;
}

// --------------------------------------------------------------------------
// Cost levers
// --------------------------------------------------------------------------

function buildCostLevers(
  input: ProductInput,
  result: ClassificationResult,
): PlanAction[] {
  const levers: PlanAction[] = [];
  const opt = result.cost_optimization;

  levers.push({
    title: "Compare landed-cost scenarios before committing the purchase order",
    priority: "high",
    owner: "Finance",
    timing: "Before PO approval",
    context: `Use the recommended code ${result.recommended_code || "—"}, destination ${input.destination_country}, and the current duty placeholder as the calculation basis.`,
    impact: "Makes margin impact visible before the shipment becomes hard to change.",
  });

  const applicablePrograms = opt?.trade_programs.filter((p) => p.may_apply) ?? [];
  levers.push({
    title: "Check origin documentation for preferential duty opportunities",
    priority: applicablePrograms.length > 0 ? "high" : "medium",
    owner: "Supplier",
    timing: "Before invoice finalization",
    context:
      applicablePrograms.length > 0
        ? `${applicablePrograms[0].name} may apply — proof required: ${applicablePrograms[0].proof_required}.`
        : `${input.origin_country} → ${input.destination_country} may require origin evidence before any preferential treatment can be considered.`,
    impact: "Can reduce duty exposure when a valid trade program or origin claim applies.",
  });

  levers.push({
    title: "Benchmark carrier quotes and consolidation options",
    priority: "medium",
    owner: "Logistics",
    timing: "Before booking",
    context: input.shipping_method
      ? `Current method is ${input.shipping_method} freight.`
      : "No shipping method selected yet.",
    impact: "Improves freight pricing and reduces minimum-charge waste.",
  });

  const shipmentWeight =
    input.unit_weight != null && input.quantity != null
      ? input.unit_weight * input.quantity
      : null;
  if (shipmentWeight != null && shipmentWeight > 0 && shipmentWeight < 30) {
    levers.push({
      title: "Consolidate low-weight shipments where delivery promises allow",
      priority: "low",
      owner: "Logistics",
      timing: "Before pickup",
      context: `Estimated shipment weight is ${Math.round(shipmentWeight * 10) / 10} kg.`,
      impact: "Avoids small-shipment minimums and duplicated customs/broker fees.",
    });
  }

  return sortByPriority(levers);
}

// --------------------------------------------------------------------------
// Timeline
// --------------------------------------------------------------------------

function buildTimeline(
  input: ProductInput,
  result: ClassificationResult,
  documents: PlanDocument[],
): PlanTimelineStage[] {
  const missingDocs = documents.filter((d) => d.status === "missing");
  const today: string[] = [
    "Lock product facts, material composition, intended use, and commercial value basis.",
  ];
  if (result.human_review_required) {
    today.push("Send the classification result for broker review.");
  }
  if (result.missing_information.length > 0) {
    today.push("Answer the open product questions listed below.");
  }

  const beforeBooking: string[] = [
    input.shipping_method
      ? `Benchmark ${input.shipping_method} freight against at least one alternative service.`
      : "Choose a shipping method and benchmark at least two carrier quotes.",
  ];
  if (result.restriction_warnings.length > 0) {
    beforeBooking.push("Resolve restriction, license, label, or product-claim questions.");
  }

  const beforeHandoff: string[] = [];
  if (missingDocs.length > 0) {
    beforeHandoff.push(
      `Collect missing documents: ${missingDocs.map((d) => d.name).join(", ")}.`,
    );
  }
  beforeHandoff.push(
    "Share the broker-ready explanation and candidate codes with the customs broker.",
  );

  return [
    { stage: "Today", tasks: today },
    { stage: "Before booking freight", tasks: beforeBooking },
    { stage: "Before carrier handoff", tasks: beforeHandoff },
    {
      stage: "After clearance",
      tasks: [
        "Record the final broker/authority decision in the feedback loop.",
        "Reuse the accepted classification and document pack for repeat shipments.",
      ],
    },
  ];
}

// --------------------------------------------------------------------------
// Readiness + summary
// --------------------------------------------------------------------------

function readiness(
  result: ClassificationResult,
  documents: PlanDocument[],
): { score: number; label: ShipmentPlan["readiness_label"] } {
  let score = 100;
  const missingDocs = documents.filter((d) => d.status === "missing").length;

  if (result.human_review_required) score -= 30;
  score -= Math.min(32, missingDocs * 8);
  score -= Math.min(15, result.missing_information.length * 5);
  if (result.restriction_warnings.some((w) => w.startsWith("Data quality"))) score -= 10;
  if (result.confidence < 0.5) score -= 10;

  score = Math.max(5, Math.min(95, Math.round(score)));

  const label: ShipmentPlan["readiness_label"] =
    score < 45 ? "blocked" : score < 75 ? "in progress" : "ready for broker review";
  return { score, label };
}

function buildSummary(
  input: ProductInput,
  result: ClassificationResult,
  actions: PlanAction[],
  _score: number,
): string {
  const lane = `${countryName(input.origin_country)} (${input.origin_country}) → ${countryName(input.destination_country)} (${input.destination_country})`;
  const topPriority = actions[0]?.title ?? "Review the classification result";
  const bits: string[] = [];
  if (input.shipping_method) bits.push(`method: ${input.shipping_method} freight`);
  if (input.declared_value != null && input.quantity && input.quantity > 0) {
    bits.push(
      `unit value: ${Math.round((input.declared_value / input.quantity) * 100) / 100} ${input.currency ?? ""}`.trim(),
    );
  }
  if (input.unit_weight != null && input.quantity != null) {
    bits.push(
      `estimated shipment weight: ${Math.round(input.unit_weight * input.quantity * 10) / 10} kg`,
    );
  }
  if (result.duty_estimate?.duty_rate_placeholder) {
    bits.push(`duty basis: ${result.duty_estimate.duty_rate_placeholder}`);
  }

  return (
    `TariffOS is treating this as a ${lane} shipment plan for ${input.product_name}. ` +
    `The working classification is ${result.recommended_code || "not yet confirmed"}${result.recommended_title ? ` (${result.recommended_title})` : ""}. ` +
    `Top priority: ${topPriority}.` +
    (bits.length ? ` ${bits.join("; ")}.` : "")
  );
}

// --------------------------------------------------------------------------

const PRIORITY_ORDER: Record<PlanPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortByPriority<T extends { priority: PlanPriority }>(items: T[]): T[] {
  return [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}
