import Link from "next/link";
import { ArrowRight, FileText, ShieldAlert } from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { Button } from "@/components/ui/button";
import type { CodePage } from "@/lib/seo/code-pages";
import type { DutyMeasure } from "@/types";

interface Props {
  page: CodePage;
  /** Live duty for the two destinations we can source officially. */
  duty: { us: DutyMeasure | null; gb: DutyMeasure | null };
}

function DutyCard({
  country,
  measure,
}: {
  country: string;
  measure: DutyMeasure | null;
}) {
  const live = measure && !measure.isPlaceholder;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{country}</h3>
        <span
          className={
            "rounded-md px-2 py-0.5 text-xs font-medium " +
            (live
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
          }
        >
          {live ? "live official rate" : "reference only"}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">
        {measure?.dutyRatePlaceholder ?? "Not available"}
      </p>
      {measure?.vatRatePlaceholder && (
        <p className="mt-1 text-sm text-muted-foreground">
          VAT / sales tax: {measure.vatRatePlaceholder}
        </p>
      )}
      {measure?.source && (
        <p className="mt-3 text-xs text-muted-foreground">
          Source: {measure.source}
          {measure.asOf ? ` · retrieved ${measure.asOf}` : ""}
        </p>
      )}
    </div>
  );
}

/**
 * Reference page for a single HS code. Everything here is framed as a
 * candidate to verify — the code is a starting point, not a ruling.
 */
export function CodePageView({ page, duty }: Props) {
  return (
    <main className="bg-white dark:bg-slate-950">
      <OverlayHeader />

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
            HS code {page.code} · Chapter {page.chapter}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-white">
            {page.title}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{page.description}</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div>
            <h2 className="text-xl font-semibold">Current duty on this code</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Base most-favoured-nation duty, pulled from the official tariff
              schedule when the destination publishes one. It does not include
              country-specific additional tariffs — for a US import those
              (Section 301, the 2025 reciprocal measures) can dwarf the base
              rate, and Kustaro shows them separately on a real classification.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DutyCard country="United States" measure={duty.us} />
              <DutyCard country="United Kingdom" measure={duty.gb} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">What this heading covers</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {page.description} It sits in {page.chapterTitle.toLowerCase()}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {page.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          {page.siblings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Codes it gets confused with</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Neighbouring headings in the same chapter. Most misclassification
                happens between codes this close, so it is worth reading the
                titles side by side before you file.
              </p>
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {page.siblings.map((s) => (
                  <li key={s.code}>
                    <Link
                      href={`/hs-code/${s.slug}`}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40"
                    >
                      <span className="text-sm">
                        <span className="font-mono font-medium">{s.code}</span>{" "}
                        <span className="text-muted-foreground">— {s.title}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-primary" /> Documents to expect
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {page.documents.map((d) => (
                  <li key={d} className="capitalize">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            {page.restrictions.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <ShieldAlert className="h-5 w-5 text-amber-600" /> Watch out for
                </h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {page.restrictions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-lg font-semibold">
              Is {page.code} the right code for your product?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A heading only fits once the details line up — material,
              construction, use and destination. Describe your product and
              Kustaro returns the candidate codes with a confidence score, the
              duty and additional tariffs for your lane, the documents customs
              will ask for, and what is still missing from your file.
            </p>
            <Button asChild className="mt-4">
              <Link href={`/classify?code=${page.slug}`}>Classify your product free</Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              No account needed for the first one.
            </p>
          </div>

          <p className="border-t border-border pt-6 text-xs leading-6 text-muted-foreground">
            This page is reference information, not customs or legal advice. Codes
            and rates shown are candidates and estimates that change over time —
            confirm the classification and the applicable duty with a licensed
            customs broker or the destination customs authority before filing a
            declaration.
          </p>
        </div>
      </section>
    </main>
  );
}
