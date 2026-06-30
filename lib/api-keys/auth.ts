import { createAdminClient } from "@/lib/db/supabase/admin";
import type { ApiKeyRow, OrganizationRow } from "@/types/database";
import { hashApiKey, parseBearerToken } from "./keys";

export interface ApiAuthContext {
  organization: OrganizationRow;
  apiKey: ApiKeyRow;
}

export type ApiAuthResult =
  | { ok: true; context: ApiAuthContext }
  | { ok: false; status: number; error: string };

/**
 * Authenticate an API request by its `Authorization: Bearer <key>` header.
 * Uses the service-role client (RLS bypass) to look up the hashed key.
 */
export async function authenticateApiRequest(
  authHeader: string | null,
): Promise<ApiAuthResult> {
  const token = parseBearerToken(authHeader);
  if (!token) {
    return { ok: false, status: 401, error: "Missing API key. Provide 'Authorization: Bearer <key>'." };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return {
      ok: false,
      status: 503,
      error: "API is not configured (missing Supabase service role key).",
    };
  }

  const keyHash = hashApiKey(token);
  const { data: apiKey, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !apiKey) {
    return { ok: false, status: 401, error: "Invalid or revoked API key." };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", apiKey.organization_id)
    .maybeSingle();

  if (!organization) {
    return { ok: false, status: 401, error: "Organization not found for API key." };
  }

  // Best-effort last-used timestamp (don't block the request on failure).
  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKey.id);

  return {
    ok: true,
    context: {
      organization: organization as OrganizationRow,
      apiKey: apiKey as ApiKeyRow,
    },
  };
}
