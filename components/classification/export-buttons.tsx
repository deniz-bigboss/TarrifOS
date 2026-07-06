"use client";

import { useState } from "react";
import { Check, Copy, Download, FileText, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassificationResult, ProductInput } from "@/types";
import { toMarkdown, toPlainText, type ReportContext } from "@/lib/export/report";
import { REPORT_MESSAGES } from "@/lib/export/report-messages";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import type { ReadinessBreakdown } from "@/lib/scoring/readiness";

interface ExportButtonsProps {
  input: ProductInput;
  result: ClassificationResult;
  classificationId: string;
  createdAt?: string;
  readiness?: ReadinessBreakdown;
  /** Default report language — the visitor's site language. */
  reportLocale?: Locale;
}

export function ExportButtons({
  input,
  result,
  classificationId,
  createdAt,
  readiness,
  reportLocale = "en",
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Locale>(reportLocale);

  const ctx: ReportContext = { input, result, classificationId, createdAt, readiness };
  const messages = REPORT_MESSAGES[lang];

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(toPlainText(ctx, messages));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 text-sm">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Report language</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Locale)}
          className="h-9 bg-transparent pr-1 text-sm focus:outline-none"
          aria-label="Report language"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_NAMES[l]}
            </option>
          ))}
        </select>
      </label>

      <Button variant="outline" size="sm" onClick={copyReport}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy report"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          download(
            `kustaro-${classificationId}-${lang}.md`,
            toMarkdown(ctx, messages),
            "text/markdown",
          )
        }
      >
        <Download className="h-4 w-4" /> Markdown
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          download(
            `kustaro-${classificationId}.json`,
            JSON.stringify(
              {
                classification_id: classificationId,
                report_language: lang,
                input,
                result,
                customs_readiness: readiness ?? null,
              },
              null,
              2,
            ),
            "application/json",
          )
        }
      >
        <Download className="h-4 w-4" /> JSON
      </Button>
      {/* PDF export: print-to-PDF for the MVP. A server-rendered PDF can be
          added later (e.g. @react-pdf/renderer or a print route). */}
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <FileText className="h-4 w-4" /> PDF
      </Button>
    </div>
  );
}
