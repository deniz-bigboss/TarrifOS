"use server";

import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";

export interface CreateAccountResult {
  ok: boolean;
  /** Set when the server can't create the user itself and the client should
   *  fall back to the standard client-side signUp (email confirmation flow). */
  needsClientSignup?: boolean;
  error?: string;
}

/**
 * Creates a confirmed account server-side with the service-role admin API.
 *
 * This deliberately sets `email_confirm: true` so Supabase sends NO
 * confirmation email — which (a) removes the built-in-SMTP "email rate limit
 * exceeded" wall that blocks repeated sign-ups, and (b) lets the client sign
 * in immediately with the password, so the browser session is always for the
 * newly-created account (fixing the "a previous account opened" bug that came
 * from reading a stale session after signUp).
 *
 * If the service-role key isn't configured, we signal the client to fall back
 * to the ordinary client-side signUp.
 */
export async function createAccount(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<CreateAccountResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const fullName = input.fullName.trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (!isAdminConfigured()) {
    return { ok: false, needsClientSignup: true };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists")
      ) {
        return {
          ok: false,
          error: "An account with this email already exists — log in instead.",
        };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Could not create the account.",
    };
  }
}
