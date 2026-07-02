import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  FileText,
  Files,
  HelpCircle,
  Layers,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import type {
  ClassificationResult,
  PlanAction,
  PlanPriority,
  ProductInput,
  ShipmentPlan,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { DisclaimerBanner } from "@/components/disclaimer";
import { ExportButtons } from "./export-buttons";
import { countryName, formatCurrency } from "@/lib/utils";

interface ResultViewProps {
  input: ProductInput;
  result: ClassificationResult;
  classificationId: string;
  createdAt?: string;
}

const PRIORITY_VARIANT: Record<
  PlanPriority,
  "destructive" | "warning" | "default" | "secondary"
> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "secondary",
};

function PriorityChip({ priority }: { priority: PlanPriority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>;
}

export function ResultView({
  input,
  result,
  classificationId,
  createdAt,
}: ResultViewProps) {
  const plan = result.shipment_plan;

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- Header grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="border-b border-border p-5">
            <p className="text-sm text-muted-foreground">
              Shipment plan for
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-foreground">
                {result.recommended_code || "—"}
              </span>
              <span className="text-sm text-muted-foreground">
                {result.recommended_title}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <ExportButtons
              input={input}
              result={result}
              classificationId={classificationId}
              createdAt={createdAt}
            />
            <ConfidenceMeter
              confidence={result.confidence}
              label={result.confidence_label}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              {result.reasoning_summary}
            </p>
            <div className="rounded-md border bg-muted/60 p-4 text-sm">
              <p className="font-semibold text-foreground">
                Duty / tax estimate placeholder
              </p>
              <p className="mt-2 text-muted-foreground">
                {result.duty_estimate
                  ? [
                      `Duty rate: ${result.duty_estimate.duty_rate_placeholder}`,
                      result.duty_estimate.vat_rate_placeholder
                        ? `VAT/tax: ${result.duty_estimate.vat_rate_placeholder}`
                        : null,
                      result.duty_estimate.estimated_duty_value != null
                        ? `Estimated duty: ${formatCurrency(result.duty_estimate.estimated_duty_value, result.duty_estimate.currency ?? "USD")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "Connect an official tariff source for duty and tax figures."}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>
                Lane:{" "}
                <span className="font-medium text-foreground">
                  {countryName(input.origin_country)} →{" "}
                  {countryName(input.destination_country)}
                </span>
              </span>
              <span>
                Direction:{" "}
                <span className="font-medium text-foreground">
                  {input.import_or_export ?? "import"}
                </span>
              </span>
              {input.declared_value != null && (
                <span>
                  Declared value:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(input.declared_value, input.currency ?? "USD")}
                  </span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Human review card */}
        <Card
          className={
            result.human_review_required
              ? "border-amber-300 bg-amber-50"
              : "border-emerald-200 bg-emerald-50/60"
          }
        >
          <CardHeader className="border-b border-border p-5">
            <CardTitle className="flex items-center gap-3 text-base">
              {result.human_review_required ? (
                <ShieldAlert className="h-6 w-6 text-amber-700" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
              )}
              Human review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <Badge variant={result.human_review_required ? "warning" : "success"}>
              {result.human_review_required ? "required" : "auto-cleared"}
            </Badge>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {result.human_review_required
                ? result.human_review_reason
                : "No high-risk category or low-confidence trigger fired. Confirm the code with your broker before the first filing; reuse it for repeat shipments once accepted."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------- Shipment execution plan */}
      {plan && (
        <section className="space-y-5">
          <div className="overflow-hidden rounded-lg border border-slate-900 bg-slate-950 text-white card-shadow">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-300">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Shipping operations agent
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Shipment execution plan
                    </h2>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                      {plan.summary}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Readiness
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {plan.readiness_score}%
                  </p>
                  <p
                    className={
                      "mt-1 text-sm font-medium " +
                      (plan.readiness_label === "blocked"
                        ? "text-amber-300"
                        : "text-emerald-300")
                    }
                  >
                    {plan.readiness_label}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-6 md:grid-cols-3">
              {[
                ["Next actions", plan.actions.length],
                ["Document tasks", plan.documents.filter((d) => d.status === "missing").length],
                ["Compliance checkpoints", plan.checkpoints.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions + documents */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Agent next actions</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prioritized operating steps for the shipment team.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {plan.actions.map((a) => (
                  <ActionItem key={a.title} action={a} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Files className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Document checklist</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    What the broker or internal team will ask for.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {plan.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No documents listed for this code.
                  </p>
                ) : (
                  plan.documents.map((d) => (
                    <div key={d.name} className="rounded-md border bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold capitalize text-foreground">
                          {d.name}
                        </p>
                        <Badge variant={d.status === "missing" ? "warning" : "success"}>
                          {d.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Owner: <span className="font-medium">{d.owner}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {d.reason}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost levers + checkpoints */}
          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <TrendingDown className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Cost-reduction levers</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Actions that can protect margin before shipment movement.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {plan.cost_levers.map((a) => (
                  <ActionItem key={a.title} action={a} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <ListChecks className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Compliance checkpoints</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gates to clear before the shipment is filed.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {plan.checkpoints.map((c) => (
                  <div key={c.title} className="rounded-md border bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <PriorityChip priority={c.severity} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {c.status_note}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6 text-emerald-800">
                      {c.instruction}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base">Shipment timeline</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stage-by-stage tasks from today through clearance.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
              {plan.timeline.map((stage) => (
                <div key={stage.stage} className="rounded-md border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {stage.stage}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {stage.tasks.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* -------------------------------------------- Analysis sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Alternatives */}
        <Card>
          <CardHeader className="border-b border-border p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" /> Alternative candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {result.alternative_codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No close alternatives were identified.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.alternative_codes.map((alt) => (
                  <li key={alt.code} className="rounded-md border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{alt.code}</span>
                      <Badge variant="outline">{Math.round(alt.confidence * 100)}%</Badge>
                    </div>
                    <p className="text-sm font-medium">{alt.title}</p>
                    <p className="text-xs text-muted-foreground">{alt.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Key factors + missing info */}
        <Card>
          <CardHeader className="border-b border-border p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" /> Key classification factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {result.key_factors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.key_factors.map((f) => (
                  <Badge key={f} variant="secondary">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
            {result.missing_information.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <HelpCircle className="h-3.5 w-3.5" /> Open questions
                </p>
                <ul className="space-y-1.5 text-sm">
                  {result.missing_information.map((q) => (
                    <li key={q} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Duty comparison from cost optimization (richer than the levers) */}
      {result.cost_optimization &&
        result.cost_optimization.duty_comparison.length > 0 && (
          <Card>
            <CardHeader className="border-b border-border p-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-primary" /> Duty by candidate code
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Code</th>
                      <th className="px-3 py-2 text-left font-medium">Title</th>
                      <th className="px-3 py-2 text-left font-medium">Duty rate</th>
                      <th className="px-3 py-2 text-right font-medium">Est. duty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cost_optimization.duty_comparison.map((d) => (
                      <tr
                        key={d.code}
                        className={`border-t ${d.is_recommended ? "bg-emerald-50/60" : ""}`}
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          {d.code}
                          {d.is_recommended && (
                            <Badge variant="success" className="ml-2">
                              recommended
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{d.title}</td>
                        <td className="px-3 py-2 text-xs">{d.duty_rate_placeholder}</td>
                        <td className="px-3 py-2 text-right text-xs">
                          {d.estimated_duty_value != null
                            ? formatCurrency(d.estimated_duty_value, input.currency ?? "USD")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {result.cost_optimization.disclaimer}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Restrictions */}
      <Card>
        <CardHeader className="border-b border-border p-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-warning" /> Restrictions & warnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {result.restriction_warnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No restrictions on record for the recommended code.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {result.restriction_warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                  <span className="text-amber-900">{w}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Legacy fallback: plans generated before the shipment-plan layer */}
      {!plan && result.required_documents.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" /> Required documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <ul className="space-y-1.5 text-sm">
              {result.required_documents.map((doc) => (
                <li key={doc} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="capitalize">{doc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Broker-ready explanation */}
      <Card>
        <CardHeader className="border-b border-border p-5">
          <CardTitle className="text-base">Broker-ready explanation</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {result.broker_ready_explanation}
          </div>
        </CardContent>
      </Card>

      <DisclaimerBanner text={result.disclaimer} />
    </div>
  );
}

function ActionItem({ action }: { action: PlanAction }) {
  return (
    <div className="rounded-md border bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
        <span className="shrink-0">
          <PriorityChip priority={action.priority} />
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="font-semibold text-foreground">Owner:</span> {action.owner}
        </p>
        <p>
          <span className="font-semibold text-foreground">Timing:</span> {action.timing}
        </p>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{action.context}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-emerald-800">
        {action.impact}
      </p>
    </div>
  );
}
