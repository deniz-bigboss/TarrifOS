import type { Metadata } from "next";
import { Gauge, Layers, ReceiptText } from "lucide-react";
import { OverlayHeader } from "@/components/marketing/overlay-header";
import { SectionBadge } from "@/components/marketing/section-badge";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { API_USAGE_PRICING } from "@/lib/billing/plans";
import { LEGAL_DISCLAIMER } from "@/types";

export const metadata: Metadata = {
  title: "Pricing — TariffOS",
};

const METERING_TILES = [
  { icon: ReceiptText, label: "1 API call = 1 classification" },
  { icon: Gauge, label: "Volume discounts at scale" },
  { icon: Layers, label: "Priced by enrichment level" },
];

export default function PricingPage() {
  return (
    <main className="bg-white">
      <OverlayHeader />

      {/* ------------------------------------------------ Dark hero band */}
      <section className="relative overflow-hidden bg-slate-950">
        <img
          src="/tariffos-hero.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white">
            Pricing
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Start free, scale to API volume.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            Every plan produces the same shipment plans, document checklists,
            and broker-ready reports — upgrade for volume, team seats, and the
            API.
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
      <section className="border-t border-border bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionBadge>API metering</SectionBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
              Usage-based API pricing.
            </h2>
            <p className="mt-4 text-slate-600">
              {API_USAGE_PRICING} Volume and enrichment-level discounts are
              available on Forwarder and Enterprise plans.
            </p>
          </div>
          <div className="card-shadow rounded-lg border border-border bg-slate-950 p-5 text-white">
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs uppercase text-slate-400">How metering works</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Each{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  POST /api/v1/classify
                </code>{" "}
                call counts as one classification toward your plan and is
                recorded as a usage event for metering.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {METERING_TILES.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                >
                  <tile.icon className="mb-3 h-4 w-4 text-blue-300" />
                  {tile.label}
                </div>
              ))}
            </div>
          </div>
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
