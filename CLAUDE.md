# CLAUDE.md — working on Kustaro

Read this before touching anything. It covers the state the project is actually
in, which is not obvious from the code alone.

`README.md` documents how to run and configure the app. This file covers what
a fresh session needs to *know*: current posture, open defects, and the
gotchas that cost real time to rediscover.

---

## 1. What this is

**Kustaro** (kustaro.app) — a self-serve customs-readiness SaaS. A user
describes a product and gets HS-code candidates, missing-information
questions, document checklists, risk flags, duty estimates and a
customs-readiness report.

Next.js 14 App Router · TypeScript · Tailwind · Supabase (auth + Postgres +
RLS) · Vercel · Paddle Billing · Resend.

**Operated solely by Mahmut Kartal** (Ankara, Türkiye), who is the data
controller and the only party legally responsible. **Deniz Yılmaz** is a
co-founder with no legal responsibility or liability. This distinction is
stated on `/privacy` and is deliberate — do not blur it in any copy you write.

Paddle is the **merchant of record**: it is the legal seller, collects
worldwide VAT/sales tax, and pays out to a personal bank account, which is
what lets an individual sell from Türkiye without a registered company.

---

## 2. THE SITE IS CLOSED TO THE PUBLIC

**Do not reopen it without being asked.** It is closed pending a lawyer's
review of the terms, refund policy, and the claims the marketing pages make.
Mahmut asked for this; it is not a technical state to "fix".

The gate lives in `lib/site/access.ts`:

```ts
const FORCE_CLOSED = true;   // overrides SITE_PUBLIC entirely
```

`isPublicAccessSuspended()` is read by the middleware gate, `app/robots.ts`,
`app/sitemap.ts`, the billing checkout action, and both email crons — so that
one constant shuts everything coherently.

While closed:

| Still works | Blocked |
| --- | --- |
| `/api/*` — Paddle webhook and crons (existing billing must never break) | every marketing, product and dashboard page |
| `/login`, `/auth/*` — so operators can sign in | `/signup` — no new accounts |
| `/robots.txt`, `/sitemap.xml` — so they can say "index nothing" | new subscriptions on any plan |
| downgrade / cancel — nobody gets trapped in a paid plan | |

Two bypasses: the **admin allowlist** (`lib/auth/admins.ts`) passes
automatically once signed in, and `SITE_PREVIEW_KEY` turns `/?preview=<key>`
into a 7-day cookie for someone without an account.

**To reopen** (only when asked): set `FORCE_CLOSED = false` *and*
`SITE_PUBLIC=1` in Vercel. Both are required. Also restore the two email crons
in `vercel.json` if onboarding email and the founder digest should resume.

---

## 3. Branch discipline

Develop and push **only** to `claude/tariff-os-fresh-start-8qwgnw`. Never push
to another branch without explicit permission. Do not open a PR unless asked.

Commits end with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: <session url>
```

Never commit secrets. Never put a model identifier in a commit message, PR
body, code comment, or anything else pushed to the repo.

---

## 4. Architecture map

```
app/(marketing)/       public pages incl. /hs-code/[slug] (105 generated pages)
app/classify/          the wizard; guest flow + signed-in flow, server actions
app/dashboard/         product; /dashboard/admin/* is operator-only (404 otherwise)
app/api/v1/            public API, authenticated by API key
app/api/paddle/        webhook — signature-verified, grants/revokes plans
app/api/cron/          refresh-tariffs · lifecycle · digest
lib/ai/                provider chain: primary → groq → openrouter → cerebras → offline
lib/tariff-data/       seed dataset + live adapters (USITC HTS, UK Trade Tariff)
lib/billing/           Paddle client, webhook logic, revenue summary
lib/email/             Resend wrapper, notifications, lifecycle copy
lib/site/access.ts     the public-access gate
lib/auth/admins.ts     operator allowlist
```

**AI fallback is never silent.** If anything other than the primary provider
serves a result, the chain stamps `service_notice` (classification) or
`degraded_reason` (Quick Find) onto it. Absence of that field is a reliable
signal the primary provider handled the request — useful for diagnosis.

**Tariff data**: `TARIFF_DATA_SOURCE=live` switches from the seed dataset to
the USITC and UK government APIs. Live results carry `is_placeholder: false`
and a real `source`/`as_of`. Don't claim EU MFN rates for non-EU destinations
— `lib/tariff-data/seed-provider.ts` guards this with an `EU_UK` set.

---

## 5. Crons

`vercel.json` currently schedules **only** `refresh-tariffs` (06:00 UTC), which
sends no mail.

Both email crons are deliberately unscheduled **and** guarded in code:

- **lifecycle** — onboarding nudges. Off because emailing people back to a
  site they cannot open helps nobody.
- **digest** — daily founder numbers. Off because a closed site has no funnel
  to report on. Accepts `?force=1` for an on-demand run.

Event-driven mail is untouched and should stay that way: broker feedback,
purchase, and refund notifications only fire when something real happens.

---

## 6. Known open defects

Found by a production audit on 2026-08-04. (1) and (2) are fixed; (3) and the
notes below are still open. None block the closed site.

1. ~~**ISR is dead site-wide.**~~ **Fixed 2026-09-19** (`lib/tariff-data/cached-duty.ts`).
   Page-level caching still cannot engage — the root layout calls `getLocale()`
   → `cookies()`, which opts every route into dynamic rendering, and that is
   left alone because the multi-language support depends on it. Instead the
   *data* is cached: duty lookups go through `unstable_cache` with a 24h
   window, so pages still render per request but stop calling the government
   APIs on every view. Verified locally — four requests to one page produced
   one provider call per destination instead of four. The refresh cron clears
   the `tariff-duty` tag so figures can't go stale beyond a day.

2. ~~**Cold renders can exceed 45s.**~~ Addressed by the same change: only the
   first request after a cache miss pays upstream latency.

3. **Doubled brand in `<title>`.** `Pricing — Kustaro | Kustaro`,
   `HS code 6109.10 — … | Kustaro | Kustaro`. The root layout's
   `template: "%s | Kustaro"` is applied to titles that already carry the
   brand. Visible in search results and browser tabs. Minor; ~5 minute fix.

Also noted: page metadata is not localized (TR pages render Turkish content
under an English `<title>`), and there is no DMARC record on kustaro.app.

---

## 7. Gotchas that cost time

- **Vercel env changes need a redeploy.** Setting a variable does nothing
  until the next deployment. Proven twice the hard way.
- **Chromium cannot reach the network in the agent sandbox** (`curl` can).
  Playwright fails with `ERR_CONNECTION_RESET` even through the proxy. Don't
  burn turns on it — test via HTTP instead.
- **Testing production server actions without credentials**: action IDs differ
  between a local build and production, so extract them from the *production*
  client bundle (`grep -oE '[0-9a-f]{40}'` over the chunks linked from the
  page), then `POST` to the page URL with `Next-Action: <id>` and a JSON array
  body. The guest classify flow does **not** persist to the database, so it is
  safe to exercise this way.
- **`npm ci` after a container restart** — `node_modules` does not survive,
  and `tsc` will emit hundreds of bogus "cannot find module" errors until you
  install.
- **No Vercel or Supabase tokens in this repo or the environment.** If you
  need Vercel config, cron registration, or database reads, ask the user. Much
  can still be verified over plain HTTP against kustaro.app.
- **`pkill` in a Bash tool call can kill the shell itself** (exit 144). Kill
  by explicit PID instead.

---

## 8. Verifying production without credentials

These all work from a plain shell and are the fastest way to establish truth:

```bash
# is the gate up?
curl -s https://kustaro.app/pricing | grep -q "temporarily unavailable"

# crawler posture
curl -s https://kustaro.app/robots.txt
curl -s https://kustaro.app/sitemap.xml | grep -c "<loc>"    # 0 closed, 115 open

# billing infrastructure alive? (400/401 = real handler, not the holding page)
curl -s -X POST -d '{}' https://kustaro.app/api/paddle/webhook
curl -s -o /dev/null -w '%{http_code}' https://kustaro.app/api/cron/digest

# every URL the sitemap advertises
curl -s https://kustaro.app/sitemap.xml | grep -oE '<loc>[^<]+' | sed 's/<loc>//' \
  | while read u; do echo "$(curl -s -o /dev/null -w '%{http_code}' "$u")  $u"; done
```

---

## 9. Operational context

- **Email**: sending goes through Resend (SES-backed, on `send.kustaro.app`)
  and is independent of Google. Supabase Auth uses Resend SMTP. Customer-facing
  support address is `support@kustaro.app`.
- **Admin allowlist** (`lib/auth/admins.ts`) drives both operator notifications
  *and* the access-gate bypass. Changing a person's login email without
  updating the allowlist locks them out of the closed site. `ADMIN_EMAILS`
  overrides the file entirely if set in Vercel.
- `deniz@terra-reform.org` is on that allowlist and its Google Workspace is
  being wound down; the plan is free MX forwarding so the address keeps
  working and **no code change is needed**. If that changes, the allowlist and
  the Supabase login email must move together.

---

## 10. Deliberately deferred

Not bugs — decisions. Don't start these unprompted:

- Google Search Console verification (meta tag is live; property never
  verified, sitemap never submitted)
- JSON-LD structured data and HS chapter hub pages
- Funnel event tracking
- EU / TARIC live tariff data
- Public API and bulk-upload expansion — "when demand appears"

The standing product judgement from the last session: **the product side has
no known leaks; the open question is what a customer says, not what the code
does.** Prefer work that gets the site reopened and in front of people over
new features.
