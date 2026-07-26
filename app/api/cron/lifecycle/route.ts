import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import { getPlan } from "@/lib/billing/plans";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import {
  selectLifecycleEmail,
  renderLifecycleEmail,
  type LifecycleEmail,
  type WorkspaceState,
} from "@/lib/email/lifecycle";
import type { PlanId } from "@/types/database";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Lifecycle sends are logged as usage events so we never repeat one. */
const EVENT_TYPE = "lifecycle_email";

const DAY_MS = 86_400_000;
const daysSince = (iso: string | null | undefined): number | null =>
  iso ? Math.floor((Date.now() - Date.parse(iso)) / DAY_MS) : null;

/**
 * Daily lifecycle email run.
 *
 * Until this existed the only mail a user ever got was the signup confirmation:
 * people signed up, went quiet, and nobody noticed. This looks at every
 * workspace, picks at most one message per workspace per day (see
 * selectLifecycleEmail for the order), sends it and records the send.
 *
 * Wired to Vercel Cron and protected by CRON_SECRET, same as the tariff
 * refresh. Safe to run by hand — already-sent messages are skipped.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "supabase admin not configured" }, { status: 503 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "email not configured" }, { status: 503 });
  }

  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  const admin = createAdminClient();
  const monthStart = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  ).toISOString();

  const [{ data: orgs }, { data: profiles }, { data: requests }, { data: events }, { data: products }] =
    await Promise.all([
      admin.from("organizations").select("id, name, plan, created_at"),
      admin.from("profiles").select("organization_id, user_id"),
      admin.from("classification_requests").select("organization_id, created_at"),
      admin
        .from("usage_events")
        .select("organization_id, event_type, metadata, created_at")
        .eq("event_type", EVENT_TYPE),
      admin.from("products").select("organization_id"),
    ]);

  // One lookup of auth emails; workspaces are few enough that a single page is
  // plenty, and this avoids a per-user round trip.
  const { data: userList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailByUser = new Map(
    (userList?.users ?? []).map((u) => [u.id, u.email ?? null] as const),
  );
  const userByOrg = new Map((profiles ?? []).map((p) => [p.organization_id, p.user_id] as const));

  const byOrg = <T extends { organization_id: string }>(rows: T[] | null) => {
    const map = new Map<string, T[]>();
    for (const r of rows ?? []) {
      const list = map.get(r.organization_id) ?? [];
      list.push(r);
      map.set(r.organization_id, list);
    }
    return map;
  };
  const requestsByOrg = byOrg(requests as { organization_id: string; created_at: string }[] | null);
  const eventsByOrg = byOrg(
    events as { organization_id: string; metadata: { email?: string } | null; created_at: string }[] | null,
  );
  const productsByOrg = byOrg(products as { organization_id: string }[] | null);

  const sent: Array<{ org: string; email: LifecycleEmail; to: string }> = [];
  const skipped: string[] = [];

  for (const org of orgs ?? []) {
    const to = emailByUser.get(userByOrg.get(org.id) ?? "") ?? null;
    if (!to) {
      skipped.push(`${org.id}: no email`);
      continue;
    }

    const orgRequests = requestsByOrg.get(org.id) ?? [];
    const lastAt = orgRequests
      .map((r) => r.created_at)
      .sort()
      .at(-1);
    const priorSends: WorkspaceState["sent"] = {};
    for (const e of eventsByOrg.get(org.id) ?? []) {
      const kind = e.metadata?.email as LifecycleEmail | undefined;
      if (!kind) continue;
      const age = daysSince(e.created_at) ?? 0;
      const existing = priorSends[kind];
      if (existing == null || age < existing) priorSends[kind] = age;
    }

    const state: WorkspaceState = {
      ageDays: daysSince(org.created_at) ?? 0,
      classifications: orgRequests.length,
      daysSinceLastClassification: daysSince(lastAt),
      usedThisMonth: orgRequests.filter((r) => r.created_at >= monthStart).length,
      plan: org.plan as PlanId,
      savedProducts: (productsByOrg.get(org.id) ?? []).length,
      sent: priorSends,
    };

    const choice = selectLifecycleEmail(state);
    if (!choice) continue;

    const plan = getPlan(state.plan);
    const message = renderLifecycleEmail(choice, {
      planName: plan.name,
      monthlyLimit: plan.monthlyLimit,
    });

    if (dryRun) {
      sent.push({ org: org.name ?? org.id, email: choice, to });
      continue;
    }

    const ok = await sendEmail({
      to,
      subject: message.subject,
      html: message.html,
      replyTo: "support@kustaro.app",
    });
    if (!ok) {
      skipped.push(`${org.id}: send failed`);
      continue;
    }
    // Log only after a successful send, so a failure retries tomorrow.
    await admin.from("usage_events").insert({
      organization_id: org.id,
      event_type: EVENT_TYPE,
      metadata: { email: choice },
    });
    sent.push({ org: org.name ?? org.id, email: choice, to });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    workspaces: orgs?.length ?? 0,
    sent: sent.length,
    breakdown: sent.reduce<Record<string, number>>((acc, s) => {
      acc[s.email] = (acc[s.email] ?? 0) + 1;
      return acc;
    }, {}),
    details: sent,
    skipped,
    ranAt: new Date().toISOString(),
  });
}
