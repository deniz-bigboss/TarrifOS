-- ===========================================================================
-- TariffOS — RLS hardening
--
-- The original profile_update policy had no WITH CHECK clause, so Postgres
-- reused its USING expression (user_id = auth.uid()) for the updated row.
-- That validated only user_id — organization_id could be changed freely,
-- letting a signed-in user repoint their own profile at any other
-- organization's UUID and inherit full member access to that workspace.
--
-- The fix pins updates so the row still belongs to the caller AND its
-- organization_id resolves to an org they are already a member of
-- (is_org_member reads the pre-update snapshot, so switching to a foreign
-- org can never satisfy it).
--
-- Run this in the Supabase SQL editor after 0001–0003.
-- ===========================================================================

drop policy if exists profile_update on public.profiles;
create policy profile_update on public.profiles
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.is_org_member(organization_id)
  );
