import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { BulkUploadClient } from "@/components/bulk/bulk-upload-client";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Bulk upload — Kustaro" };
// Each row is classified via a server action served from this segment.
export const maxDuration = 60;

/** Bulk upload (beta): classify a CSV of up to 10 SKUs in one pass. Each row
 * is a normal saved classification and counts toward the plan limit. */
export default async function BulkUploadPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const limit = await checkClassificationLimit(
    createClient(),
    session.organization.id,
    session.organization.plan,
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Bulk upload</h1>
          <Badge variant="warning">beta</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Classify a CSV of repeat SKUs in one pass. Each row counts as one
          classification
          {limit.limit != null &&
            ` (${limit.remaining} of ${limit.limit} left this month on your plan)`}
          .
        </p>
      </div>
      <BulkUploadClient />
    </div>
  );
}
