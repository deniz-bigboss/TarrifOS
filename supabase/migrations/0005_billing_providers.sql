-- Payment-provider linkage on organizations. Both providers coexist behind
-- PAYMENT_PROVIDER: Paddle (merchant of record — no registered company
-- needed) is active now, Stripe is kept for the later EU move. Columns are
-- nullable so an org only carries the ids for the provider it paid through.
alter table public.organizations
  -- Stripe (future / EU)
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  -- Paddle (active)
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text;

-- Clean up the earlier iyzico linkage if a previous version of this migration
-- ran (iyzico was dropped: it requires a registered company).
alter table public.organizations
  drop column if exists iyzico_customer_reference,
  drop column if exists iyzico_subscription_reference;

create index if not exists organizations_stripe_customer_idx
  on public.organizations (stripe_customer_id);

create index if not exists organizations_paddle_customer_idx
  on public.organizations (paddle_customer_id);
