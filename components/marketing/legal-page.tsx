import { OverlayHeader } from "@/components/marketing/overlay-header";
import { getI18n } from "@/lib/i18n/server";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/**
 * Shared frame for the legal documents (/privacy, /terms): dark hero band with
 * the overlay header, the localized "English is authoritative" note, then the
 * English body. Legal body text is deliberately NOT translated — a single
 * authoritative text avoids eight subtly-diverging contracts.
 */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  const { t } = getI18n();

  return (
    <main className="bg-white dark:bg-slate-950">
      <OverlayHeader />
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-normal text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {t.legal.lastUpdated}: {updated}
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <p className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            {t.legal.authoritativeNote}
          </p>

          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                {s.heading}
              </h2>
              {s.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300"
                >
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
