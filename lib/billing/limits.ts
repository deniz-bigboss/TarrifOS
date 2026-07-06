import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlan } from "./plans";
import { countUsageThisMonth } from "@/lib/db/usage";
import type { PlanId } from "@/types/database";

export interface LimitStatus {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  plan: PlanId;
  message?: string;
}

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/**
 * Counts classifications created this calendar month for an organization and
 * checks them against the plan's monthly limit. Works with any Supabase client
 * (user-scoped or admin). Fails open only on query error, never on limit logic.
 */
export async function checkClassificationLimit(
  supabase: SupabaseClient,
  organizationId: string,
  plan: PlanId,
): Promise<LimitStatus> {
  const planDef = getPlan(plan);
  const limit = planDef.monthlyLimit;

  const { count, error } = await supabase
    .from("classification_requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", startOfMonthISO());

  if (error) {
    console.error("[limits] count query failed:", error);
    // Fail open to avoid blocking paying customers on a transient error.
    return { allowed: true, used: 0, limit, remaining: limit, plan };
  }

  const used = count ?? 0;

  if (limit == null) {
    return { allowed: true, used, limit: null, remaining: null, plan };
  }

  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit,
    remaining,
    plan,
    message: allowed
      ? undefined
      : `Monthly limit reached for the ${planDef.name} plan (${used}/${limit}). Upgrade to continue classifying.`,
  };
}

/**
 * Counts machine report-translations used this calendar month and checks them
 * against the plan's translation limit. Each translation is one AI call, so
 * this bounds AI cost independently of classifications — a bored user can't
 * drain the quota by translating old reports.
 */
export async function checkTranslationLimit(
  supabase: SupabaseClient,
  organizationId: string,
  plan: PlanId,
): Promise<LimitStatus> {
  const planDef = getPlan(plan);
  const limit = planDef.monthlyTranslationLimit;

  const used = await countUsageThisMonth(supabase, organizationId, "translation");

  if (limit == null) {
    return { allowed: true, used, limit: null, remaining: null, plan };
  }
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;
  return {
    allowed,
    used,
    limit,
    remaining,
    plan,
    message: allowed
      ? undefined
      : `Monthly translation limit reached for the ${planDef.name} plan (${used}/${limit}). Translations reset next month, or upgrade for more. The English report is always available.`,
  };
}
