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
  `SeedTariffDataProvider` (62 HS-style seed codes across all required
  categories). No live government API dependency at launch.
- **AI provider abstraction** (`AIProvider`): `MockAIProvider` (default, no key),
  `OpenAIProvider`, `AnthropicProvider`.
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
| `AI_PROVIDER` | no | `mock` (default) \| `openai` \| `anthropic` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | no | Only for real AI |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no | Billing (placeholder) |
| `NEXT_PUBLIC_SITE_URL` | no | Auth redirects (default `http://localhost:3000`) |

### 3. Database migrations

Run the SQL files in `supabase/migrations/` in order, via the Supabase SQL
editor or the CLI:

```bash
supabase db push
# or paste each file in order:
#   0001_init.sql       tables + indexes
#   0002_rls.sql        row-level security
#   0003_bootstrap.sql  auto-create workspace on signup
```

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
# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini        # optional

# or Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest   # optional
```

If a real provider is selected but its key is missing — or the API call fails —
the engine automatically falls back to the mock so nothing hard-breaks. The
compliance rules (human-review thresholds, placeholder duties) are enforced in
code regardless of provider.

Adding an official tariff source later is just as modular: implement the
`TariffDataProvider` interface (`lib/tariff-data/types.ts`) for EU TARIC / UK
Trade Tariff / US HTS / Turkey and return it from `getTariffDataProvider()`.

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
