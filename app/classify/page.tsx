import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { getProduct, productRowToInput } from "@/lib/db/products";
import { getI18n } from "@/lib/i18n/server";
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
  searchParams?: { product?: string };
}) {
  const session = await getSessionContext();
  const { t } = getI18n();

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
          {!session && (
            <p className="mt-2 inline-flex rounded-md bg-accent/50 px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {guestUsed
                ? "Your free classification is used — create a free account to keep classifying."
                : "Try one classification free — no signup, no credit card."}
            </p>
          )}
        </div>

        <ClassifyClient
          t={t.app.wizard}
          mode={session ? "authed" : "guest"}
          initialValues={initialValues}
        />

        <DisclaimerBanner text={LEGAL_DISCLAIMER} />
      </div>
    </main>
  );
}
