import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateApiRequest } from "@/lib/api-keys/auth";
import { feedbackSchema } from "@/lib/validation/schemas";
import { getClassificationDetail } from "@/lib/db/classifications";
import { saveFeedback } from "@/lib/db/feedback";
import { recordUsageEvent } from "@/lib/db/usage";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/classifications/:id/feedback
 * Records broker/customs feedback — the product's data moat.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authenticateApiRequest(request.headers.get("authorization"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();
  const detail = await getClassificationDetail(supabase, params.id);

  if (
    !detail?.result ||
    detail.request.organization_id !== auth.context.organization.id
  ) {
    return NextResponse.json({ error: "Classification not found." }, { status: 404 });
  }

  try {
    const { id } = await saveFeedback(supabase, {
      organizationId: auth.context.organization.id,
      classificationResultId: detail.result.id,
      actualCode: parsed.data.actual_code ?? null,
      wasCorrect: parsed.data.was_correct ?? null,
      brokerNotes: parsed.data.broker_notes ?? null,
      shipmentCleared: parsed.data.shipment_cleared ?? null,
      delayOccurred: parsed.data.delay_occurred ?? null,
      penaltyOccurred: parsed.data.penalty_occurred ?? null,
    });

    await recordUsageEvent(supabase, {
      organizationId: auth.context.organization.id,
      apiKeyId: auth.context.apiKey.id,
      eventType: "api_feedback",
      metadata: { classification_id: params.id },
    });

    return NextResponse.json({ feedback_id: id, status: "recorded" }, { status: 201 });
  } catch (err) {
    console.error("[api/feedback] failed:", err);
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
  }
}
