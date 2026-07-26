"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

const POLL_MS = 2500;
const MAX_POLLS = 12; // ~30s, then stop polling and offer a manual retry

/**
 * Shown after a successful checkout. The plan is granted asynchronously by the
 * provider's webhook — usually within a second or two — so rather than telling
 * the buyer to refresh, this re-fetches the page until the subscription is
 * confirmed. `confirmed` comes from the stored subscription id, so a webhook
 * that landed before this page rendered shows success immediately.
 */
export function CheckoutSuccess({
  planName,
  confirmed,
}: {
  planName: string;
  confirmed: boolean;
}) {
  const router = useRouter();
  const [polls, setPolls] = useState(0);
  const waiting = !confirmed && polls < MAX_POLLS;

  useEffect(() => {
    if (!waiting) return;
    const id = setTimeout(() => {
      setPolls((n) => n + 1);
      router.refresh();
    }, POLL_MS);
    return () => clearTimeout(id);
  }, [waiting, polls, router]);

  const base =
    "flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

  if (confirmed) {
    return (
      <p className={base}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Payment received — you&apos;re on {planName}. Paddle is sending your
        receipt by email.
      </p>
    );
  }

  if (waiting) {
    return (
      <p className={base}>
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        Payment received — activating your plan…
      </p>
    );
  }

  return (
    <p className={base}>
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      Payment received. Activation is taking longer than usual —
      <button
        type="button"
        onClick={() => {
          setPolls(0);
          router.refresh();
        }}
        className="font-semibold underline"
      >
        check again
      </button>
      , or email support@kustaro.app if your plan doesn&apos;t appear.
    </p>
  );
}
