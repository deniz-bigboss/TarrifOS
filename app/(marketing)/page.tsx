import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { SectionBadge } from "@/components/marketing/section-badge";
import { PLANS } from "@/lib/billing/plans";
import { getI18n } from "@/lib/i18n/server";

/* Kustaro landing page: full-viewport dark hero with the customs-readiness
   positioning, the "Not just an HS-code guess" comparison band, then
   Problem / How it works / Who it's for / Example output / Pricing preview
   and the compliance disclaimer. All copy is localized from lib/i18n. */

const PLAN_PREVIEW = ["free", "starter", "pro"] as const;

export default function LandingPage() {
  const { t } = getI18n();

  return (
    <main className="bg-white dark:bg-slate-950">
      <OverlayHeader />

      {/* -------------------------------------------------------- Hero */}
      <section className="relative min-h-[92vh] overflow-hidden bg-slate-950">
        <img
          src="/kustaro-hero.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.78]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white">
              {t.hero.badge}
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {t.hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              {t.hero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/classify"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                {t.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/bulk-upload"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-base font-medium text-white shadow-sm transition-colors hover:bg-white/20"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>
            <p className="mt-6 max-w-2xl text-sm text-slate-300">{t.hero.trust}</p>
          </div>
        </div>
      </section>

      {/* --------------------------------- Not just an HS-code guess */}
      <section className="border-b border-border bg-white px-4 py-16 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionBadge>{t.compare.badge}</SectionBadge>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {t.compare.heading}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-slate-50 p-6 dark:bg-slate-900/50">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.compare.genericTitle}
              </p>
              <ul className="mt-4 space-y-3">
                {t.compare.genericRows.map((row) => (
                  <li key={row} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {row}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-shadow rounded-lg border border-primary/30 bg-white p-6 ring-1 ring-primary/20 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t.compare.kustaroTitle}
              </p>
              <ul className="mt-4 space-y-3">
                {t.compare.kustaroRows.map((row) => (
                  <li key={row} className="flex items-start gap-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {row}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Problem */}
      <section className="border-b border-border bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionBadge>{t.problem.badge}</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {t.problem.heading}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {t.problem.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-slate-900"
              >
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {card.title}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Workflow */}
      <section id="workflow" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionBadge>{t.workflow.badge}</SectionBadge>
          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {t.workflow.steps.map((step, i) => (
              <div
                key={step}
                className="rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-slate-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-semibold text-primary">
                  {i + 1}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Customers */}
      <section
        id="customers"
        className="border-y border-border bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <SectionBadge>{t.customers.badge}</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {t.customers.heading}
            </h2>
          </div>
          <div className="grid gap-3">
            {t.customers.rows.map((row) => (
              <div
                key={row}
                className="flex items-center gap-3 rounded-md border border-border bg-white p-4 dark:bg-slate-900"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {row}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- Example output */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionBadge>{t.example.badge}</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {t.example.heading}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              {t.example.body}
            </p>
          </div>
          <div className="card-shadow rounded-lg border border-border bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase text-slate-400">
                  {t.example.readiness}
                </p>
                <p className="mt-1 text-2xl font-semibold">78/100</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                {t.example.ready}
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {t.example.actions.map((action) => (
                <div
                  key={action}
                  className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                >
                  <FileText className="mb-3 h-4 w-4 text-teal-300" />
                  {action}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              {t.example.planText}
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------- Pricing preview */}
      <section className="border-t border-border bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div>
            <SectionBadge>{t.pricingPreview.badge}</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
              {t.pricingPreview.heading}
            </h2>
          </div>
          {PLAN_PREVIEW.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-border bg-white p-5 shadow-sm dark:bg-slate-900"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                {PLANS[id].name}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t.pricingPreview.plans[id]}
              </p>
            </div>
          ))}
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
