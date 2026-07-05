"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import type { ActionResult } from "@/app/dashboard/classifications/actions";

/** Duplicate a saved product (e.g. to fork a variant SKU). */
export async function duplicateProductAction(
  productId: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const supabase = createClient();
  const { data: row } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  if (!row || row.organization_id !== session.organization.id) {
    return { ok: false, error: "Product not found." };
  }

  const { id: _id, created_at: _c, ...rest } = row as Record<string, unknown>;
  const { data, error } = await supabase
    .from("products")
    .insert({
      ...rest,
      product_name: `${row.product_name} (copy)`,
      sku: row.sku ? `${row.sku}-copy` : null,
      created_by: session.user.id,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Duplicate failed." };
  }
  revalidatePath("/dashboard/products");
  return { ok: true, data: { id: data.id } };
}

/** Remove a product from the library. */
export async function deleteProductAction(
  productId: string,
): Promise<ActionResult<null>> {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated." };

  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("organization_id", session.organization.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/products");
  return { ok: true, data: null };
}
