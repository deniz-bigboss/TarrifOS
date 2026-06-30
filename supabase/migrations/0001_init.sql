-- ===========================================================================
-- TariffOS — initial schema
-- Run with the Supabase SQL editor or `supabase db push`.
-- ===========================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Core workspace tables
-- --------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists profiles_org_idx on public.profiles (organization_id);

-- --------------------------------------------------------------------------
-- Classification tables
-- --------------------------------------------------------------------------
create table if not exists public.classification_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  product_name text not null,
  product_description text,
  material_composition text,
  intended_use text,
  brand text,
  model text,
  sku text,
  category text,
  supplier_country text,
  origin_country text,
  destination_country text,
  import_or_export text,
  declared_value numeric,
  currency text,
  quantity numeric,
  unit_weight numeric,
  shipping_method text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create index if not exists cr_org_created_idx
  on public.classification_requests (organization_id, created_at desc);

create table if not exists public.classification_results (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.classification_requests (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  recommended_code text,
  recommended_title text,
  confidence numeric,
  confidence_label text,
  reasoning_summary text,
  key_factors jsonb default '[]'::jsonb,
  missing_information jsonb default '[]'::jsonb,
  required_documents jsonb default '[]'::jsonb,
  restriction_warnings jsonb default '[]'::jsonb,
  human_review_required boolean not null default false,
  human_review_reason text,
  broker_ready_explanation text,
  duty_estimate jsonb,
  raw_ai_output jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cres_request_idx on public.classification_results (request_id);
create index if not exists cres_org_idx on public.classification_results (organization_id);

create table if not exists public.classification_candidates (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.classification_results (id) on delete cascade,
  code text not null,
  title text,
  reason text,
  confidence numeric,
  source text
);

create index if not exists ccand_result_idx on public.classification_candidates (result_id);

-- --------------------------------------------------------------------------
-- Reference tariff codes (optional DB copy of the seed dataset)
-- --------------------------------------------------------------------------
create table if not exists public.tariff_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  jurisdiction text not null default 'GLOBAL',
  title text not null,
  description text,
  keywords jsonb default '[]'::jsonb,
  chapter text,
  section text,
  duty_rate_placeholder text,
  required_documents jsonb default '[]'::jsonb,
  restriction_notes jsonb default '[]'::jsonb,
  risk_level text default 'low',
  created_at timestamptz not null default now(),
  unique (code, jurisdiction)
);

create index if not exists tariff_code_idx on public.tariff_codes (code);

-- --------------------------------------------------------------------------
-- Documents
-- --------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  request_id uuid references public.classification_requests (id) on delete cascade,
  file_name text not null,
  file_type text,
  storage_path text,
  extracted_text text,
  created_at timestamptz not null default now()
);

create index if not exists docs_org_idx on public.documents (organization_id);

-- --------------------------------------------------------------------------
-- API keys & usage
-- --------------------------------------------------------------------------
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists apikeys_org_idx on public.api_keys (organization_id);
create index if not exists apikeys_hash_idx on public.api_keys (key_hash);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  api_key_id uuid references public.api_keys (id) on delete set null,
  event_type text not null,
  quantity integer not null default 1,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_org_created_idx
  on public.usage_events (organization_id, created_at desc);

-- --------------------------------------------------------------------------
-- Feedback (the data moat) & billing
-- --------------------------------------------------------------------------
create table if not exists public.feedback_labels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  classification_result_id uuid not null references public.classification_results (id) on delete cascade,
  actual_code text,
  was_correct boolean,
  broker_notes text,
  shipment_cleared boolean,
  delay_occurred boolean,
  penalty_occurred boolean,
  created_at timestamptz not null default now()
);

create index if not exists feedback_org_idx on public.feedback_labels (organization_id);
create index if not exists feedback_result_idx on public.feedback_labels (classification_result_id);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  status text,
  created_at timestamptz not null default now()
);

create index if not exists billing_org_idx on public.billing_events (organization_id);
