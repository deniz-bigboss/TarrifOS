"use client";

/**
 * Loads Paddle.js v2 on demand and opens the overlay checkout. The client
 * token is public by design — it can only start checkouts, never charge or
 * read account data. The buyer pays inside Paddle's hosted overlay (card data
 * never touches this app) and the plan is granted by the signed webhook.
 */

interface PaddleJs {
  Environment: { set: (env: "sandbox" | "production") => void };
  Initialize: (opts: { token: string }) => void;
  Checkout: {
    open: (opts: {
      items?: Array<{ priceId: string; quantity: number }>;
      transactionId?: string;
      customData?: Record<string, string>;
      customer?: { email?: string };
      settings?: { displayMode?: string; successUrl?: string };
    }) => void;
  };
}

declare global {
  interface Window {
    Paddle?: PaddleJs;
  }
}

let ready: Promise<PaddleJs> | null = null;

function loadPaddle(): Promise<PaddleJs> {
  if (!ready) {
    ready = new Promise<PaddleJs>((resolve, reject) => {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token) {
        reject(
          new Error(
            "Paddle is not configured (NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing).",
          ),
        );
        return;
      }
      const init = () => {
        const paddle = window.Paddle;
        if (!paddle) {
          reject(new Error("Paddle.js did not load correctly."));
          return;
        }
        // Sandbox client tokens start with test_.
        if (token.startsWith("test_")) paddle.Environment.set("sandbox");
        paddle.Initialize({ token });
        resolve(paddle);
      };
      if (window.Paddle) {
        init();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = init;
      script.onerror = () =>
        reject(new Error("Could not load the Paddle checkout script."));
      document.head.appendChild(script);
    });
    // Allow a retry on a failed load instead of caching the rejection.
    ready.catch(() => {
      ready = null;
    });
  }
  return ready;
}

/**
 * Opens the checkout for an existing Paddle transaction. Paddle appends
 * `?_ptxn=<id>` to our default payment link when it emails a customer to
 * complete or retry a payment, so the landing page needs to be able to resume
 * that transaction — no login required, since the recipient may not have a
 * session (or any account) yet.
 */
export async function openPaddleTransaction(transactionId: string): Promise<void> {
  const paddle = await loadPaddle();
  paddle.Checkout.open({
    transactionId,
    settings: { displayMode: "overlay" },
  });
}

export async function openPaddleCheckout(opts: {
  priceId: string;
  organizationId: string;
  email?: string | null;
}): Promise<void> {
  const paddle = await loadPaddle();
  paddle.Checkout.open({
    items: [{ priceId: opts.priceId, quantity: 1 }],
    // Round-trips to the webhook so it knows which org bought the plan.
    customData: { organization_id: opts.organizationId },
    customer: opts.email ? { email: opts.email } : undefined,
    settings: {
      displayMode: "overlay",
      successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
    },
  });
}
