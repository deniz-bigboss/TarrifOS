import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { SectionBadge } from "@/components/marketing/section-badge";
import { PLANS } from "@/lib/billing/plans";
import { LEGAL_DISCLAIMER } from "@/types";

/* Landing page replicating the operations-console marketing design:
   a transparent header floating over a full-viewport dark port hero,
   followed by Problem / Workflow / Customers / Example output /
   Pricing preview bands and the amber compliance disclaimer. */

const PROBLEM_CARDS = [
  {
    title: "Classification uncertainty",
    body: "Product titles rarely map cleanly to an HS code. TariffOS grounds every recommendation in evidence, confidence scores, and review gates.",
  },
  {
    title: "Missing documents",
    body: "Certificates and origin proofs usually surface at the border. TariffOS builds the document checklist before you book, not after.",
  },
  {
    title: "Late landed-cost surprises",
    body: "Duty, VAT, and fees tend to appear after the deal is priced. TariffOS estimates them up front and suggests legitimate cost levers.",
  },
];

const WORKFLOW_STEPS = [
  "Normalize product and trade-lane data",
  "Retrieve seed HS-style candidates",
  "Generate document and compliance gates",
  "Produce cost actions and a shipment plan",
];

const CUSTOMER_ROWS = [
  "Shopify and e-commerce importers",
  "Small importers/exporters",
  "Freight forwarders handling repeat SKUs",
  "Customs brokers doing pre-classification",
];

const PLAN_PREVIEW = ["free", "starter", "growth"] as const;

export default function LandingPage() {
  return (
    <main className="bg-white">
      <OverlayHeader />

      {/* -------------------------------------------------------- Hero */}
      <section className="relative min-h-[92vh] overflow-hidden bg-slate-950">
        <img
          src="/tariffos-hero.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.78]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white">
              AI shipping operations agent
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              TariffOS
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              An AI-assisted workspace for importers and exporters that turns
              product facts into HS recommendations, document checklists,
              compliance checkpoints, cost-saving actions, and shipment
              execution plans.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
              >
                Create shipment plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-base font-medium text-white shadow-sm transition-colors hover:bg-white/20"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Problem */}
      <section className="border-b border-border bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionBadge>Problem</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              Product-level customs work is still trapped in email,
              spreadsheets, and brittle lookups.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PROBLEM_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
              >
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <p className="mt-4 text-sm font-medium text-slate-900">
                  {card.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Workflow */}
      <section id="workflow" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionBadge>How it works</SectionBadge>
          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={step}
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-700">
                  {i + 1}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">
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
        className="border-y border-border bg-slate-50 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <SectionBadge>Who it is for</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              Built for repeat-SKU trade worldwide — deepest on EU, UK,
              Turkey, and US lanes.
            </h2>
          </div>
          <div className="grid gap-3">
            {CUSTOMER_ROWS.map((row) => (
              <div
                key={row}
                className="flex items-center gap-3 rounded-md border border-border bg-white p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800">
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
            <SectionBadge>Example output</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              Shipment execution plans, not chatbot transcripts.
            </h2>
            <p className="mt-4 text-slate-600">
              Every result includes candidate codes, confidence, missing
              information, required documents, warnings, next actions,
              compliance gates, and cost-reduction levers.
            </p>
          </div>
          <div className="card-shadow rounded-lg border border-border bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase text-slate-400">
                  Shipment readiness
                </p>
                <p className="mt-1 text-2xl font-semibold">82%</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                ready with review
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {["Confirm HS code", "Collect origin proof", "Compare freight quotes"].map(
                (action) => (
                  <div
                    key={action}
                    className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                  >
                    <FileText className="mb-3 h-4 w-4 text-blue-300" />
                    {action}
                  </div>
                ),
              )}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Agent plan for a cotton t-shirt shipment: use 6109.10 as the
              working classification, collect the invoice and origin evidence,
              validate value basis, and benchmark carrier options before
              booking.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------- Pricing preview */}
      <section className="border-t border-border bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div>
            <SectionBadge>Pricing preview</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              Start narrow, scale to API volume.
            </h2>
          </div>
          {PLAN_PREVIEW.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-border bg-white p-5 shadow-sm"
            >
              <Sparkles className="h-5 w-5 text-blue-700" />
              <p className="mt-4 text-lg font-semibold text-slate-950">
                {PLANS[id].name}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {PLANS[id].description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------- Compliance disclaimer */}
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Compliance disclaimer: {LEGAL_DISCLAIMER}
        </div>
      </section>
    </main>
  );
}
