-- ===========================================================================
-- TariffOS — Row Level Security
-- Every workspace table is scoped to the caller's organization(s). The
-- service-role key (used by the API and usage tracking) bypasses RLS.
-- ===========================================================================

-- Membership helper (security definer avoids recursive RLS on profiles).
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and organization_id = org
  );
$$;

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.classification_requests enable row level security;
alter table public.classification_results enable row level security;
alter table public.classification_candidates enable row level security;
alter table public.tariff_codes enable row level security;
alter table public.documents enable row level security;
alter table public.api_keys enable row level security;
alter table public.usage_events enable row level security;
alter table public.feedback_labels enable row level security;
alter table public.billing_events enable row level security;

-- ----- organizations -----
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select using (public.is_org_member(id));

drop policy if exists org_insert on public.organizations;
create policy org_insert on public.organizations
  for insert with check (auth.uid() is not null);

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations
  for update using (public.is_org_member(id));

-- ----- profiles -----
drop policy if exists profile_select on public.profiles;
create policy profile_select on public.profiles
  for select using (user_id = auth.uid() or public.is_org_member(organization_id));

drop policy if exists profile_insert on public.profiles;
create policy profile_insert on public.profiles
  for insert with check (user_id = auth.uid());

drop policy if exists profile_update on public.profiles;
create policy profile_update on public.profiles
  for update using (user_id = auth.uid());

-- ----- classification_requests -----
drop policy if exists creq_all on public.classification_requests;
create policy creq_all on public.classification_requests
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ----- classification_results -----
drop policy if exists cres_all on public.classification_results;
create policy cres_all on public.classification_results
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ----- classification_candidates (scoped through the parent result) -----
drop policy if exists ccand_all on public.classification_candidates;
create policy ccand_all on public.classification_candidates
  for all using (
    exists (
      select 1 from public.classification_results r
      where r.id = result_id and public.is_org_member(r.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.classification_results r
      where r.id = result_id and public.is_org_member(r.organization_id)
    )
  );

-- ----- tariff_codes (public read-only reference) -----
drop policy if exists tariff_select on public.tariff_codes;
create policy tariff_select on public.tariff_codes
  for select using (true);

-- ----- documents -----
drop policy if exists docs_all on public.documents;
create policy docs_all on public.documents
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ----- api_keys -----
drop policy if exists apikeys_all on public.api_keys;
create policy apikeys_all on public.api_keys
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ----- usage_events (read in app; writes via service role) -----
drop policy if exists usage_select on public.usage_events;
create policy usage_select on public.usage_events
  for select using (public.is_org_member(organization_id));

drop policy if exists usage_insert on public.usage_events;
create policy usage_insert on public.usage_events
  for insert with check (public.is_org_member(organization_id));

-- ----- feedback_labels -----
drop policy if exists feedback_all on public.feedback_labels;
create policy feedback_all on public.feedback_labels
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ----- billing_events -----
drop policy if exists billing_select on public.billing_events;
create policy billing_select on public.billing_events
  for select using (public.is_org_member(organization_id));
