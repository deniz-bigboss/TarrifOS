import type { Metadata } from "next";
import { Gauge, Layers, ReceiptText } from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { SectionBadge } from "@/components/marketing/section-badge";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Pricing — Kustaro",
};

const TILE_ICONS = [ReceiptText, Gauge, Layers];

export default function PricingPage() {
  const { t } = getI18n();

  return (
    <main className="bg-white dark:bg-slate-950">
      <OverlayHeader />

      {/* ------------------------------------------------ Dark hero band */}
      <section className="relative overflow-hidden bg-slate-950">
        <img
          src="/kustaro-hero.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white">
            {t.pricing.badge}
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            {t.pricing.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            {t.pricing.subtitle}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- Plan cards */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PricingCards />
        </div>
      </section>

      {/* ----------------------------------------------- API metering band */}
      <section className="border-t border-border bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionBadge>{t.pricing.meteringBadge}</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {t.pricing.meteringTitle}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              {t.pricing.meteringBody}
            </p>
          </div>
          <div className="card-shadow rounded-lg border border-border bg-slate-950 p-5 text-white">
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs uppercase text-slate-400">
                {t.pricing.howItWorks}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {t.pricing.notePre}{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  POST /api/v1/classify
                </code>{" "}
                {t.pricing.notePost}
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {t.pricing.tiles.map((label, i) => {
                const Icon = TILE_ICONS[i] ?? ReceiptText;
                return (
                  <div
                    key={label}
                    className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                  >
                    <Icon className="mb-3 h-4 w-4 text-blue-300" />
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------- Compliance disclaimer */}
      <section className="bg-white px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t.disclaimer}
        </div>
      </section>
    </main>
  );
}
