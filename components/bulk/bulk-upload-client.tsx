"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Play, Upload } from "lucide-react";
import {
  bulkClassifyAction,
  type BulkRowInput,
  type BulkRowResult,
} from "@/app/classify/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const COLUMNS = [
  "sku",
  "product_name",
  "product_description",
  "material_composition",
  "intended_use",
  "origin_country",
  "destination_country",
  "declared_value",
  "currency",
] as const;

const MAX_ROWS = 10;

const SAMPLE = `sku,product_name,product_description,material_composition,intended_use,origin_country,destination_country,declared_value,currency
TS-001,Men's cotton t-shirt,100% cotton knitted short-sleeve t-shirt,100% cotton,apparel,TR,DE,1200,EUR
WL-014,Leather wallet,Bifold wallet made of full-grain cow leather,cow leather,personal accessory,IN,US,800,USD`;

/** Minimal CSV parser that handles quoted fields and commas inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function toRowInputs(raw: string[][]): { rows: BulkRowInput[]; error?: string } {
  if (raw.length < 2) {
    return { rows: [], error: "Provide a header row plus at least one data row." };
  }
  const header = raw[0].map((h) => h.trim().toLowerCase());
  if (!header.includes("product_name")) {
    return {
      rows: [],
      error: `The header must include product_name. Expected columns: ${COLUMNS.join(", ")}`,
    };
  }
  const rows = raw.slice(1).map((cells) => {
    const rec: Record<string, string> = {};
    header.forEach((h, i) => {
      rec[h] = (cells[i] ?? "").trim();
    });
    const declared = Number(rec.declared_value);
    return {
      sku: rec.sku || undefined,
      product_name: rec.product_name || "",
      product_description: rec.product_description || rec.product_name || "",
      material_composition: rec.material_composition || undefined,
      intended_use: rec.intended_use || undefined,
      origin_country: (rec.origin_country || "").toUpperCase(),
      destination_country: (rec.destination_country || "").toUpperCase(),
      declared_value: Number.isFinite(declared) && rec.declared_value ? declared : undefined,
      currency: rec.currency || undefined,
    } satisfies BulkRowInput;
  });
  return { rows };
}

export function BulkUploadClient() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<BulkRowInput[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkRowResult[] | null>(null);
  const [running, setRunning] = useState(false);

  function preview(input: string) {
    setResults(null);
    const { rows, error } = toRowInputs(parseCsv(input));
    setParsed(error ? null : rows);
    setParseError(error ?? null);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((content) => {
      setText(content);
      preview(content);
    });
  }

  async function run() {
    if (!parsed?.length) return;
    setRunning(true);
    setResults(null);
    const res = await bulkClassifyAction(parsed.slice(0, MAX_ROWS));
    setResults(res.ok ? res.data : [{ row: 0, product_name: "", ok: false, error: res.error }]);
    setRunning(false);
  }

  function downloadResultsCsv() {
    if (!results) return;
    const lines = [
      "row,product_name,status,recommended_code,confidence,readiness,link_or_error",
      ...results.map((r) =>
        [
          r.row,
          `"${(r.product_name ?? "").replace(/"/g, '""')}"`,
          r.ok ? "ok" : "error",
          r.recommended_code ?? "",
          r.confidence != null ? Math.round(r.confidence * 100) + "%" : "",
          r.readiness ?? "",
          r.ok ? `${window.location.origin}/dashboard/classifications/${r.id}` : `"${(r.error ?? "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kustaro-bulk-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Paste CSV rows or upload a file (first {MAX_ROWS} rows are processed)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setText(SAMPLE);
                preview(SAMPLE);
              }}
            >
              Load sample
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted/50">
              <Upload className="h-3.5 w-3.5" /> Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
            </label>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            preview(e.target.value);
          }}
          rows={7}
          placeholder={`Columns: ${COLUMNS.join(", ")}`}
          className="font-mono text-xs"
        />
        {parseError && <p className="text-sm text-destructive">{parseError}</p>}
      </div>

      {parsed && parsed.length > 0 && !results && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">#</th>
                  <th className="px-2 py-1.5 text-left font-medium">SKU</th>
                  <th className="px-2 py-1.5 text-left font-medium">Product</th>
                  <th className="px-2 py-1.5 text-left font-medium">Lane</th>
                  <th className="px-2 py-1.5 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, MAX_ROWS).map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-2 py-1.5">{i + 1}</td>
                    <td className="px-2 py-1.5 font-mono">{r.sku ?? "—"}</td>
                    <td className="max-w-[280px] truncate px-2 py-1.5">{r.product_name}</td>
                    <td className="px-2 py-1.5">
                      {r.origin_country} → {r.destination_country}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {r.declared_value != null ? `${r.declared_value} ${r.currency ?? ""}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.length > MAX_ROWS && (
            <p className="text-xs text-muted-foreground">
              {parsed.length} rows found — bulk processing is in beta, so only the
              first {MAX_ROWS} will be processed.
            </p>
          )}
          <Button onClick={run} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running
              ? "Classifying…"
              : `Process ${Math.min(parsed.length, MAX_ROWS)} row${Math.min(parsed.length, MAX_ROWS) === 1 ? "" : "s"}`}
          </Button>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {results.filter((r) => r.ok).length}/{results.length} rows classified
            </p>
            <Button variant="outline" size="sm" onClick={downloadResultsCsv}>
              <Download className="h-3.5 w-3.5" /> Results CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">#</th>
                  <th className="px-2 py-1.5 text-left font-medium">Product</th>
                  <th className="px-2 py-1.5 text-left font-medium">Code</th>
                  <th className="px-2 py-1.5 text-right font-medium">Confidence</th>
                  <th className="px-2 py-1.5 text-right font-medium">Readiness</th>
                  <th className="px-2 py-1.5 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={`${r.row}-${r.product_name}`} className="border-b last:border-0">
                    <td className="px-2 py-1.5">{r.row}</td>
                    <td className="max-w-[240px] truncate px-2 py-1.5">{r.product_name}</td>
                    <td className="px-2 py-1.5 font-mono">{r.recommended_code ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right">
                      {r.confidence != null ? `${Math.round(r.confidence * 100)}%` : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right">{r.readiness ?? "—"}</td>
                    <td className="px-2 py-1.5">
                      {r.ok ? (
                        <Link
                          href={`/dashboard/classifications/${r.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          View report
                        </Link>
                      ) : (
                        <Badge variant="destructive">{r.error}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
