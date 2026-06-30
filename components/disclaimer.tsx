import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_DISCLAIMER } from "@/types";

export function DisclaimerBanner({
  className,
  text = LEGAL_DISCLAIMER,
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p>{text}</p>
    </div>
  );
}
