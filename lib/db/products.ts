import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductRow } from "@/types/database";
import type { ProductInput } from "@/types";

/** Saved product / SKU library — repeat-SKU importers reclassify the same
 * products against new destinations without retyping them. */

export async function listProducts(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[products] list failed:", error);
    return [];
  }
  return (data as ProductRow[]) ?? [];
}

export async function getProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<ProductRow | null> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as ProductRow) ?? null;
}

export interface SaveProductArgs {
  organizationId: string;
  createdBy: string | null;
  input: ProductInput;
  latest: {
    recommendedCode: string | null;
    confidence: number | null;
    readinessScore: number | null;
  };
}

/** Save (or refresh) a product in the library. Matches by SKU when present,
 * else by product name, so re-saving after a reclassify updates in place. */
export async function saveProduct(
  supabase: SupabaseClient,
  args: SaveProductArgs,
): Promise<{ id: string; updated: boolean }> {
  const { input, organizationId } = args;

  const flags: Record<string, unknown> = {};
  for (const key of [
    "is_textile",
    "is_electronics",
    "contains_battery",
    "is_food",
    "is_cosmetic",
    "is_medical_or_health_related",
    "is_chemical",
    "is_dual_use_or_restricted",
    "certificate_of_origin_available",
  ] as const) {
    if (input[key] !== undefined) flags[key] = input[key];
  }

  const fields = {
    product_name: input.product_name,
    sku: input.sku ?? null,
    description: input.product_description ?? null,
    material_composition: input.material_composition ?? null,
    intended_use: input.intended_use ?? null,
    category: input.category ?? null,
    origin_country: input.origin_country ?? null,
    last_destination_country: input.destination_country ?? null,
    extra_input: Object.keys(flags).length ? flags : null,
    latest_recommended_code: args.latest.recommendedCode,
    latest_confidence: args.latest.confidence,
    latest_readiness_score: args.latest.readinessScore,
    last_classified_at: new Date().toISOString(),
  };

  let match = supabase
    .from("products")
    .select("id")
    .eq("organization_id", organizationId);
  match = input.sku
    ? match.eq("sku", input.sku)
    : match.eq("product_name", input.product_name);
  const { data: existing } = await match.limit(1).maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("products")
      .update(fields)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { id: existing.id, updated: true };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      organization_id: organizationId,
      created_by: args.createdBy,
      ...fields,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Insert failed.");
  return { id: data.id, updated: false };
}

/** Rebuild a wizard-prefill ProductInput from a saved product. */
export function productRowToInput(row: ProductRow): Partial<ProductInput> {
  const extra = (row.extra_input ?? {}) as Record<string, boolean>;
  return {
    product_name: row.product_name,
    product_description: row.description ?? "",
    sku: row.sku,
    material_composition: row.material_composition,
    intended_use: row.intended_use,
    category: row.category,
    origin_country: row.origin_country ?? undefined,
    destination_country: row.last_destination_country ?? undefined,
    is_textile: extra.is_textile,
    is_electronics: extra.is_electronics,
    contains_battery: extra.contains_battery,
    is_food: extra.is_food,
    is_cosmetic: extra.is_cosmetic,
    is_medical_or_health_related: extra.is_medical_or_health_related,
    is_chemical: extra.is_chemical,
    is_dual_use_or_restricted: extra.is_dual_use_or_restricted,
    certificate_of_origin_available: extra.certificate_of_origin_available,
  };
}
