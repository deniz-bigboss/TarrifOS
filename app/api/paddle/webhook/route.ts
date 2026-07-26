import { NextResponse } from "next/server";
import { planFromPaddlePriceId } from "@/lib/billing/paddle";
import {
  applyPaddleEvent,
  verifyPaddleSignature,
  type PaddleEvent,
} from "@/lib/billing/paddle-webhook";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import { getPlan } from "@/lib/billing/plans";
import {
  sendPurchaseNotification,
  sendRefundNotification,
} from "@/lib/email/notifications";
import type { PlanId } from "@/types/database";

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
    resolveOrgIdByCustomer: async (customerId) => {
      const { data } = await admin
        .from("organizations")
        .select("id")
        .eq("paddle_customer_id", customerId)
        .maybeSingle();
      return (data?.id as string) ?? null;
    },
  });

  // Tell the founders about money moving. Best-effort and after the plan work:
  // a mail failure must never make Paddle retry an event we already applied.
  if (result.handled) {
    try {
      await notifyFounders(event, result.action, admin);
    } catch (err) {
      console.error("[paddle/webhook] notification failed:", err);
    }
  }

  return NextResponse.json(result);
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function orgName(
  admin: AdminClient,
  event: PaddleEvent,
): Promise<string | null> {
  const orgId = event.data?.custom_data?.organization_id;
  const customerId = event.data?.customer_id;
  const query = admin.from("organizations").select("name");
  const { data } = orgId
    ? await query.eq("id", orgId).maybeSingle()
    : customerId
      ? await query.eq("paddle_customer_id", customerId).maybeSingle()
      : { data: null };
  return (data?.name as string) ?? null;
}

/**
 * Emails the operator allowlist when a subscription starts or money is
 * refunded. Renewals are intentionally quiet — they would arrive on every
 * billing cycle, and the revenue console already reports them.
 */
async function notifyFounders(
  event: PaddleEvent,
  action: string | undefined,
  admin: AdminClient,
): Promise<void> {
  const type = event.event_type ?? "";

  if (type === "subscription.created") {
    // `action` is "plan → <id>" from applyPaddleEvent.
    const planId = action?.split("→").pop()?.trim() as PlanId | undefined;
    if (!planId) return;
    const plan = getPlan(planId);
    await sendPurchaseNotification({
      planName: plan.name,
      planPrice: plan.price,
      organizationName: await orgName(admin, event),
      subscriptionId: event.data?.id ?? null,
    });
    return;
  }

  if (type.startsWith("adjustment.") && type !== "adjustment.updated") {
    const totals = event.data?.totals;
    const amount =
      totals?.total != null
        ? `${totals.total} ${totals.currency_code ?? ""}`.trim()
        : null;
    await sendRefundNotification({
      action: event.data?.action ?? "refund",
      amount,
      organizationName: await orgName(admin, event),
      transactionId: event.data?.transaction_id ?? null,
    });
  }
}
