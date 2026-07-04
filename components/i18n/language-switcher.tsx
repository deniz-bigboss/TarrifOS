"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Manual language switcher. Sets the NEXT_LOCALE cookie and refreshes so the
 * server re-renders in the chosen language. The chosen locale sticks (the
 * geo-detection middleware never overrides an existing cookie).
 */
export function LanguageSwitcher({
  current,
  className,
  tone = "light",
}: {
  current: Locale;
  className?: string;
  /** "dark" for the transparent header over the hero; "light" for the app. */
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value as Locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-1.5",
        pending && "opacity-60",
        className,
      )}
    >
      <Globe
        className={cn(
          "pointer-events-none absolute left-2 h-3.5 w-3.5",
          tone === "dark" ? "text-white/80" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <span className="sr-only">Language</span>
      <select
        value={current}
        onChange={onChange}
        aria-label="Language"
        className={cn(
          "h-9 appearance-none rounded-md border pl-7 pr-7 text-sm font-medium outline-none transition-colors",
          tone === "dark"
            ? "border-white/25 bg-white/10 text-white hover:bg-white/20 [&>option]:text-slate-900"
            : "border-border bg-background text-foreground hover:bg-muted",
        )}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
