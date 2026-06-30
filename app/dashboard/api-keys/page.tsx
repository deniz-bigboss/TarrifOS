import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import {
  ApiKeysManager,
  type ApiKeyListItem,
} from "@/components/api-keys/api-keys-manager";
import { getPlan } from "@/lib/billing/plans";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApiKeyRow } from "@/types/database";

export const metadata = { title: "API keys — TariffOS" };

export default async function ApiKeysPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = createClient();
  const plan = getPlan(session.organization.plan);

  const { data } = await supabase
    .from("api_keys")
    .select("*")
    .eq("organization_id", session.organization.id)
    .order("created_at", { ascending: false });

  const keys: ApiKeyListItem[] = ((data as ApiKeyRow[]) ?? []).map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.key_prefix,
    createdAt: k.created_at,
    lastUsedAt: k.last_used_at,
    revokedAt: k.revoked_at,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API keys</h1>
        <p className="text-sm text-muted-foreground">
          Authenticate requests to the TariffOS classification API.
        </p>
      </div>

      {!plan.apiAccess && (
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex items-center gap-3 pt-6 text-sm">
            <Badge>Note</Badge>
            API access is a Growth-plan feature. You can create a key now to test,
            but production API usage requires an upgrade.
          </CardContent>
        </Card>
      )}

      <ApiKeysManager initialKeys={keys} />

      <Card>
        <CardContent className="space-y-3 pt-6 text-sm">
          <p className="font-medium">Quick start</p>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
{`curl -X POST ${siteUrl}/api/v1/classify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_name": "Men'\\''s cotton t-shirt",
    "product_description": "100% cotton knitted short-sleeve t-shirt",
    "material_composition": "100% cotton",
    "intended_use": "apparel",
    "origin_country": "TR",
    "destination_country": "DE",
    "declared_value": 1200,
    "currency": "EUR"
  }'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
