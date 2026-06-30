import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import type { OrganizationRow, ProfileRow } from "@/types/database";

export interface SessionContext {
  user: User;
  profile: ProfileRow;
  organization: OrganizationRow;
}

/**
 * Returns the authenticated session context, auto-provisioning one organization
 * + profile for the user on first login (MVP: one user → one org).
 *
 * Wrapped in React.cache so it runs at most once per request.
 */
export const getSessionContext = cache(
  async (): Promise<SessionContext | null> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Look for an existing profile.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", existingProfile.organization_id)
        .maybeSingle();

      if (organization) {
        return {
          user,
          profile: existingProfile as ProfileRow,
          organization: organization as OrganizationRow,
        };
      }
    }

    // First login fallback → bootstrap an organization and profile.
    // The DB trigger (0003_bootstrap.sql) normally handles this on signup; this
    // path covers users created before the trigger existed. We use the admin
    // client so the INSERT...RETURNING isn't blocked by RLS (the membership
    // SELECT policy can't pass until the profile row exists).
    return bootstrapWorkspace(user);
  },
);

async function bootstrapWorkspace(user: User): Promise<SessionContext | null> {
  if (!isAdminConfigured()) {
    console.error(
      "[session] No profile found and SUPABASE_SERVICE_ROLE_KEY is not set; " +
        "cannot bootstrap workspace. Run migration 0003_bootstrap.sql.",
    );
    return null;
  }
  const supabase: SupabaseClient = createAdminClient();
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const orgName = deriveOrgName(user.email, fullName);

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, plan: "free" })
    .select("*")
    .single();

  if (orgError || !organization) {
    console.error("[session] failed to create organization:", orgError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      organization_id: organization.id,
      full_name: fullName,
    })
    .select("*")
    .single();

  if (profileError || !profile) {
    console.error("[session] failed to create profile:", profileError);
    return null;
  }

  return {
    user,
    profile: profile as ProfileRow,
    organization: organization as OrganizationRow,
  };
}

function deriveOrgName(email?: string, fullName?: string | null): string {
  if (fullName) return `${fullName.split(" ")[0]}'s Workspace`;
  if (email) {
    const handle = email.split("@")[0];
    return `${handle}'s Workspace`;
  }
  return "My Workspace";
}
