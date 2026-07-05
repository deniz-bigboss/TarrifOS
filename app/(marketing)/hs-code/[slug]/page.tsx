import { notFound } from "next/navigation";
import { SeoPageView } from "@/components/marketing/seo-page";
import { getSeoPage, seoSlugsFor } from "@/lib/seo/pages";

export function generateStaticParams() {
  return seoSlugsFor("hs-code").map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getSeoPage("hs-code", params.slug);
  return page
    ? {
        title: page.title,
        description: page.intro,
        alternates: { canonical: `/hs-code/${params.slug}` },
      }
    : {};
}

export default function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPage("hs-code", params.slug);
  if (!page) notFound();
  return <SeoPageView page={page} />;
}
