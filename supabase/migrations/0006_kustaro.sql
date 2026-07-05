-- ===========================================================================
-- Kustaro rebrand + self-serve credit plans + saved SKU library.
-- ===========================================================================

-- 1. Plan renames for the credit-based self-serve tiers:
--    growth -> pro, forwarder -> business, enterprise -> forwarder (custom).
--    Order matters: free the "forwarder" value before reusing it.
update public.organizations set plan = 'business'  where plan = 'forwarder';
update public.organizations set plan = 'forwarder' where plan = 'enterprise';
update public.organizations set plan = 'pro'       where plan = 'growth';

update public.billing_events set plan = 'business'  where plan = 'forwarder';
update public.billing_events set plan = 'forwarder' where plan = 'enterprise';
update public.billing_events set plan = 'pro'       where plan = 'growth';

-- 2. Extra structured input on classification requests: product-fact flags,
--    pasted invoice/spec text, certificate info, and refinement metadata
--    (refined_from request id + previous confidence for the improvement loop).
alter table public.classification_requests
  add column if not exists extra_input jsonb;

-- 3. Saved product / SKU library (repeat-SKU importers reclassify the same
--    products against new lanes).
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid,
  product_name text not null,
  sku text,
  description text,
  material_composition text,
  intended_use text,
  category text,
  origin_country text,
  last_destination_country text,
  extra_input jsonb,
  latest_recommended_code text,
  latest_confidence numeric,
  latest_readiness_score int,
  last_classified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists products_org_idx
  on public.products (organization_id, created_at desc);

alter table public.products enable row level security;

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (public.is_org_member(organization_id));

drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert with check (public.is_org_member(organization_id));

drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update using (public.is_org_member(organization_id));

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete using (public.is_org_member(organization_id));
