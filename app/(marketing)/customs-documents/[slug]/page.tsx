import { notFound } from "next/navigation";
import { SeoPageView } from "@/components/marketing/seo-page";
import { getSeoPage, seoSlugsFor } from "@/lib/seo/pages";

export function generateStaticParams() {
  return seoSlugsFor("customs-documents").map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getSeoPage("customs-documents", params.slug);
  return page
    ? {
        title: page.title,
        description: page.intro,
        alternates: { canonical: `/customs-documents/${params.slug}` },
      }
    : {};
}

export default function Page({ params }: { params: { slug: string } }) {
  const page = getSeoPage("customs-documents", params.slug);
  if (!page) notFound();
  return <SeoPageView page={page} />;
}
