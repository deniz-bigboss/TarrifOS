import { cn } from "@/lib/utils";
import type { ConfidenceLabel } from "@/types";

interface ConfidenceMeterProps {
  confidence: number; // 0..1
  label: ConfidenceLabel;
  className?: string;
}

const COLOR: Record<ConfidenceLabel, string> = {
  high: "bg-success",
  medium: "bg-warning",
  low: "bg-destructive",
};

const TEXT: Record<ConfidenceLabel, string> = {
  high: "text-success",
  medium: "text-warning",
  low: "text-destructive",
};

/** Visual confidence score: a labelled progress bar with the percentage. */
export function ConfidenceMeter({
  confidence,
  label,
  className,
}: ConfidenceMeterProps) {
  const pct = Math.round(confidence * 100);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Confidence</span>
        <span className={cn("font-semibold", TEXT[label])}>
          {pct}% · {label}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", COLOR[label])}
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
    </div>
  );
}
