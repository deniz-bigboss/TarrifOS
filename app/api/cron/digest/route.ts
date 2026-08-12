import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import { getAdminEmails } from "@/lib/auth/admins";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import { isPaddleConfigured } from "@/lib/billing/paddle";
import { loadRevenueSummary, formatMoney } from "@/lib/billing/revenue";
import { isPublicAccessSuspended } from "@/lib/site/access";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily founder digest.
 *
 * Nobody was watching the funnel: signups, activation and degraded AI service
 * were all invisible unless someone opened the database. This mails yesterday's
 * numbers to the operator allowlist every morning — including how many results
 * were served by a fallback provider, which is the only warning you get that
 * the primary AI is failing.
 *
 * Protected by CRON_SECRET; safe to call by hand.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "supabase admin not configured" }, { status: 503 });
  }
  // A closed site has no funnel to report on, so the daily mail is just noise.
  // The schedule is removed from vercel.json too; this stops a stray run from
  // sending anyway. `?force=1` still works — silencing the daily digest should
  // not take away the ability to pull the numbers on demand.
  const force = new URL(request.url).searchParams.get("force") === "1";
  if (isPublicAccessSuspended() && !force) {
    return NextResponse.json({ skipped: "public access suspended", sent: 0 });
  }

  const now = new Date();
  const dayStart = new Date(now.getTime() - 24 * 3600_000).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600_000).toISOString();
  const admin = createAdminClient();

  const countSince = async (
    table: string,
    since: string,
    column = "created_at",
  ): Promise<number> => {
    const { count, error } = await admin
      .from(table)
      .select("id", { count: "exact", head: true })
      .gte(column, since);
    if (error) {
      console.error(`[digest] count ${table} failed:`, error);
      return 0;
    }
    return count ?? 0;
  };

  const [
    classifications24,
    classifications7,
    feedback24,
    orgsTotal,
    { data: events24 },
    { data: users },
    { data: guest },
  ] = await Promise.all([
    countSince("classification_requests", dayStart),
    countSince("classification_requests", weekStart),
    countSince("feedback_labels", dayStart),
    countSince("organizations", "1970-01-01T00:00:00Z"),
    admin
      .from("usage_events")
      .select("event_type, metadata, created_at")
      .gte("created_at", dayStart),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from("guest_usage")
      .select("count, day")
      .gte("day", dayStart.slice(0, 10)),
  ]);

  const signups24 = (users?.users ?? []).filter(
    (u) => u.created_at && u.created_at >= dayStart,
  ).length;
  const usersTotal = users?.users?.length ?? 0;

  const evts = events24 ?? [];
  const byType = (t: string) => evts.filter((e) => e.event_type === t).length;
  // A provider other than the primary means the fallback chain kicked in.
  const providers = evts
    .filter((e) => e.event_type === "classification")
    .map((e) => (e.metadata as { provider?: string } | null)?.provider)
    .filter(Boolean) as string[];
  const providerCounts = providers.reduce<Record<string, number>>((acc, p) => {
    acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {});
  const degraded = providers.filter((p) => p === "mock").length;
  const guestRuns = (guest ?? []).reduce((sum, g) => sum + (g.count ?? 0), 0);

  let revenueLine = "Payments are not configured.";
  if (isPaddleConfigured()) {
    try {
      const summary = await loadRevenueSummary();
      revenueLine =
        summary.totals.length === 0
          ? "No charges yet."
          : summary.totals
              .map(
                (t) =>
                  `${formatMoney(t.net, t.currency)} net accrued · ${formatMoney(t.collected, t.currency)} collected across ${t.purchases} charge(s)`,
              )
              .join("<br>");
    } catch (err) {
      revenueLine = `Could not read Paddle: ${err instanceof Error ? err.message : "error"}`;
    }
  }

  const row = (label: string, value: string | number, hint = "") =>
    `<tr><td style="padding:6px 14px 6px 0;color:#64748b;font-size:13px;white-space:nowrap">${label}</td>` +
    `<td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600">${value}` +
    (hint ? ` <span style="color:#94a3b8;font-weight:400;font-size:12px">${hint}</span>` : "") +
    `</td></tr>`;

  const alert =
    degraded > 0
      ? `<p style="background:#fbe9d2;border:1px solid #b45309;border-radius:8px;padding:10px 12px;font-size:13px;color:#7c3d09;margin:0 0 16px"><b>${degraded}</b> classification(s) were served by the offline engine — the live AI providers were failing. Check the provider keys and quotas.</p>`
      : "";

  const url = (process.env.NEXT_PUBLIC_SITE_URL || "https://kustaro.app").replace(/\/$/, "");
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:540px;margin:0 auto;padding:24px;color:#1e293b">
  <div style="font-size:20px;font-weight:700;color:#0f766e;margin-bottom:6px">Kustaro</div>
  <p style="font-size:12px;color:#94a3b8;margin:0 0 18px">Daily digest &middot; ${now.toISOString().slice(0, 10)}</p>
  ${alert}
  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:0 0 8px">Last 24 hours</h2>
  <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
    ${row("New signups", signups24)}
    ${row("Classifications", classifications24, `${classifications7} in the last 7 days`)}
    ${row("Guest runs", guestRuns, "free, no account")}
    ${row("Report translations", byType("translation"))}
    ${row("Broker feedback", feedback24)}
    ${row("AI providers", Object.entries(providerCounts).map(([p, n]) => `${p}&nbsp;${n}`).join(", ") || "—")}
  </table>
  <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin:0 0 8px">Totals</h2>
  <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
    ${row("Users", usersTotal)}
    ${row("Workspaces", orgsTotal)}
    ${row("Revenue", revenueLine)}
  </table>
  <p style="margin:0">
    <a href="${url}/dashboard/admin/revenue" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:13px;padding:10px 18px;border-radius:8px">Revenue console</a>
    <a href="${url}/dashboard/admin/feedback" style="display:inline-block;margin-left:8px;color:#0d9488;text-decoration:none;font-size:13px;padding:10px 4px">Feedback &rarr;</a>
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0">
  <p style="font-size:12px;color:#94a3b8;margin:0">Sent to every founder on the admin list.</p>
</div>`;

  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  let mailed = false;
  if (!dryRun && isEmailConfigured()) {
    mailed = await sendEmail({
      to: getAdminEmails(),
      subject: `Kustaro daily — ${signups24} signup(s), ${classifications24} classification(s)`,
      html,
    });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    mailed,
    last24h: {
      signups: signups24,
      classifications: classifications24,
      guestRuns,
      translations: byType("translation"),
      feedback: feedback24,
      providers: providerCounts,
      degraded,
    },
    totals: { users: usersTotal, workspaces: orgsTotal },
    ranAt: now.toISOString(),
  });
}
