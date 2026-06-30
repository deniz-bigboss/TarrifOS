import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateApiRequest } from "@/lib/api-keys/auth";
import {
  getClassificationDetail,
  resultRowToClassificationResult,
} from "@/lib/db/classifications";

export const dynamic = "force-dynamic";

/** GET /api/v1/classifications/:id — fetch a stored classification by id. */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authenticateApiRequest(request.headers.get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createAdminClient();
  const detail = await getClassificationDetail(supabase, params.id);

  if (!detail || detail.request.organization_id !== auth.context.organization.id) {
    return NextResponse.json({ error: "Classification not found." }, { status: 404 });
  }

  const result = detail.result
    ? resultRowToClassificationResult(detail.result, detail.candidates)
    : null;

  return NextResponse.json({
    classification_id: detail.request.id,
    status: detail.request.status,
    created_at: detail.request.created_at,
    product: {
      product_name: detail.request.product_name,
      product_description: detail.request.product_description,
      origin_country: detail.request.origin_country,
      destination_country: detail.request.destination_country,
      declared_value: detail.request.declared_value,
      currency: detail.request.currency,
    },
    result,
  });
}
