# TariffOS

**AI-native customs / tariff classification and landed-cost recommendation platform.**

TariffOS helps importers, exporters, e-commerce brands and freight forwarders
classify products, estimate duties/taxes, identify required customs documents,
and generate a broker-ready classification report — with evidence, a confidence
score, and an automatic human-review flag for high-risk or low-confidence cases.

> This is a structured workflow product, not a chatbot. Every result is grounded
> in retrieved tariff evidence and clearly marked as a recommendation, not legal
> advice.

---

## Features

- **Landing + pricing** marketing site (premium B2B SaaS styling).
- **Supabase Auth** with one auto-provisioned organization workspace per user.
- **Multi-step classification wizard** (product, trade lane, documents, review).
- **Classification engine** with a 7-stage pipeline:
  `normalize → retrieve → reason → validate → confidence → broker report → save`.
- **Modular tariff-data adapter** (`TariffDataProvider`) with a local
  `SeedTariffDataProvider` (99 HS-style seed codes across all required
  categories) plus the full HS chapter map (`lib/tariff-data/hs-chapters.ts`)
  injected into the classification prompt. When no local candidate fits, a
  real AI provider may propose the correct HS code from its knowledge/web
  search — such codes are format- and chapter-validated in code, always
  flagged for human review, and clearly marked as outside the local dataset.
  No live government API dependency at launch.
- **AI provider abstraction** (`AIProvider`): `MockAIProvider` (default, no key),
  `GeminiProvider` (free tier), `OpenAIProvider`, `AnthropicProvider`, plus
  free-tier fallbacks (Groq / OpenRouter / Cerebras) chained behind the primary
  with a visible service notice whenever a fallback served the result.
- **Compliance rules enforced in code**: confidence < 0.75 or any high-risk
  category (food, batteries, chemicals, medical, weapons, alcohol, …) forces
  human review. Duty figures are always placeholders.
- **Result page** with confidence meter, alternatives, documents, restrictions,
  missing-info questions, broker-ready explanation, and export (Copy / Markdown /
  JSON / print-to-PDF).
- **Dashboard** with metrics + a filterable TanStack table of classifications.
- **Feedback loop** (the data moat) — broker/customs corrections stored to
  `feedback_labels`.
- **Public API** with API-key auth, usage metering, and plan limits.
- **Billing** with plan limits and a mock upgrade flow (Stripe placeholder).

---

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn-style UI · Supabase
(Auth / Postgres / Storage) · Zod · React Hook Form · TanStack Table ·
OpenAI / Anthropic SDKs · Stripe placeholder · Vercel-ready.

---

## Project structure

```
app/
  (marketing)/        landing + pricing
  (auth)/             login + signup
  auth/               callback + signout routes
  dashboard/          overview, classifications, api-keys, billing
  api/v1/             classify, classifications/[id], feedback
components/           ui primitives + feature components
lib/
  ai/                 AIProvider abstraction (mock/openai/anthropic)
  tariff-data/        TariffDataProvider + SeedTariffDataProvider + seed data
  classification/     pipeline, confidence, risk rules
  db/                 supabase clients + repositories
  auth/               session + workspace bootstrap
  billing/            plans + limit enforcement
  api-keys/           key generation + request auth
  export/             markdown / text report rendering
  validation/         zod schemas
supabase/migrations/  SQL schema, RLS, bootstrap trigger
supabase/seed/        generated tariff_codes seed
types/                domain + database row types
```

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

The app runs out of the box with `AI_PROVIDER=mock`. Supabase is required for
auth + persistence:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Browser/auth client |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | API auth, usage tracking, workspace bootstrap |
| `AI_PROVIDER` | no | `mock` (default) \| `gemini` \| `openai` \| `anthropic` \| `groq` \| `openrouter` \| `cerebras` |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | no | Only for real AI |
| `GROQ_API_KEY` / `OPENROUTER_API_KEY` / `CEREBRAS_API_KEY` | no | Free-tier fallback chain when the primary is rate-limited |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no | Billing (placeholder) |
| `NEXT_PUBLIC_SITE_URL` | no | Auth redirects (default `http://localhost:3000`) |

### 3. Database migrations

Run the SQL files in `supabase/migrations/` in order, via the Supabase SQL
editor or the CLI:

```bash
supabase db push
# or paste each file in order:
#   0001_init.sql           tables + indexes
#   0002_rls.sql            row-level security
#   0003_bootstrap.sql      auto-create workspace on signup
#   0004_rls_hardening.sql  pins profiles.organization_id on update (security fix)
```

**Sign-up & email:** With `SUPABASE_SERVICE_ROLE_KEY` set, new accounts are
created server-side already-confirmed (`app/(auth)/actions.ts`), so **no
confirmation email is sent** — this sidesteps Supabase's built-in-SMTP "email
rate limit exceeded" wall during testing and lets sign-in happen immediately.
If you *want* email verification in production, either configure a
[custom SMTP provider](https://supabase.com/docs/guides/auth/auth-smtp) in the
Supabase dashboard (raises the low default limit) or turn off the service-role
key so the app falls back to the standard confirmation-email flow.

### 4. Seed tariff codes (optional)

The classification engine reads seed data directly from
`lib/tariff-data/seed-data.ts`, so seeding the DB is optional. To also populate
the `tariff_codes` table:

```bash
npm run seed:sql                       # regenerate supabase/seed/seed_tariff_codes.sql
# then run supabase/seed/seed_tariff_codes.sql in Supabase
```

### 5. Run

```bash
npm run dev      # http://localhost:3000
```

Sign up → a workspace is created automatically → **New classification** → use the
built-in **Cotton t-shirt** or **E-bike battery** demo prefill.

---

## Switching from MockAIProvider to a real provider

The engine works fully offline with the deterministic `MockAIProvider`. To use a
real model, set in `.env.local`:

```bash
# Gemini (free tier — no billing card; get a key at https://aistudio.google.com)
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash   # optional

# or OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini        # optional

# or Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest   # optional
```

### Free-tier fallback chain (rate limits never break the product)

Free tiers have daily/minute quotas, so TariffOS supports a **fallback chain**:
if the primary provider fails (rate limit, quota, outage), the request is
retried in order against **Groq → OpenRouter → Cerebras** — three providers
with genuinely free API tiers — and finally the deterministic offline engine.
Any of these that has a key configured joins the chain automatically:

```bash
GROQ_API_KEY=...        # https://console.groq.com
OPENROUTER_API_KEY=...  # https://openrouter.ai/keys
CEREBRAS_API_KEY=...    # https://cloud.cerebras.ai
```

Degraded service is **never silent**: when a fallback (or the offline engine)
served the result, the classification page shows an amber service notice and
Quick Find explains why its answer may be reduced. Note the fallbacks run
open-weight models without web search, so results carry a "without web-search
verification" caveat. If every key is missing or every provider fails, the
engine still answers via the offline mock, so nothing hard-breaks. The
compliance rules (human-review thresholds, placeholder duties) are enforced in
code regardless of provider.

**Quick Find** (the wizard's product-lookup toggle) only has real internet
awareness under a real provider — `mock` can only ever match its small curated
list (`lib/ai/curated-products.ts`), by design, since mock mode has zero
external calls. Real web search per provider:

- `gemini` — Google Search grounding (`googleSearch` tool). **Free tier.**
- `openai` — a search-enabled model (`OPENAI_SEARCH_MODEL`, default `gpt-4o-search-preview`).
- `anthropic` — Claude's `web_search` tool.

Either way it explicitly returns "not found" rather than fabricate details for a
product it can't confirm, and any match is shown as editable fields the user
must confirm before continuing — never auto-submitted.

### Live tariff data

Set `TARIFF_DATA_SOURCE=live` to fetch **real MFN duty rates** from free,
official government APIs instead of the offline seed placeholders:

- **GB destinations** → the [UK Trade Tariff API](https://www.trade-tariff.service.gov.uk/)
  (HMRC) — base third-country duty, VAT, **and live anti-dumping / safeguard
  measures**, which are the UK's trade-remedy duties. No key required.
- **US destinations** → the [USITC HTS](https://hts.usitc.gov/) export — the
  current column-1 (MFN) duty. No key required.

Live results are cached per instance (12h TTL) and **fall back to seed data on
any failure**, so a slow or down API never breaks a classification. When a rate
is live, the duty card shows a green source badge with the retrieval date.

**Staying current automatically:** a daily [Vercel Cron](https://vercel.com/docs/cron-jobs)
(`vercel.json` → `/api/cron/refresh-tariffs`) flushes the cache so the next
classifications re-fetch fresh rates. Protect it by setting `CRON_SECRET`. You
can also hit the route manually (with the `Authorization: Bearer <CRON_SECRET>`
header) to force a refresh.

**Trade-war tariffs — an honest note.** The 2025 US measures (Section 301/232,
the IEEPA "reciprocal" tariffs) live in HTS Chapter 99 with product/country/
exclusion logic that no free API resolves into a single rate. So those remain a
**dated reference layer** (`lib/tariff-data/trade-remedies.ts`, with a visible
"reviewed" date) that the UI always tells you to verify — while UK anti-dumping
measures *do* update live via the API above. For fully-automatic, authoritative
US trade-war rates, drop a paid specialist feed (Avalara, Zonos, CustomsInfo)
into the same `TariffDataProvider` seam.

**Editing the trade-war rates without a deploy.** Host a JSON file and point
`TRADE_REMEDY_OVERRIDE_URL` at it. It's merged over the built-in dataset by
`id` — reuse a built-in id to replace that measure's rate, or use a new id to
add one — and refreshed by the daily cron (and once per instance on first use).
See [`docs/trade-remedies.override.example.json`](docs/trade-remedies.override.example.json)
for the format. This lets ops bump the China/reciprocal rates the moment they
change, on your own cadence, without touching code.

Adding another official source is just as modular: implement the
`TariffDataProvider` interface (`lib/tariff-data/types.ts`) for EU TARIC /
Turkey / a paid API and wire it into `LiveTariffDataProvider`.

---

## API

Create a key in **Dashboard → API keys**, then:

```bash
curl -X POST http://localhost:3000/api/v1/classify \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Men'\''s cotton t-shirt",
    "product_description": "100% cotton knitted short-sleeve t-shirt",
    "material_composition": "100% cotton",
    "intended_use": "apparel",
    "origin_country": "TR",
    "destination_country": "DE",
    "declared_value": 1200,
    "currency": "EUR"
  }'
```

Other endpoints:

- `GET  /api/v1/classifications/:id` — fetch a stored classification.
- `POST /api/v1/classifications/:id/feedback` — submit broker/customs feedback:
  `{ "actual_code": "6109.10", "was_correct": true, "broker_notes": "..." }`

Every API classification is metered as a `usage_event` and counts toward the
organization's monthly plan limit (Free 10 · Starter 100 · Growth 1,000 · …).

---

## Deployment (Vercel)

1. Import the repo into Vercel.
2. Add the environment variables above.
3. Run the Supabase migrations against your project.
4. Deploy. (No microservices — a single Next.js app.)

---

## Compliance

TariffOS outputs **recommendations, not legal advice**. High-risk categories and
low-confidence results are flagged for human review. Duty/tax figures are
placeholders until an official tariff adapter is connected. Final classification
and duty treatment must be confirmed by a qualified customs broker or authority.
