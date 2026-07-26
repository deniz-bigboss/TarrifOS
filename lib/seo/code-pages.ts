import { SEED_TARIFF_CODES } from "@/lib/tariff-data/seed-data";
import { HS_CHAPTERS } from "@/lib/tariff-data/hs-chapters";
import { SEO_PAGES } from "./pages";

/**
 * A reference page per HS code in the dataset, rendered from data we already
 * hold rather than written by hand — the handwritten pages in ./pages.ts stay
 * as they are and take priority on a slug clash.
 *
 * These pages earn their place because each one answers something a search
 * actually asks: what the heading covers, which neighbouring codes it gets
 * confused with, what customs will ask for, and — fetched live at render time —
 * the current US and UK duty for that code. That last part is the reason not to
 * treat this as filler: almost nothing else on the web puts a current USITC and
 * UK Trade Tariff rate for the same code side by side.
 */

export interface CodePage {
  slug: string;
  code: string;
  title: string;
  description: string;
  keywords: string[];
  chapter: string;
  chapterTitle: string;
  documents: string[];
  restrictions: string[];
  riskLevel: string;
  /** Other codes in the same chapter — the ones it is most confused with. */
  siblings: Array<{ code: string; slug: string; title: string }>;
}

/** 6109.10 -> 6109-10, so the code reads cleanly in a URL. */
export const codeToSlug = (code: string) => code.replace(/\./g, "-");
export const slugToCode = (slug: string) => slug.replace(/-/g, ".");

const HANDWRITTEN = new Set(
  SEO_PAGES.filter((p) => p.kind === "hs-code").map((p) => p.slug),
);

function build(): CodePage[] {
  const byChapter = new Map<string, typeof SEED_TARIFF_CODES>();
  for (const entry of SEED_TARIFF_CODES) {
    const list = byChapter.get(entry.chapter) ?? [];
    list.push(entry);
    byChapter.set(entry.chapter, list);
  }

  return SEED_TARIFF_CODES.filter((e) => !HANDWRITTEN.has(codeToSlug(e.code))).map(
    (entry) => {
      const siblings = (byChapter.get(entry.chapter) ?? [])
        .filter((s) => s.code !== entry.code)
        .slice(0, 6)
        .map((s) => ({
          code: s.code,
          slug: codeToSlug(s.code),
          title: s.title,
        }));

      return {
        slug: codeToSlug(entry.code),
        code: entry.code,
        title: entry.title,
        description: entry.description,
        keywords: entry.keywords,
        chapter: entry.chapter,
        chapterTitle: HS_CHAPTERS[entry.chapter] ?? `Chapter ${entry.chapter}`,
        documents: entry.requiredDocuments,
        restrictions: entry.restrictionNotes,
        riskLevel: entry.riskLevel,
        siblings,
      };
    },
  );
}

let cache: CodePage[] | null = null;

export function allCodePages(): CodePage[] {
  if (!cache) cache = build();
  return cache;
}

export function getCodePage(slug: string): CodePage | null {
  return allCodePages().find((p) => p.slug === slug) ?? null;
}
