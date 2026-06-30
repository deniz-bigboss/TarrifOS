-- ===========================================================================
-- TariffOS — auto-provision one organization + profile per new user.
-- Runs as SECURITY DEFINER so it bypasses RLS for the initial bootstrap.
-- This is the primary workspace-creation path; the app has a service-role
-- fallback for any users created before this trigger existed.
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  display_name text;
  org_name text;
begin
  -- Skip if this user already has a profile (idempotent).
  if exists (select 1 from public.profiles where user_id = new.id) then
    return new;
  end if;

  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  org_name := coalesce(split_part(display_name, ' ', 1), 'My') || '''s Workspace';

  insert into public.organizations (name, plan)
  values (org_name, 'free')
  returning id into new_org_id;

  insert into public.profiles (user_id, organization_id, full_name)
  values (new.id, new_org_id, display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
