"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { openPaddleTransaction } from "@/components/billing/paddle-js";
import { Button } from "@/components/ui/button";

type State = "opening" | "open" | "missing" | "error";

/**
 * Landing page for Paddle payment links. Paddle appends `?_ptxn=<id>` when it
 * emails a customer to complete or retry a payment, so this opens the overlay
 * for that transaction. Deliberately public: the recipient may have no session.
 */
export function ResumePayment() {
  const params = useSearchParams();
  const transactionId = params.get("_ptxn");
  const [state, setState] = useState<State>(transactionId ? "opening" : "missing");
  const [error, setError] = useState<string | null>(null);

  async function open(id: string) {
    setState("opening");
    setError(null);
    try {
      await openPaddleTransaction(id);
      setState("open");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the payment window.");
      setState("error");
    }
  }

  useEffect(() => {
    if (transactionId) void open(transactionId);
    // Opening once per transaction id is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (state === "missing") {
    return (
      <p className="text-sm text-muted-foreground">
        This page opens a payment that Paddle sent you by email. Open it from
        that email&apos;s payment link, or manage your plan from{" "}
        <a href="/dashboard/billing" className="font-medium text-primary hover:underline">
          Billing
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {state === "opening" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Opening the secure payment
          window…
        </p>
      )}
      {state === "open" && (
        <p className="text-sm text-muted-foreground">
          Complete your payment in the Paddle window. If it didn&apos;t appear,
          reopen it below.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {transactionId && state !== "opening" && (
        <Button onClick={() => void open(transactionId)}>
          <CreditCard className="h-4 w-4" /> Open payment window
        </Button>
      )}
    </div>
  );
}
