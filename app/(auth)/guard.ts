import { createClient, isSupabaseConfigured } from "@/lib/db/supabase/server";

/**
 * Returns true when a real session already exists, so the login/signup pages
 * can bounce logged-in users to the dashboard. This prevents the confusing
 * state where someone is already signed in, submits the signup form, and ends
 * up back in their existing account.
 */
export async function redirectIfAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}
