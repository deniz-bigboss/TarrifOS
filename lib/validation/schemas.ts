import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

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
  declared_value: z.coerce.number().nonnegative().optional(),
  currency: optionalString,
  quantity: z.coerce.number().nonnegative().optional(),
  unit_weight: z.coerce.number().nonnegative().optional(),
  shipping_method: optionalString,
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
  declared_value: z.coerce.number().nonnegative().optional(),
  currency: optionalString,
  quantity: z.coerce.number().nonnegative().optional(),
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
