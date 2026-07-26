/**
 * Outreach report generator.
 *
 * The outreach motion is: take one of a prospect's real products, classify it,
 * and send them the report. Doing that by hand is three minutes per prospect;
 * this does the whole list in one pass.
 *
 * For every row of a prospects CSV it calls the public Kustaro API, computes the
 * readiness score, renders the same Markdown report the product produces, and
 * writes a ready-to-send message with the code and score filled in. Results are
 * appended to a tracking CSV so you can see what went out and what came back.
 *
 *   KUSTARO_API_KEY=kustaro_sk_...  npm run outreach
 *   npm run outreach -- --file my-list.csv --limit 10 --lang tr
 *
 * Each row spends one classification credit, so the script prints the cost and
 * skips prospects whose report already exists (safe to re-run).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { computeReadiness } from "../lib/scoring/readiness";
import { toMarkdown } from "../lib/export/report";
import { REPORT_MESSAGES } from "../lib/export/report-messages";
import type { ClassificationResult, ProductInput } from "../types";

const OUT_DIR = "outreach";
const REPORTS = join(OUT_DIR, "reports");
const DRAFTS = join(OUT_DIR, "drafts");
const TRACKING = join(OUT_DIR, "tracking.csv");
const REQUEST_GAP_MS = 1500;

interface Args {
  file: string;
  limit: number;
  lang: "en" | "tr";
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const lang = (get("--lang") ?? "en").toLowerCase();
  return {
    file: get("--file") ?? join(OUT_DIR, "prospects.csv"),
    limit: Number(get("--limit") ?? Infinity),
    lang: lang === "tr" ? "tr" : "en",
    dryRun: argv.includes("--dry-run"),
  };
}

/** Minimal RFC-4180 CSV reader: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!header) return [];
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((cells) =>
    Object.fromEntries(keys.map((k, i) => [k, (cells[i] ?? "").trim()])),
  );
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

function productInputFrom(row: Record<string, string>): ProductInput {
  const num = (v: string) => {
    const n = Number(v);
    return v.trim() !== "" && Number.isFinite(n) ? n : undefined;
  };
  return {
    product_name: row.product_name,
    product_description: row.product_description || undefined,
    material_composition: row.material || row.material_composition || undefined,
    intended_use: row.intended_use || undefined,
    origin_country: row.origin || row.origin_country || undefined,
    destination_country: row.destination || row.destination_country || undefined,
    declared_value: num(row.declared_value ?? ""),
    currency: row.currency || undefined,
    quantity: num(row.quantity ?? ""),
  } as ProductInput;
}

/** The message that goes out. Kept short on purpose — the report is the pitch. */
function draftMessage(
  lang: "en" | "tr",
  row: Record<string, string>,
  result: ClassificationResult,
  score: number,
): string {
  const name = row.contact_name || row.company || "there";
  const product = row.product_name;
  const dest = (row.destination || row.destination_country || "US").toUpperCase();
  const destName = lang === "tr" ? (dest === "GB" ? "İngiltere" : "ABD") : dest === "GB" ? "the UK" : "the US";

  if (lang === "tr") {
    return `Merhaba ${name},

${row.company} olarak ${product} modelini ${destName}'ye gönderirken kullanılacak gümrük tarife kodunu ve toplam vergi yükünü çıkardık. Kod ${result.recommended_code} çıktı, gümrüğe hazırlık puanı ${score}/100.

Raporu ekte bırakıyorum, sizden bir şey istemiyorum. Faydalı bulursanız diğer modelleriniz için de çıkarabilirim.

kustaro.app`;
  }
  return `Hi ${name},

I ran ${row.company}'s ${product} through a customs classification check for an import into ${destName}: HS code came out ${result.recommended_code}, with a customs-readiness score of ${score}/100. The PDF is attached.

No ask. If it is useful I will do two more of your SKUs.

kustaro.app`;
}

async function classify(
  base: string,
  key: string,
  input: ProductInput,
): Promise<{ result: ClassificationResult; id: string }> {
  const res = await fetch(`${base}/api/v1/classify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    // Surface what the server actually said — a 401 from a bad key and a 403
    // from a network policy look identical without it.
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ""}`);
  }
  const body = (await res.json().catch(() => null)) as
    | (Partial<ClassificationResult> & { classification_id?: string; error?: string })
    | null;
  if (!body || body.error) throw new Error(body?.error || "empty response");
  // The API omits reasoning_summary; broker_ready_explanation carries the prose.
  const result = {
    ...body,
    reasoning_summary: body.broker_ready_explanation ?? "",
    key_factors: body.key_factors ?? [],
    missing_information: body.missing_information ?? [],
    required_documents: body.required_documents ?? [],
    restriction_warnings: body.restriction_warnings ?? [],
    alternative_codes: body.alternative_codes ?? [],
  } as ClassificationResult;
  return { result, id: body.classification_id ?? "" };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = process.env.KUSTARO_API_KEY;
  const base = (process.env.KUSTARO_BASE || "https://kustaro.app").replace(/\/$/, "");

  if (!existsSync(args.file)) {
    console.error(`No prospects file at ${args.file}. Copy outreach/prospects.example.csv and fill it in.`);
    process.exit(1);
  }
  const rows = parseCsv(readFileSync(args.file, "utf8")).filter((r) => r.product_name && r.company);
  if (rows.length === 0) {
    console.error("No usable rows — each row needs at least `company` and `product_name`.");
    process.exit(1);
  }

  mkdirSync(REPORTS, { recursive: true });
  mkdirSync(DRAFTS, { recursive: true });
  if (!existsSync(TRACKING)) {
    writeFileSync(
      TRACKING,
      "generated_at,company,contact_name,contact_email,product,hs_code,confidence,readiness,report_file,draft_file,sent\n",
    );
  }

  const pending = rows
    .slice(0, Number.isFinite(args.limit) ? args.limit : rows.length)
    .map((row) => ({ row, slug: `${slugify(row.company)}-${slugify(row.product_name)}` }))
    .filter(({ slug }) => !existsSync(join(REPORTS, `${slug}.md`)));

  console.log(`${rows.length} row(s) in file, ${pending.length} to process (rest already have reports).`);
  console.log(`Each one spends 1 classification credit → ${pending.length} credit(s).`);
  if (args.dryRun) {
    for (const { row, slug } of pending) console.log(`  would classify: ${row.company} / ${row.product_name} → ${slug}`);
    return;
  }
  if (!key) {
    console.error("KUSTARO_API_KEY is not set. Create a key in Dashboard → API keys.");
    process.exit(1);
  }

  let done = 0;
  let failed = 0;
  for (const { row, slug } of pending) {
    const input = productInputFrom(row);
    try {
      const { result, id } = await classify(base, key, input);
      const readiness = computeReadiness(input, result);
      const lang = (row.lang || args.lang).toLowerCase() === "tr" ? "tr" : "en";
      const markdown = toMarkdown(
        { input, result, classificationId: id, createdAt: new Date().toISOString(), readiness },
        REPORT_MESSAGES.en, // the report itself stays in English — the binding version
      );

      const reportFile = join(REPORTS, `${slug}.md`);
      const draftFile = join(DRAFTS, `${slug}.txt`);
      writeFileSync(reportFile, markdown);
      writeFileSync(draftFile, draftMessage(lang as "en" | "tr", row, result, readiness.score));
      appendFileSync(
        TRACKING,
        [
          new Date().toISOString(),
          row.company,
          row.contact_name ?? "",
          row.contact_email ?? "",
          row.product_name,
          result.recommended_code,
          String(Math.round(result.confidence * 100)),
          String(readiness.score),
          reportFile,
          draftFile,
          "no",
        ]
          .map((c) => csvCell(String(c)))
          .join(",") + "\n",
      );

      done++;
      console.log(
        `  ✓ ${row.company} / ${row.product_name} → ${result.recommended_code} (${Math.round(result.confidence * 100)}% conf, readiness ${readiness.score}/100)`,
      );
    } catch (err) {
      failed++;
      console.error(`  ✗ ${row.company} / ${row.product_name}: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_GAP_MS));
  }

  console.log(`\n${done} report(s) written, ${failed} failed.`);
  console.log(`Reports: ${REPORTS}/  ·  Drafts: ${DRAFTS}/  ·  Tracking: ${TRACKING}`);
  console.log("Open a report, print it to PDF, attach it to the draft, send. Mark `sent` in the tracking CSV.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
