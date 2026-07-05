import { CheckCircle2, CircleAlert, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readinessLabel, type ReadinessBreakdown } from "@/lib/scoring/readiness";
import { cn } from "@/lib/utils";

const BAR: Record<"low" | "medium" | "high", string> = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-destructive",
};

/** Customs-readiness score (0–100): how prepared this shipment is for a
 * customs review — never a statement of legal certainty. */
export function ReadinessCard({ readiness }: { readiness: ReadinessBreakdown }) {
  const label = readinessLabel(readiness.score);
  return (
    <Card>
      <CardHeader className="border-b border-border p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-primary" /> Customs-readiness score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold tracking-tight">
            {readiness.score}
            <span className="text-base font-medium text-muted-foreground">/100</span>
          </span>
          <span
            className={cn(
              "text-sm font-semibold capitalize",
              label === "high" && "text-success",
              label === "medium" && "text-warning",
              label === "low" && "text-destructive",
            )}
          >
            {label} readiness
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-all", BAR[label])}
            style={{ width: `${Math.max(4, readiness.score)}%` }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Strong
            </p>
            <ul className="space-y-1.5 text-sm">
              {readiness.strong.length === 0 && (
                <li className="text-muted-foreground">—</li>
              )}
              {readiness.strong.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Needs attention
            </p>
            <ul className="space-y-1.5 text-sm">
              {readiness.attention.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The readiness score is a preparation indicator for review — it is not
          legal certainty and does not guarantee acceptance by customs
          authorities.
        </p>
      </CardContent>
    </Card>
  );
}
