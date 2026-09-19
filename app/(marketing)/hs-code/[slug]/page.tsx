import { notFound } from "next/navigation";
import { SeoPageView } from "@/components/marketing/seo-page";
import { CodePageView } from "@/components/marketing/code-page";
import { getSeoPage, seoSlugsFor } from "@/lib/seo/pages";
import { getCodePage } from "@/lib/seo/code-pages";
import { cachedDutyFor } from "@/lib/tariff-data/cached-duty";

/**
 * One URL space, two kinds of page: the handwritten guides take priority, and
 * every other HS code in the dataset gets a generated reference page.
 *
 * The duty figures are cached for a day, not the page. Page-level caching
 * cannot engage here: the root layout reads the locale cookie, which opts the
 * whole app into dynamic rendering. The `revalidate` below is therefore inert
 * today — it is kept so this page caches correctly if that ever changes — and
 * the real protection against hammering the government APIs lives in
 * `cachedDutyFor`.
 */
export const revalidate = 86400;

/**
 * Only the handwritten guides are pre-rendered. Building all ~100 code pages
 * would fire two government-API calls each during the build — slow, and rude to
 * a free public API. They render on first request instead and are then cached
 * for a day, which spreads the same work across real traffic. The sitemap still
 * lists every one of them so crawlers find them.
 */
export function generateStaticParams() {
  return seoSlugsFor("hs-code").map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getSeoPage("hs-code", params.slug);
  if (page) {
    return {
      title: page.title,
      description: page.intro,
      alternates: { canonical: `/hs-code/${params.slug}` },
    };
  }
  const code = getCodePage(params.slug);
  if (!code) return {};
  return {
    title: `HS code ${code.code} — ${code.title} | Kustaro`,
    description: `${code.description} Current US and UK duty for ${code.code}, the documents customs asks for, and the codes it is most often confused with.`,
    alternates: { canonical: `/hs-code/${params.slug}` },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPage("hs-code", params.slug);
  if (page) return <SeoPageView page={page} />;

  const codePage = getCodePage(params.slug);
  if (!codePage) notFound();

  const [us, gb] = await Promise.all([
    cachedDutyFor(codePage.code, "US"),
    cachedDutyFor(codePage.code, "GB"),
  ]);

  return <CodePageView page={codePage} duty={{ us, gb }} />;
}
