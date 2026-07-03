"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle. Stateless on purpose: the current theme lives only in
 * the <html> class (applied before first paint by the inline script in the
 * root layout), and the Sun/Moon icons swap via dark: CSS — so the server
 * and client always render identical markup, with no hydration mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted",
        className,
      )}
      onClick={() => {
        const root = document.documentElement;
        const dark = root.classList.toggle("dark");
        try {
          localStorage.setItem("theme", dark ? "dark" : "light");
        } catch {
          // private-mode storage failures are fine — the toggle still works
        }
      }}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
