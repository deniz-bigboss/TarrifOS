"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { createApiKeySchema } from "@/lib/validation/schemas";
import { generateApiKey } from "@/lib/api-keys/keys";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

/**
 * Create an API key. The plaintext key is returned ONCE and never stored — only
 * its SHA-256 hash and a display prefix are persisted.
 */
export async function createApiKeyAction(
  raw: unknown,
): Promise<ActionResult<{ plaintext: string; prefix: string }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = createApiKeySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") };
  }

  const supabase = createClient();
  const { plaintext, keyHash, keyPrefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    organization_id: session.organization.id,
    name: parsed.data.name,
    key_hash: keyHash,
    key_prefix: keyPrefix,
  });

  if (error) {
    return { ok: false, error: `Failed to create key: ${error.message}` };
  }

  revalidatePath("/dashboard/api-keys");
  return { ok: true, data: { plaintext, prefix: keyPrefix } };
}

export async function revokeApiKeyAction(
  keyId: string,
): Promise<ActionResult<null>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const supabase = createClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("organization_id", session.organization.id);

  if (error) {
    return { ok: false, error: `Failed to revoke key: ${error.message}` };
  }

  revalidatePath("/dashboard/api-keys");
  return { ok: true, data: null };
}
