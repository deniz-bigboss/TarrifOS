import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Check, UserPlus } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { getProduct, productRowToInput } from "@/lib/db/products";
import { getI18n } from "@/lib/i18n/server";
import { getCodePage } from "@/lib/seo/code-pages";
import { Button } from "@/components/ui/button";
import { ClassifyClient } from "./classify-client";
import { DisclaimerBanner } from "@/components/disclaimer";
import { LEGAL_DISCLAIMER } from "@/types";
import type { ProductInputSchema } from "@/lib/validation/schemas";

export const metadata = {
  title: "Classify a product — Kustaro",
  description:
    "Generate HS-code candidates, missing-information questions, document checklists, risk flags, and a customs-readiness report — directly in your browser.",
};

export const dynamic = "force-dynamic";
// Live tariff APIs + a real AI provider can exceed the default function
// timeout; classifications served from this page get headroom.
export const maxDuration = 60;

/**
 * The center of the product: guided classification for everyone. Guests get
 * one free classification with no signup; signed-in users classify against
 * their plan and land on the saved result.
 */
export default async function ClassifyPage({
  searchParams,
}: {
  searchParams?: { product?: string; code?: string };
}) {
  const session = await getSessionContext();
  const { t } = getI18n();

  // Arriving from an /hs-code reference page. We don't prefill the product
  // text — that would put words in the visitor's mouth and skew the result —
  // but we can name the code they were reading and preselect the destination
  // those pages lead with, so the form doesn't start from nothing.
  const fromCode = searchParams?.code ? getCodePage(searchParams.code) : null;

  // Reclassify from the SKU library (?product=<id>, authed only).
  let initialValues: Partial<ProductInputSchema> | undefined;
  if (session && searchParams?.product) {
    const row = await getProduct(createClient(), searchParams.product);
    if (row && row.organization_id === session.organization.id) {
      // Drop empty keys: spreading `origin_country: undefined` over the
      // wizard's defaults would blank required selects.
      initialValues = Object.fromEntries(
        Object.entries(productRowToInput(row)).filter(([, v]) => v != null),
      ) as Partial<ProductInputSchema>;
    }
  }

  if (!initialValues && fromCode) {
    initialValues = { destination_country: "US" } as Partial<ProductInputSchema>;
  }

  const guestUsed = !session && Boolean(cookies().get("kustaro_guest_used")?.value);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href={session ? "/dashboard" : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {session ? "Dashboard" : "Kustaro"}
          </Link>
          {!session && (
            <div className="flex items-center gap-4 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                {t.nav.login}
              </Link>
              <Link href="/signup" className="font-medium text-primary hover:underline">
                {t.nav.signup}
              </Link>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.app.wizard.newTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.app.wizard.newSubtitle}</p>
          {!session && !guestUsed && (
            <p className="mt-2 inline-flex rounded-md bg-accent/50 px-2.5 py-1 text-xs font-medium text-accent-foreground">
              Try one classification free — no signup, no credit card.
            </p>
          )}
        </div>

        {fromCode && !guestUsed && (
          <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            You came from{" "}
            <Link href={`/hs-code/${fromCode.slug}`} className="font-medium text-primary hover:underline">
              HS {fromCode.code}
            </Link>{" "}
            — {fromCode.title.toLowerCase()}. Describe your actual product below
            and Kustaro will tell you whether that code fits, what duty applies
            on your lane, and what customs will ask for.
          </p>
        )}

        {guestUsed ? (
          <GuestLimitReached />
        ) : (
          <ClassifyClient
            t={t.app.wizard}
            mode={session ? "authed" : "guest"}
            initialValues={initialValues}
          />
        )}

        <DisclaimerBanner text={LEGAL_DISCLAIMER} />
      </div>
    </main>
  );
}

/**
 * Shown instead of the wizard once a guest has spent their free run. Letting
 * them fill in five steps and then refusing at submit wasted the effort of the
 * most motivated visitors we get — this makes the offer before they invest it.
 */
function GuestLimitReached() {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
      <h2 className="text-lg font-semibold">
        You&apos;ve used your free classification
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create a free account to keep going — no credit card, nothing to cancel.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {[
          "3 more classifications every month, free",
          "Results saved with their full history",
          "Exportable customs-readiness reports",
          "An SKU library so repeat products take seconds",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/signup">
            <UserPlus className="h-4 w-4" /> Create free account
          </Link>
        </Button>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Already have one? Log in
        </Link>
      </div>
    </div>
  );
}
