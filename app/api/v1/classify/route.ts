import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authenticateApiRequest } from "@/lib/api-keys/auth";
import { apiClassifySchema } from "@/lib/validation/schemas";
import { runClassification } from "@/lib/classification/pipeline";
import { persistClassification } from "@/lib/db/classifications";
import { recordUsageEvent } from "@/lib/db/usage";
import { checkClassificationLimit } from "@/lib/billing/limits";
import type { ProductInput } from "@/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/classify
 * Authenticates with an API key, runs the classification pipeline, persists the
 * result, records a usage event, and returns the documented response body.
 */
export async function POST(request: Request) {
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

  const parsed = apiClassifySchema.safeParse(body);
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

  const { organization, apiKey } = auth.context;
  const supabase = createAdminClient();

  // Enforce plan limit.
  const limit = await checkClassificationLimit(
    supabase,
    organization.id,
    organization.plan,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.message ?? "Monthly classification limit reached." },
      { status: 429 },
    );
  }

  const input = parsed.data as ProductInput;

  try {
    const output = await runClassification(input);
    const { requestId } = await persistClassification(supabase, {
      organizationId: organization.id,
      createdBy: null,
      input,
      output,
      source: "api",
    });

    await recordUsageEvent(supabase, {
      organizationId: organization.id,
      apiKeyId: apiKey.id,
      eventType: "api_classification",
      metadata: {
        recommended_code: output.result.recommended_code,
        provider: output.providerName,
      },
    });

    const { result } = output;
    return NextResponse.json(
      {
        classification_id: requestId,
        recommended_code: result.recommended_code,
        recommended_title: result.recommended_title,
        confidence: result.confidence,
        confidence_label: result.confidence_label,
        human_review_required: result.human_review_required,
        human_review_reason: result.human_review_reason,
        alternative_codes: result.alternative_codes,
        key_factors: result.key_factors,
        missing_information: result.missing_information,
        required_documents: result.required_documents,
        restriction_warnings: result.restriction_warnings,
        duty_estimate: result.duty_estimate ?? null,
        cost_optimization: result.cost_optimization ?? null,
        broker_ready_explanation: result.broker_ready_explanation,
        disclaimer: result.disclaimer,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[api/classify] failed:", err);
    return NextResponse.json(
      { error: "Classification failed. Please retry." },
      { status: 500 },
    );
  }
}
