/**
 * Minimal transactional-email sender via the Resend HTTP API.
 *
 * Auth email (sign-up confirmation, password reset) is sent by Supabase over
 * SMTP; this is for app-originated notifications (e.g. broker-feedback alerts).
 * Both send from the same verified domain.
 *
 *   RESEND_API_KEY   re_...                         (required to actually send)
 *   EMAIL_FROM       "Kustaro <no-reply@kustaro.app>"  (optional override)
 */

const DEFAULT_FROM = "Kustaro <no-reply@kustaro.app>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Best-effort send. Returns true on success, false on any failure — callers
 * should never let a failed notification break the user-facing action, so this
 * swallows errors and logs them instead of throwing.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send.");
    return false;
  }
  const to = Array.isArray(input.to) ? input.to : [input.to];
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] send failed (HTTP ${res.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", err);
    return false;
  }
}
