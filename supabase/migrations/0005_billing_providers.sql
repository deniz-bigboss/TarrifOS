-- Payment-provider linkage on organizations. Both providers coexist behind
-- PAYMENT_PROVIDER: iyzico is active in Türkiye now, Stripe is kept for the
-- later EU move. Columns are nullable so an org only carries the ids for the
-- provider it actually paid through.
alter table public.organizations
  -- Stripe (future / EU)
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  -- iyzico (Türkiye)
  add column if not exists iyzico_customer_reference text,
  add column if not exists iyzico_subscription_reference text;

create index if not exists organizations_stripe_customer_idx
  on public.organizations (stripe_customer_id);

create index if not exists organizations_iyzico_customer_idx
  on public.organizations (iyzico_customer_reference);
