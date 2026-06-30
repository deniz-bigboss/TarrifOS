import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
>;

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, disabled, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type="checkbox"
        ref={ref}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-secondary transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          className,
        )}
      />
      <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  ),
);
Switch.displayName = "Switch";

export { Switch };
