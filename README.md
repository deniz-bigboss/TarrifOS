# Kustaro

**Self-serve customs-readiness workspace for product classification, HS-code
candidates, document checklists, risk flags, and exportable reports.**

Live: **https://kustaro.app** (also served at tariff-os.vercel.app)

Kustaro helps importers, exporters, e-commerce brands, and freight teams
classify products for customs **before they ship**: a guided wizard turns
product facts into HS-code candidates with reasoning, a confidence score,
missing-information questions, a required-document checklist, risk flags, and
a customs-readiness score out of 100 — all exportable as a
**Kustaro Customs-Readiness Report**.

> Every output is a customs-readiness **recommendation for review** grounded
> in retrieved tariff evidence. It is not legal advice and does not guarantee
> acceptance by customs authorities.

---

## Product surface

| Route | What it does |
| --- | --- |
| `/` | Marketing site (8 languages, geo-detected) |
| `/classify` | **The core flow.** Guided 5-step wizard — guests get one free classification with no signup; results render in-browser with readiness score + improve-confidence loop |
| `/dashboard` | Usage, review queue, quick stats |
| `/dashboard/classifications` | History — every classification, refinement versions included |
| `/dashboard/products` | Saved SKU library — reclassify repeat products in one click |
| `/dashboard/bulk-upload` | CSV bulk classification (beta, first 10 rows) |
| `/dashboard/billing` | Self-serve credit plans (Free 3/mo → Forwarder custom) |
| `/hs-code/*`, `/customs-documents/*`, `/customs-readiness/*` | Long-tail SEO templates |

The **confidence-improvement loop** is the differentiator: when the result has
open questions (or confidence < 80%), the user answers 2–5 targeted questions,
Kustaro re-runs the classification, shows old → new confidence, and keeps both
versions in history.

---

## 1. Running Kustaro locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase; everything else is optional
npm run dev                  # http://localhost:3000
```

The app runs out of the box with `AI_PROVIDER=mock` — no paid AI required.

## 2. Environment variables

See `.env.example` for the full annotated list. The short version:

- **Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (auth + persistence).
- **Optional AI:** `AI_PROVIDER` = `mock | gemini | openai | anthropic |
  groq | openrouter | cerebras` plus the matching key. Free-tier fallback
  chain: Groq → OpenRouter → Cerebras → offline engine.
- **Optional tariff data:** `TARIFF_DATA_SOURCE=live` for UK/US government
  APIs (no keys needed); `TRADE_REMEDY_OVERRIDE_URL` for hosted trade-war
  rate overrides; `CRON_SECRET` for the daily refresh cron.
- **Optional billing:** Paddle (`NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
  `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_*`) or Stripe
  (`STRIPE_*`) behind `PAYMENT_PROVIDER`.
- **Public access:** `SITE_PUBLIC=1` opens the site; anything else keeps it
  closed. See below.

### Public-access gate

The site ships **closed to the public**. Anonymous visitors get the holding
page at `/unavailable`, crawlers are told to index nothing, and
`changePlanAction` refuses to start a new subscription. This is deliberate: the
gate should only ever come down as an explicit act, never because a config
value went missing.

While the gate is up:

| Still works | Blocked |
| --- | --- |
| `/api/paddle/webhook`, `/api/cron/*` (existing billing must not break) | every marketing, product and dashboard page |
| `/login` and `/auth/*` (so operators can get in) | `/signup` — no new accounts |
| `/robots.txt`, `/sitemap.xml` (so they can say "index nothing") | new subscriptions, on any plan |
| downgrade / cancel — nobody gets trapped in a paid plan | |

Two ways past it:

- **Operators.** Anyone on the admin allowlist (`lib/auth/admins.ts`, or
  `ADMIN_EMAILS`) passes automatically once signed in. No setup needed.
- **A shared preview link.** Set `SITE_PREVIEW_KEY` to a long random string,
  then send `https://kustaro.app/?preview=<key>`. That swaps the key for a
  7-day cookie and strips it from the URL, so a lawyer or advisor can browse
  the whole site without an account.

**Currently hard-closed.** `FORCE_CLOSED` in `lib/site/access.ts` is `true`,
which overrides `SITE_PUBLIC` entirely — so a stale `SITE_PUBLIC=1` sitting in
Vercel does nothing. Closing the site should never depend on a dashboard only
one person can reach.

**To reopen:** set `FORCE_CLOSED = false`, and set `SITE_PUBLIC=1` in Vercel
(both are required — the env var governs again once the override is off). Also
restore the lifecycle cron in `vercel.json` (removed while closed — see §9) if
you want onboarding email running again.

## 3. Free-first development

Kustaro is built to cost $0 until it earns money: Vercel free tier, Supabase
free tier, `AI_PROVIDER=mock` by default, free-tier AI fallbacks
(Groq/OpenRouter/Cerebras), local seed tariff data, and plan limits that stop
free users from burning real AI calls. Analytics are Vercel Web Analytics
(cookieless). Billing is optional — with no provider configured, upgrade
buttons open a contact/manual-payment dialog instead of blocking the MVP.

## 4. AI providers

`lib/ai/` defines one `AIProvider` interface with implementations for mock
(deterministic, offline), Gemini, OpenAI, Anthropic, and OpenAI-compatible
free hosts (Groq, OpenRouter, Cerebras). If the primary provider hits a rate
limit or outage, the fallback chain takes over and the user sees a service
notice — degraded service is never silent.

## 5. Supabase setup

1. Create a project at [app.supabase.com](https://app.supabase.com).
2. Run the migrations in `supabase/migrations/` **in order** (0001 → 0006)
   in the SQL editor.
3. Seed the tariff reference data: `supabase/seed/seed_tariff_codes.sql`.
4. Copy the project URL + keys into `.env.local`.
5. In Auth → URL Configuration, set your site URL and redirect URLs.

Migration `0006_kustaro.sql` adds the saved-products table, the wizard's
extra-input column, and renames the plan ids to the credit model.

## 6. Seed tariff data

`lib/tariff-data/seed-data.ts` is the offline reference dataset (regenerate
the SQL with `npm run seed:sql`). With `TARIFF_DATA_SOURCE=live`, GB/US
destinations fetch real MFN rates from the UK Trade Tariff API and USITC HTS
with automatic fallback to seed data. Country trade-remedy tariffs
(Section 301/232, 2025 reciprocal, EU CVDs…) live in
`lib/tariff-data/trade-remedies.ts` with a hosted-JSON override.

## 7. Rebrand notes

Kustaro was previously TariffOS/TarrifOS. User-facing copy, metadata,
reports, exports, and the API key prefix (`kustaro_sk_`, legacy
`tariffos_sk_` keys still authenticate) are rebranded. Internal database
table names (e.g. `classification_requests`) are intentionally unchanged.
Plan ids were migrated: `growth → pro`, `forwarder → business`,
`enterprise → forwarder` (0006).

## 8. Legal disclaimer

Kustaro outputs are customs-readiness recommendations generated from
available product information and tariff-reference data. They are **not
legal advice** and do not guarantee acceptance by customs authorities. Final
classification and customs declarations should be verified before official
use. High-risk categories (food, cosmetics, chemicals, batteries, medical,
dual-use…) always carry a review warning. See `/terms` and `/privacy`.

## 9. Deployment to Kustaro.app

Live. Vercel project **kustaro** serves production from this repo's working
branch, with **kustaro.app** attached (and `www.` redirecting to the apex).
Already wired:

- `NEXT_PUBLIC_SITE_URL`, canonical URLs, Open Graph, sitemap, robots and the
  web manifest all point at `https://kustaro.app`.
- Supabase Auth site URL and redirect allow-list point at kustaro.app, with
  transactional mail sent through Resend SMTP from `no-reply@kustaro.app`.
- The Paddle webhook destination points at
  `https://kustaro.app/api/paddle/webhook`, and Paddle's Default Payment Link
  points at `https://kustaro.app/pay`.

Both are per-account settings in Paddle, so the sandbox and live accounts each
need their own webhook destination, Default Payment Link and approved domain.

**Current status: closed to the public** pending legal review — see the
public-access gate in §2. `vercel.json` runs two crons while closed
(`refresh-tariffs`, `digest`); the lifecycle onboarding cron is deliberately
unscheduled, because emailing people back to a site they can't open helps
nobody. The route still exists and refuses to send while the gate is up, so
re-enabling it is a one-line change to `vercel.json`.

---

## Payments

Billing runs through a provider abstraction (`lib/billing/payment.ts`) chosen
by `PAYMENT_PROVIDER`:

- **Paddle (active).** Merchant of record — an individual can sell worldwide
  without forming a company; payouts go to a personal bank account. Hosted
  overlay checkout + signed webhook at `/api/paddle/webhook`.
- **Stripe (future / EU).** Fully wired, dormant until the EU move.
- **Unconfigured.** Pricing still shows; upgrades open a contact dialog and
  the founder sets plans manually in the `organizations` table.

### Paddle webhook events

Subscribe the notification destination (`/api/paddle/webhook`) to both groups:

- `subscription.created` · `activated` · `updated` · `canceled` · `paused` ·
  `resumed` — these drive the plan on the organization.
- `adjustment.created` · `adjustment.updated` — refunds and credits. These are
  recorded to `billing_events` as an audit trail and deliberately do **not**
  change the plan: a refund that also ends the subscription arrives separately
  as `subscription.canceled`, and a partial refund must not revoke access.

The environment (sandbox vs. production) is auto-detected from the client
token prefix (`test_` → sandbox), so `PADDLE_ENV` only needs setting to
override. Refund terms are published at `/refunds`.

### Default Payment Link → `/pay`

Paddle requires a **Default Payment Link** under Checkout settings before it
will create any checkout — with it unset, the overlay fails with a generic
"Something went wrong". Point it at:

```
https://kustaro.app/pay
```

Paddle appends `?_ptxn=<transaction id>` to that link when it emails a customer
to complete or retry a payment (invoices, card-retry dunning). `/pay` is public
by design — the recipient may have no session — and resumes the transaction in
the Paddle overlay. The domain also has to be added to Paddle's approved
domains, or Paddle.js refuses to open on it.

Note that changing any `PADDLE_*` environment variable needs a redeploy before
it takes effect; the running deployment keeps the values it was built with.

Plans: Free $0 (3/mo) · Starter $19 (50/mo) · Pro $49 (250/mo) · Business
$149 (1,000/mo) · Forwarder from $499 (custom). Limits reset monthly; at the
limit no AI calls are made and old classifications stay viewable.

## API (waitlist)

The Kustaro API will let teams classify products, retrieve customs-readiness
reports, and integrate HS-code candidate workflows into internal systems.
`POST /api/v1/classify` exists for early access holders — contact us. Keys
are managed in Dashboard → API keys.

> Live payment flows can only be verified end-to-end against a real merchant
> account (this repo's CI/sandbox can't reach the payment APIs). Plan
> mapping, webhook signature verification, and event handling are covered by
> offline unit tests — do a sandbox transaction before going live.
