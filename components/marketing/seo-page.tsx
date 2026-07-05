import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  ClipboardList,
  FileText,
  Info,
} from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getI18n } from "@/lib/i18n/server";
import type { SeoPage } from "@/lib/seo/pages";

/** Shared renderer for the long-tail SEO pages (English content). */
export function SeoPageView({ page }: { page: SeoPage }) {
  const { t } = getI18n();
  return (
    <main className="bg-white dark:bg-slate-950">
      <OverlayHeader />

      <section className="bg-slate-950 px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">{page.intro}</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Example product
            </p>
            <p className="mt-2 font-medium">{page.exampleProduct}</p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {page.familyNote}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <ClipboardList className="h-4 w-4 text-primary" /> Information you'll need
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {page.requiredInfo.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <CircleAlert className="h-4 w-4 text-warning" /> Commonly missing details
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {page.commonMissing.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Typical document checklist
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {page.documents.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-primary/30 bg-accent/40 p-6 text-center">
            <p className="text-lg font-semibold">Classify your product in Kustaro</p>
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
              Get HS-code candidates with reasoning, a confidence score, open
              questions, a document checklist, and a customs-readiness report —
              your first classification is free, no signup.
            </p>
            <Link
              href="/classify"
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Start free classification <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">{t.disclaimer}</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
