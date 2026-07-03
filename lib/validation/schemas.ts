import { z } from "zod";
import { roadFeasible, roadInfeasibleReason } from "@/lib/geo/transport-feasibility";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

/**
 * Optional numeric field that treats blank form inputs ("" from the wizard)
 * and JSON null (from the API) as "not provided" instead of coercing them to
 * 0 — `z.coerce.number()` alone turns both into 0, which made a blank
 * unit-weight field trip the "zero or negative weight" plausibility warning
 * and produced bogus 0.00 duty estimates for blank declared values.
 */
const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

const countryCode = z
  .string()
  .trim()
  .min(2)
  .max(3)
  .transform((v) => v.toUpperCase());

/** Shared product fields used by the wizard and the API. */
export const productInputSchema = z.object({
  product_name: z.string().trim().min(2, "Product name is required."),
  product_description: z
    .string()
    .trim()
    .min(3, "A short product description is required."),
  material_composition: optionalString,
  intended_use: optionalString,
  brand: optionalString,
  model: optionalString,
  sku: optionalString,
  category: optionalString,
  supplier_country: optionalString,
  origin_country: countryCode,
  destination_country: countryCode,
  import_or_export: z.enum(["import", "export"]).default("import"),
  declared_value: optionalNumber,
  currency: optionalString,
  quantity: optionalNumber,
  unit_weight: optionalNumber,
  shipping_method: optionalString,
}).superRefine((val, ctx) => {
  // A truck can't cross an ocean: reject road freight between countries that
  // aren't on the same landmass. Runs after field parsing so origin/
  // destination are already uppercased.
  if (
    val.shipping_method === "road" &&
    !roadFeasible(val.origin_country, val.destination_country)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["shipping_method"],
      message: roadInfeasibleReason(val.origin_country, val.destination_country),
    });
  }
});

export type ProductInputSchema = z.infer<typeof productInputSchema>;

/** Public API classify payload (mirrors the documented request body). */
export const apiClassifySchema = z.object({
  product_name: z.string().trim().min(2),
  product_description: z.string().trim().min(3),
  material_composition: optionalString,
  intended_use: optionalString,
  brand: optionalString,
  model: optionalString,
  sku: optionalString,
  category: optionalString,
  origin_country: countryCode,
  destination_country: countryCode,
  declared_value: optionalNumber,
  currency: optionalString,
  quantity: optionalNumber,
});

export const feedbackSchema = z.object({
  actual_code: optionalString,
  was_correct: z.boolean().optional(),
  broker_notes: optionalString,
  shipment_cleared: z.boolean().optional(),
  delay_occurred: z.boolean().optional(),
  penalty_occurred: z.boolean().optional(),
});

export type FeedbackSchema = z.infer<typeof feedbackSchema>;

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "Give the key a name.").max(60),
});
