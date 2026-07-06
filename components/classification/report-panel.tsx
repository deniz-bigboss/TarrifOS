"use client";

import { Fragment, useState } from "react";
import { Check, Copy, Download, FileText, Info, Languages, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toMarkdown, type ReportContext } from "@/lib/export/report";
import { REPORT_MESSAGES } from "@/lib/export/report-messages";
import { translateReportAction } from "@/app/dashboard/classifications/report-actions";
import { LOCALE_NAMES, isRtl, type Locale } from "@/lib/i18n/config";
import type { ClassificationResult, ProductInput } from "@/types";
import type { ReadinessBreakdown } from "@/lib/scoring/readiness";

interface ReportPanelProps {
  input: ProductInput;
  result: ClassificationResult;
  classificationId: string;
  createdAt?: string;
  readiness?: ReadinessBreakdown;
  /** The visitor's site language — the default target for the switch. */
  defaultLocale?: Locale;
  /** Remaining machine translations this month (null = unlimited). */
  translationsRemaining?: number | null;
}

/** Minimal Markdown → React renderer for the report preview. */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const inline = (t: string) => {
    const parts = t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{p.slice(1, -1)}</code>;
      return <Fragment key={i}>{p}</Fragment>;
    });
  };
  const flush = (key: string) => {
    if (list.length) {
      out.push(
        <ul key={key} className="my-1 ml-4 list-disc space-y-0.5">
          {list.map((li, i) => <li key={i}>{inline(li)}</li>)}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((line, i) => {
    const key = `l${i}`;
    if (line.startsWith("# ")) { flush(key + "u"); out.push(<h2 key={key} className="mt-3 text-lg font-bold">{inline(line.slice(2))}</h2>); }
    else if (line.startsWith("## ")) { flush(key + "u"); out.push(<h3 key={key} className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{inline(line.slice(3))}</h3>); }
    else if (line.startsWith("### ")) { flush(key + "u"); out.push(<h4 key={key} className="mt-2 font-semibold">{inline(line.slice(4))}</h4>); }
    else if (line.startsWith("- ")) { list.push(line.slice(2)); }
    else if (line.startsWith("> ")) { flush(key + "u"); out.push(<p key={key} className="my-1 border-l-2 border-border pl-3 text-xs italic text-muted-foreground">{inline(line.slice(2))}</p>); }
    else if (line.trim() === "---") { flush(key + "u"); out.push(<hr key={key} className="my-2 border-border" />); }
    else if (line.trim() === "") { flush(key + "u"); }
    else { flush(key + "u"); out.push(<p key={key} className="my-1">{inline(line)}</p>); }
  });
  flush("end");
  return out;
}

/**
 * The exportable report with a language switch. English renders instantly and
 * free. A translation is produced ONLY when the user clicks "Generate
 * translation" (one AI call, quota-limited); once generated it is cached, and
 * the [language] ⇄ English switch then flips between the two for free. English
 * is always available and remains the authoritative version.
 */
export function ReportPanel({
  input,
  result,
  classificationId,
  createdAt,
  readiness,
  defaultLocale = "en",
  translationsRemaining = null,
}: ReportPanelProps) {
  const ctx: ReportContext = { input, result, classificationId, createdAt, readiness };
  const englishMd = toMarkdown(ctx, REPORT_MESSAGES.en);

  const initialTarget: Locale = defaultLocale !== "en" ? defaultLocale : "tr";
  const [target, setTarget] = useState<Locale>(initialTarget);
  const [view, setView] = useState<"en" | "target">("en");
  const [cache, setCache] = useState<Record<string, string>>({ en: englishMd });
  const [remaining, setRemaining] = useState<number | null>(translationsRemaining);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const targetReady = Boolean(cache[target]);
  const showingLocale: Locale = view === "en" ? "en" : target;
  const shownMd = cache[showingLocale] ?? englishMd;
  const isMachine = view === "target" && target !== "en";
  const outOfQuota = remaining != null && remaining <= 0;

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await translateReportAction(classificationId, target);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCache((c) => ({ ...c, [target]: res.data.markdown }));
    if (res.data.remaining != null) setRemaining(res.data.remaining);
    setView("target");
  }

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(
      shownMd.replace(/^#+\s/gm, "").replace(/\*\*/g, "").replace(/`/g, ""),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" /> Report
        </CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          {targetReady ? (
            // Already generated → free switch between the translation and English.
            <div className="inline-flex overflow-hidden rounded-md border border-input">
              <button
                type="button"
                onClick={() => setView("target")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
                  view === "target" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                )}
              >
                <Languages className="h-3.5 w-3.5" />
                {LOCALE_NAMES[target]}
              </button>
              <button
                type="button"
                onClick={() => setView("en")}
                className={cn(
                  "border-l border-input px-3 py-1.5 text-sm font-medium",
                  view === "en" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                )}
              >
                English
              </button>
            </div>
          ) : (
            // Not generated yet → pick a language + explicit generate button.
            <>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as Locale)}
                aria-label="Report language"
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {(Object.keys(LOCALE_NAMES) as Locale[])
                  .filter((l) => l !== "en")
                  .map((l) => (
                    <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
                  ))}
              </select>
              <Button size="sm" onClick={generate} disabled={loading || outOfQuota} title={outOfQuota ? "Monthly translation limit reached" : undefined}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate translation
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyReport}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => download(`kustaro-${classificationId}-${showingLocale}.md`, shownMd, "text/markdown")}>
            <Download className="h-4 w-4" /> Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              download(
                `kustaro-${classificationId}.json`,
                JSON.stringify({ classification_id: classificationId, report_language: showingLocale, input, result, customs_readiness: readiness ?? null }, null, 2),
                "application/json",
              )
            }
          >
            <Download className="h-4 w-4" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4" /> PDF
          </Button>

          {remaining != null && !targetReady && (
            <span className="ml-auto text-xs text-muted-foreground">
              {remaining} translation{remaining === 1 ? "" : "s"} left this month
            </span>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        {isMachine && (
          <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Machine-translated for convenience. The English version is the
            authoritative text — switch to English above to view it.
          </p>
        )}

        <div
          dir={showingLocale !== "en" && isRtl(showingLocale) ? "rtl" : "ltr"}
          className="max-h-[28rem] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-6"
        >
          {loading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Translating…
            </p>
          ) : (
            renderMarkdown(shownMd)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
