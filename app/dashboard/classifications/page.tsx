import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { listClassifications } from "@/lib/db/classifications";
import {
  ClassificationsTable,
  type ClassificationRow,
} from "@/components/classification/classifications-table";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Classifications — Kustaro" };

export default async function ClassificationsPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const { t } = getI18n();

  const supabase = createClient();
  const items = await listClassifications(supabase, session.organization.id);

  const rows: ClassificationRow[] = items.map(({ request, result }) => ({
    id: request.id,
    productName: request.product_name,
    category: request.category,
    code: result?.recommended_code ?? "",
    destination: request.destination_country,
    origin: request.origin_country,
    confidence: result?.confidence ?? null,
    confidenceLabel: result?.confidence_label ?? null,
    humanReview: Boolean(result?.human_review_required),
    createdAt: request.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.app.plansTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.app.plansSubtitle}</p>
        </div>
        <Button asChild>
          <Link href="/classify">
            <Plus className="h-4 w-4" /> {t.app.sidebar.newPlan}
          </Link>
        </Button>
      </div>

      <ClassificationsTable rows={rows} />
    </div>
  );
}
