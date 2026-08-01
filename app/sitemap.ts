import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo/pages";
import { allCodePages } from "@/lib/seo/code-pages";
import { isPublicAccessSuspended } from "@/lib/site/access";

const BASE = "https://kustaro.app";

// Matches robots.ts: read the suspension flag at request time, not build time.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  // Nothing to advertise while the site is closed to the public.
  if (isPublicAccessSuspended()) return [];

  const core =["", "/classify", "/pricing", "/privacy", "/terms", "/refunds"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const seo = SEO_PAGES.map((page) => ({
    url: `${BASE}/${page.kind}/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  // One reference page per HS code in the dataset.
  const codes = allCodePages().map((page) => ({
    url: `${BASE}/hs-code/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...core, ...seo, ...codes];
}
