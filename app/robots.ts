import type { MetadataRoute } from "next";
import { isPublicAccessSuspended } from "@/lib/site/access";

// Rendered per request rather than baked at build time, so flipping SITE_PUBLIC
// can never leave a stale "crawl everything" robots.txt in front of a site that
// is actually closed.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  // While public access is suspended, ask crawlers to stay away entirely and
  // publish no sitemap — an indexed copy of a page we've taken down is exactly
  // what the suspension is meant to prevent.
  if (isPublicAccessSuspended()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api"] }],
    sitemap: "https://kustaro.app/sitemap.xml",
  };
}
