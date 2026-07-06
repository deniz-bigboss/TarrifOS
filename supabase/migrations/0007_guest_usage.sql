-- Guest classification abuse guard: the one-free-classification cookie is
-- trivially reset (incognito), so a per-IP daily counter backstops it. Only
-- a salted hash of the IP is stored, rows are per-day, and the table is
-- reachable exclusively through the service role (RLS on, no policies).
create table if not exists public.guest_usage (
  ip_hash text not null,
  day date not null,
  count int not null default 0,
  primary key (ip_hash, day)
);

alter table public.guest_usage enable row level security;

-- Atomic upsert-increment, returns the new count for today.
create or replace function public.increment_guest_usage(p_ip_hash text)
returns int
language sql
security definer
set search_path = public
as $$
  insert into public.guest_usage (ip_hash, day, count)
  values (p_ip_hash, current_date, 1)
  on conflict (ip_hash, day)
  do update set count = guest_usage.count + 1
  returning count;
$$;

revoke execute on function public.increment_guest_usage(text)
  from public, anon, authenticated;
