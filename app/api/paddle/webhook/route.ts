import { NextResponse } from "next/server";
import { planFromPaddlePriceId } from "@/lib/billing/paddle";
import {
  applyPaddleEvent,
  verifyPaddleSignature,
  type PaddleEvent,
} from "@/lib/billing/paddle-webhook";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Paddle webhook endpoint (notification destination).
 *
 * Verifies the Paddle-Signature header against PADDLE_WEBHOOK_SECRET (raw
 * body — never parse before verifying), then applies subscription lifecycle
 * events to the organization's plan via the service-role client (webhooks
 * carry no user session). Returns 200 for events we simply don't care about,
 * so Paddle doesn't retry them forever.
 */
export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "paddle not configured" }, { status: 503 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "supabase admin not configured" },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const signature = request.headers.get("paddle-signature");
  if (!verifyPaddleSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(payload) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await applyPaddleEvent(event, {
    planFromPriceId: planFromPaddlePriceId,
    updateOrg: async (match, fields) => {
      const query = admin.from("organizations").update(fields);
      const { error } =
        "organizationId" in match
          ? await query.eq("id", match.organizationId)
          : await query.eq("paddle_customer_id", match.paddleCustomerId);
      if (error) throw new Error(error.message);
    },
    recordBillingEvent: async (organizationId, plan, status) => {
      await admin.from("billing_events").insert({
        organization_id: organizationId,
        plan,
        status,
      });
    },
  });

  return NextResponse.json(result);
}
