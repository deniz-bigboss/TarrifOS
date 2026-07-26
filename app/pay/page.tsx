import { Suspense } from "react";
import type { Metadata } from "next";
import { KustaroMark } from "@/components/brand/logo";
import { ResumePayment } from "@/components/billing/resume-payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Complete your payment — Kustaro",
  robots: { index: false, follow: false },
};

/**
 * Public landing page used as Paddle's Default Payment Link. Paddle sends
 * customers here with `?_ptxn=<transaction id>` to complete or retry a payment
 * (invoices, card-retry emails), so it must work without a session.
 */
export default function PayPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-5">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950">
            <KustaroMark className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Kustaro</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complete your payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading…</p>
              }
            >
              <ResumePayment />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Payments are processed by Paddle, our merchant of record. Card details
          never reach Kustaro. See our{" "}
          <a href="/refunds" className="hover:underline">
            Refund Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
