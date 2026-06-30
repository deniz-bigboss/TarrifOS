/**
 * Product category options shown in the classification wizard. Shared with
 * the AI provider layer (lib/ai) so quick-find lookups return a category the
 * wizard's <Select> can actually match, and with the cost/plausibility
 * checks (lib/classification/plausibility.ts) that key off these same
 * strings.
 */
export const PRODUCT_CATEGORIES = [
  "apparel",
  "textiles",
  "footwear",
  "leather goods",
  "electronics",
  "batteries",
  "cosmetics",
  "food products",
  "plastic goods",
  "metal goods",
  "furniture",
  "books/paper",
  "toys",
  "machinery",
  "chemicals",
  "medical",
  "sporting goods",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
