import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import {
  getClassificationDetail,
  resultRowToClassificationResult,
} from "@/lib/db/classifications";
import { ResultView } from "@/components/classification/result-view";
import { FeedbackForm } from "@/components/classification/feedback-form";
import { Button } from "@/components/ui/button";
import type { ProductInput } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default async function ClassificationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = createClient();
  const detail = await getClassificationDetail(supabase, params.id);
  if (!detail) notFound();

  const { request, result, candidates, feedback } = detail;

  const input: ProductInput = {
    product_name: request.product_name,
    product_description: request.product_description ?? "",
    material_composition: request.material_composition,
    intended_use: request.intended_use,
    brand: request.brand,
    model: request.model,
    sku: request.sku,
    category: request.category,
    supplier_country: request.supplier_country,
    origin_country: request.origin_country ?? "",
    destination_country: request.destination_country ?? "",
    import_or_export: (request.import_or_export as "import" | "export") ?? "import",
    declared_value: request.declared_value,
    currency: request.currency,
    quantity: request.quantity,
    unit_weight: request.unit_weight,
    shipping_method: request.shipping_method,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/classifications">
            <ArrowLeft className="h-4 w-4" /> All classifications
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          {formatDateTime(request.created_at)}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{request.product_name}</h1>
        <p className="text-sm text-muted-foreground">{request.product_description}</p>
      </div>

      {result ? (
        <ResultView
          input={input}
          result={resultRowToClassificationResult(result, candidates)}
          classificationId={request.id}
          createdAt={formatDateTime(request.created_at)}
        />
      ) : (
        <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
          This classification has no result yet (status: {request.status}).
        </p>
      )}

      {result && <FeedbackForm requestId={request.id} existing={feedback} />}
    </div>
  );
}
