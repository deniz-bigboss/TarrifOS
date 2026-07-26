import { notFound } from "next/navigation";
import { SeoPageView } from "@/components/marketing/seo-page";
import { CodePageView } from "@/components/marketing/code-page";
import { getSeoPage, seoSlugsFor } from "@/lib/seo/pages";
import { getCodePage } from "@/lib/seo/code-pages";
import { getTariffDataProvider } from "@/lib/tariff-data";
import type { DutyMeasure } from "@/types";

/**
 * One URL space, two kinds of page: the handwritten guides take priority, and
 * every other HS code in the dataset gets a generated reference page.
 *
 * Rates are fetched at render and the page is cached for a day, so the duty
 * figures stay current without hammering the government APIs on every request.
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

/** Live duty must never take a marketing page down. */
async function dutyFor(code: string, destination: string): Promise<DutyMeasure | null> {
  try {
    return await getTariffDataProvider().getDutyMeasures(code, "CN", destination);
  } catch {
    return null;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPage("hs-code", params.slug);
  if (page) return <SeoPageView page={page} />;

  const codePage = getCodePage(params.slug);
  if (!codePage) notFound();

  const [us, gb] = await Promise.all([
    dutyFor(codePage.code, "US"),
    dutyFor(codePage.code, "GB"),
  ]);

  return <CodePageView page={codePage} duty={{ us, gb }} />;
}
