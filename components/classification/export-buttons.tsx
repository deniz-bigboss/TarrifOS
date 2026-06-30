"use client";

import { useState } from "react";
import { Check, Copy, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassificationResult, ProductInput } from "@/types";
import { toMarkdown, toPlainText, type ReportContext } from "@/lib/export/report";

interface ExportButtonsProps {
  input: ProductInput;
  result: ClassificationResult;
  classificationId: string;
  createdAt?: string;
}

export function ExportButtons({
  input,
  result,
  classificationId,
  createdAt,
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const ctx: ReportContext = { input, result, classificationId, createdAt };

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
    await navigator.clipboard.writeText(toPlainText(ctx));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={copyReport}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy report"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          download(
            `tariffos-${classificationId}.md`,
            toMarkdown(ctx),
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
            `tariffos-${classificationId}.json`,
            JSON.stringify({ classification_id: classificationId, input, result }, null, 2),
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
