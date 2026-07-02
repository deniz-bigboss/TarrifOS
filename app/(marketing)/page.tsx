import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileCheck2,
  Gauge,
  Layers,
  Mail,
  PackageSearch,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { DisclaimerBanner } from "@/components/disclaimer";
import { API_USAGE_PRICING } from "@/lib/billing/plans";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/70 to-background" />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 gap-1">
              <Sparkles className="h-3 w-3" /> AI-native customs classification
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              TariffOS helps importers classify products, estimate landed costs,
              and prepare customs-ready documentation.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              AI-powered tariff classification with evidence, confidence scores,
              and broker-ready reports.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start classifying products <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#example">See an example report</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Works for any origin → destination lane worldwide. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Classifying products is slow, risky, and repetitive
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every cross-border shipment needs a tariff code. Get it wrong and you
            face delays, penalties, and overpaid duty. Today that knowledge lives
            in spreadsheets, broker emails, and people's heads.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: PackageSearch,
              title: "Ambiguous descriptions",
              body: "Product titles rarely map cleanly to an HS/HTS/TARIC code. The right code depends on material, function, and use.",
            },
            {
              icon: Mail,
              title: "Repetitive broker emails",
              body: "Forwarders and brokers re-answer the same classification questions for repeat SKUs, over and over.",
            },
            {
              icon: ShieldCheck,
              title: "Compliance exposure",
              body: "Restricted goods, batteries, cosmetics, and food carry rules that are easy to miss without a checklist.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-3 pt-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              A structured workflow — not a chatbot. Every result is grounded in
              retrieved tariff evidence and scored for confidence.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, step: "01", title: "Enter product info", body: "Add product details or upload an invoice / spec sheet." },
              { icon: ScanSearch, step: "02", title: "Retrieve candidates", body: "We normalize the description and search HS/HTS/TARIC candidate codes." },
              { icon: Gauge, step: "03", title: "AI reasons with evidence", body: "The model cites candidate descriptions and scores its confidence." },
              { icon: FileCheck2, step: "04", title: "Broker-ready report", body: "Get documents, restrictions, missing-info questions, and a review flag." },
            ].map((item) => (
              <Card key={item.step}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="text-2xl font-bold text-muted-foreground/40">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Who it's for</h2>
          <p className="mt-4 text-muted-foreground">
            Built first for small importers and e-commerce brands shipping repeat
            SKUs worldwide — with the deepest reference data on EU, UK, Turkey, and US lanes.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Store, title: "E-commerce & Shopify brands", body: "Classify repeat SKUs once and reuse the result across shipments." },
            { icon: Boxes, title: "Small importers / exporters", body: "Get a defensible code and document checklist without a full-time broker." },
            { icon: Truck, title: "Freight forwarders", body: "Pre-classify the flood of repetitive customer product emails in seconds." },
            { icon: FileCheck2, title: "Customs brokers", body: "Speed up pre-classification and triage what truly needs expert review." },
            { icon: PackageSearch, title: "Cross-border marketplaces", body: "Provide product-level tariff estimates at catalog scale via the API." },
            { icon: Gauge, title: "Ops & compliance teams", body: "Standardize classifications with confidence scores and an audit trail." },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="flex items-start gap-3 pt-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example output */}
      <section id="example" className="border-y border-border/60 bg-muted/30 py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Evidence, confidence, and a review flag — every time
            </h2>
            <p className="mt-4 text-muted-foreground">
              TariffOS returns a recommended code with the reasoning behind it,
              alternatives, required documents, restriction warnings, and the
              questions a broker would still ask. Low-confidence or high-risk
              items are automatically flagged for human review.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Recommended code + alternatives with reasons",
                "Confidence score and label",
                "Required-document checklist",
                "Restricted-goods warnings",
                "Missing-information questions",
                "Broker-ready explanation & disclaimer",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b bg-card px-5 py-3 text-xs font-medium text-muted-foreground">
              Example · Men's 100% cotton knitted t-shirt · TR → DE
            </div>
            <CardContent className="space-y-4 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-lg font-semibold">6109.10</div>
                  <div className="text-muted-foreground">
                    T-shirts, singlets and vests, of cotton, knitted
                  </div>
                </div>
                <Badge variant="success">86% · high</Badge>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[86%] rounded-full bg-success" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border bg-muted/40 p-3">
                  <div className="font-medium text-foreground">Documents</div>
                  Commercial invoice · Packing list · Certificate of origin
                </div>
                <div className="rounded-md border bg-muted/40 p-3">
                  <div className="font-medium text-foreground">Review</div>
                  Auto-cleared · confirm with broker before declaration
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Duty figures shown in-app are placeholders until an official
                tariff source is connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Simple, scaling pricing</h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade as your classification volume grows. API access on
            Growth and above.
          </p>
        </div>
        <div className="mt-12">
          <PricingCards compact />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Usage-based API pricing: {API_USAGE_PRICING}{" "}
          <Link href="/pricing" className="text-primary hover:underline">
            See full pricing →
          </Link>
        </p>
      </section>

      {/* Compliance disclaimer */}
      <section className="container pb-20">
        <DisclaimerBanner className="mx-auto max-w-4xl" />
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Classify your next shipment in under a minute
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Try TariffOS free with manual classifications and a broker-ready
            report. No credit card required.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">
              Start classifying products <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
