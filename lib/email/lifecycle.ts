import { getPlan } from "@/lib/billing/plans";
import type { PlanId } from "@/types/database";

/**
 * Lifecycle email selection.
 *
 * A signup that never runs a classification is worth nothing, and until now the
 * only mail a user ever received was Supabase's confirmation link. This decides
 * which single message an organization should get today — one at most, so a
 * quiet week can't turn into four emails.
 *
 * The decision is a pure function of the workspace's state so it can be tested
 * without a database or a mail provider.
 */

export type LifecycleEmail =
  | "welcome"
  | "no_first_classification"
  | "credits_low"
  | "dormant";

export interface WorkspaceState {
  /** Days since the workspace was created. */
  ageDays: number;
  classifications: number;
  /** Days since the most recent classification; null when there are none. */
  daysSinceLastClassification: number | null;
  /** Classifications used this calendar month, against the plan's allowance. */
  usedThisMonth: number;
  plan: PlanId;
  savedProducts: number;
  /** Lifecycle emails already sent, with days since each was sent. */
  sent: Partial<Record<LifecycleEmail, number>>;
}

/** Don't repeat a nudge inside this window, whatever else changes. */
const REPEAT_AFTER_DAYS = 30;

/**
 * Only greet workspaces that are actually new. Turning this on for the first
 * time must not send "welcome to Kustaro" to someone who signed up a month ago
 * — they fall through to whichever nudge fits their state instead.
 */
const WELCOME_WITHIN_DAYS = 14;

function alreadySent(state: WorkspaceState, email: LifecycleEmail): boolean {
  const days = state.sent[email];
  if (days == null) return false;
  // welcome is once, ever; the nudges may repeat after a month.
  if (email === "welcome") return true;
  return days < REPEAT_AFTER_DAYS;
}

/**
 * Returns the one email this workspace should receive now, or null. Order is
 * deliberate: get them started, then keep them going, then ask for money.
 */
export function selectLifecycleEmail(state: WorkspaceState): LifecycleEmail | null {
  // 1. Welcome — once, and only while the workspace is still new.
  if (!alreadySent(state, "welcome") && state.ageDays <= WELCOME_WITHIN_DAYS) {
    return "welcome";
  }

  // 2. Signed up but never classified: the single biggest drop-off.
  if (
    state.classifications === 0 &&
    state.ageDays >= 2 &&
    !alreadySent(state, "no_first_classification")
  ) {
    return "no_first_classification";
  }

  // 3. Out of (or nearly out of) this month's allowance — the upgrade moment.
  const limit = getPlan(state.plan).monthlyLimit;
  if (
    limit != null &&
    state.usedThisMonth >= limit &&
    !alreadySent(state, "credits_low")
  ) {
    return "credits_low";
  }

  // 4. Was active, then went quiet.
  if (
    state.classifications > 0 &&
    state.daysSinceLastClassification != null &&
    state.daysSinceLastClassification >= 10 &&
    !alreadySent(state, "dormant")
  ) {
    return "dormant";
  }

  return null;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://kustaro.app").replace(/\/$/, "");
}

function shell(heading: string, paragraphs: string[], cta: { label: string; href: string }): string {
  const url = siteUrl();
  const body = paragraphs
    .map(
      (p) =>
        `<p style="font-size:14px;line-height:1.65;color:#475569;margin:0 0 12px">${p}</p>`,
    )
    .join("");
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b">
  <div style="font-size:20px;font-weight:700;color:#0f766e;margin-bottom:18px;letter-spacing:-0.02em">Kustaro</div>
  <h1 style="font-size:18px;margin:0 0 12px;color:#0f172a">${heading}</h1>
  ${body}
  <p style="margin:22px 0 0">
    <a href="${cta.href}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px">${cta.label}</a>
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="font-size:12px;color:#94a3b8;line-height:1.6;margin:0">Kustaro &middot; ${url.replace(/^https?:\/\//, "")}<br>
  These are occasional emails about your workspace. Reply with &ldquo;stop&rdquo; and we&rsquo;ll leave you alone.</p>
</div>`;
}

export interface LifecycleMessage {
  subject: string;
  html: string;
}

/** The copy for each email. Short, one job each, one link. */
export function renderLifecycleEmail(
  email: LifecycleEmail,
  ctx: { planName: string; monthlyLimit: number | null },
): LifecycleMessage {
  const url = siteUrl();
  switch (email) {
    case "welcome":
      return {
        subject: "Your first classification takes about a minute",
        html: shell(
          "Welcome to Kustaro",
          [
            "Kustaro works out how a product will be classified at customs before you ship it: the HS code candidates, the duty and additional tariffs, the documents customs will ask for, and what is still missing from your file.",
            "The fastest way to see whether it is useful is to run one real product — the one you ship most. Description, material and destination are enough to start.",
            `Your ${ctx.planName} plan includes ${ctx.monthlyLimit ?? "unlimited"} classifications a month.`,
          ],
          { label: "Classify a product", href: `${url}/classify` },
        ),
      };

    case "no_first_classification":
      return {
        subject: "Stuck on what to enter? Start with one product",
        html: shell(
          "One product is enough to judge it",
          [
            "You created a workspace but haven't run anything yet — which usually means it isn't obvious what to type. It's simpler than it looks.",
            "Take the product you ship most and give three things: what it is (\"men's cotton t-shirt, knitted, short sleeve\"), what it's made of, and where it's going. That's enough for a code, a duty estimate and a document list.",
            "If the result is uncertain, Kustaro tells you exactly which detail would settle it — that alone is usually worth the minute.",
          ],
          { label: "Run one product", href: `${url}/classify` },
        ),
      };

    case "credits_low":
      return {
        subject: `You've used this month's ${ctx.planName} classifications`,
        html: shell(
          "You're out of classifications for this month",
          [
            `Your ${ctx.planName} plan includes ${ctx.monthlyLimit} a month and they're now used. Everything you've already classified stays available — reports, history and saved products are unaffected.`,
            "If you're classifying regularly, Starter is $19/month for 50, Pro is $49 for 250. No commitment; cancel any time and the plan runs to the end of the period you paid for.",
            "Your allowance also resets on the 1st if you'd rather wait.",
          ],
          { label: "See plans", href: `${url}/dashboard/billing` },
        ),
      };

    case "dormant":
      return {
        subject: "Anything shipping soon?",
        html: shell(
          "Still here when you need it",
          [
            "You classified a product with Kustaro a little while back and it's been quiet since. No pressure — but if something is shipping soon, running it now is cheaper than finding out at the border.",
            "Two things people miss: you can save products to a library so repeat SKUs take seconds, and you can answer a couple of follow-up questions to raise a low-confidence result before it goes to your broker.",
            "If it turned out not to be useful, tell us why — a one-line reply genuinely shapes what we build next.",
          ],
          { label: "Open Kustaro", href: `${url}/dashboard` },
        ),
      };
  }
}
