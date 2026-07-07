import { getAdminEmails } from "@/lib/auth/admins";
import { sendEmail } from "@/lib/email/resend";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://kustaro.app").replace(
    /\/$/,
    "",
  );
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface FeedbackNotification {
  requestId: string;
  productName: string | null;
  orgName: string | null;
  recommendedCode?: string | null;
  wasCorrect?: boolean | null;
  actualCode?: string | null;
  shipmentCleared?: boolean | null;
  delayOccurred?: boolean | null;
  penaltyOccurred?: boolean | null;
  brokerNotes?: string | null;
}

function tri(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

/**
 * Notify the Kustaro operators that a customer submitted broker/customs
 * feedback. Best-effort — the caller must not let this block or fail the
 * user-facing action.
 */
export async function sendFeedbackNotification(
  n: FeedbackNotification,
): Promise<void> {
  const url = siteUrl();
  const outcome =
    n.wasCorrect === true
      ? "✅ Accepted by broker/customs"
      : n.wasCorrect === false
        ? "❌ Rejected"
        : "— not stated";

  const rows: Array<[string, string]> = [
    ["Organization", esc(n.orgName ?? "—")],
    ["Product", esc(n.productName ?? "—")],
    ["Suggested code", esc(n.recommendedCode ?? "—")],
    ["Outcome", outcome],
    ["Correct code (if different)", esc(n.actualCode ?? "—")],
    ["Shipment cleared", tri(n.shipmentCleared)],
    ["Delay occurred", tri(n.delayOccurred)],
    ["Penalty / document issue", tri(n.penaltyOccurred)],
    ["Broker notes", n.brokerNotes ? esc(n.brokerNotes) : "—"],
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0;color:#0f172a;font-size:13px">${v}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b">
  <div style="font-size:20px;font-weight:700;color:#0f766e;margin-bottom:16px">Kustaro</div>
  <h1 style="font-size:17px;margin:0 0 6px;color:#0f172a">New broker feedback</h1>
  <p style="font-size:13px;line-height:1.6;color:#475569;margin:0 0 16px">A customer submitted feedback on a classification. Details below.</p>
  <table style="border-collapse:collapse;width:100%">${table}</table>
  <p style="margin:22px 0 0">
    <a href="${url}/dashboard/admin/feedback" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:13px;padding:10px 18px;border-radius:8px">Open feedback console</a>
    <a href="${url}/dashboard/classifications/${encodeURIComponent(n.requestId)}" style="display:inline-block;margin-left:8px;color:#0d9488;text-decoration:none;font-size:13px;padding:10px 4px">View classification →</a>
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0">
  <p style="font-size:12px;color:#94a3b8;margin:0">Kustaro operator notification &middot; sent because you're on the admin list.</p>
</div>`;

  await sendEmail({
    to: getAdminEmails(),
    subject: `New broker feedback — ${n.productName ?? "classification"}`,
    html,
  });
}
