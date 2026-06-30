import {
  AlertTriangle,
  FileText,
  HelpCircle,
  Layers,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import type { ClassificationResult, ProductInput } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { HumanReviewBadge } from "@/components/human-review-badge";
import { DisclaimerBanner } from "@/components/disclaimer";
import { ExportButtons } from "./export-buttons";
import { countryName, formatCurrency } from "@/lib/utils";

interface ResultViewProps {
  input: ProductInput;
  result: ClassificationResult;
  classificationId: string;
  createdAt?: string;
}

export function ResultView({
  input,
  result,
  classificationId,
  createdAt,
}: ResultViewProps) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Recommended code</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-bold tracking-tight">
                  {result.recommended_code || "—"}
                </span>
                <HumanReviewBadge required={result.human_review_required} />
              </div>
              <p className="text-muted-foreground">{result.recommended_title}</p>
            </div>
            <div className="w-full max-w-xs">
              <ConfidenceMeter
                confidence={result.confidence}
                label={result.confidence_label}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>
              Lane:{" "}
              <span className="font-medium text-foreground">
                {countryName(input.origin_country)} → {countryName(input.destination_country)}
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

          {result.human_review_required && result.human_review_reason && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="font-medium text-foreground">Human review required</p>
                <p className="text-muted-foreground">{result.human_review_reason}</p>
              </div>
            </div>
          )}

          <Separator />
          <ExportButtons
            input={input}
            result={result}
            classificationId={classificationId}
            createdAt={createdAt}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reasoning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" /> Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{result.reasoning_summary}</p>
            {result.key_factors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Key factors
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.key_factors.map((f) => (
                    <Badge key={f} variant="secondary">{f}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" /> Alternative codes
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <Badge variant="outline">
                        {Math.round(alt.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{alt.title}</p>
                    <p className="text-xs text-muted-foreground">{alt.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Required documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" /> Required documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {result.required_documents.length === 0 ? (
                <li className="text-muted-foreground">No documents listed.</li>
              ) : (
                result.required_documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="capitalize">{doc}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-warning" /> Restrictions & warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.restriction_warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No restrictions on record for the recommended code.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {result.restriction_warnings.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-2"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Duty estimate */}
      {result.duty_estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duty / tax estimate (placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <span>
                Duty rate:{" "}
                <span className="font-medium">{result.duty_estimate.duty_rate_placeholder}</span>
              </span>
              {result.duty_estimate.vat_rate_placeholder && (
                <span>
                  VAT / tax:{" "}
                  <span className="font-medium">{result.duty_estimate.vat_rate_placeholder}</span>
                </span>
              )}
              {result.duty_estimate.estimated_duty_value != null && (
                <span>
                  Estimated duty:{" "}
                  <span className="font-medium">
                    {formatCurrency(
                      result.duty_estimate.estimated_duty_value,
                      result.duty_estimate.currency ?? "USD",
                    )}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              These figures are placeholders. Connect an official tariff source
              for binding duty/tax treatment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missing information */}
      {result.missing_information.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" /> Missing information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {result.missing_information.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Broker-ready explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Broker-ready explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {result.broker_ready_explanation}
          </div>
        </CardContent>
      </Card>

      <DisclaimerBanner text={result.disclaimer} />
    </div>
  );
}
