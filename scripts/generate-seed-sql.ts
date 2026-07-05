/**
 * Generates supabase/seed/seed_tariff_codes.sql from the canonical TS seed data
 * so the `tariff_codes` table can be populated to match the in-code dataset.
 *
 *   npm run seed:sql
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { SEED_TARIFF_CODES } from "../lib/tariff-data/seed-data";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function jsonbArray(values: string[]): string {
  return `'${JSON.stringify(values).replace(/'/g, "''")}'::jsonb`;
}

const rows = SEED_TARIFF_CODES.map((c) => {
  return `  (${sqlString(c.code)}, ${sqlString(c.jurisdiction)}, ${sqlString(
    c.title,
  )}, ${sqlString(c.description)}, ${jsonbArray(c.keywords)}, ${sqlString(
    c.chapter,
  )}, ${sqlString(c.section)}, ${sqlString(c.dutyRatePlaceholder)}, ${jsonbArray(
    c.requiredDocuments,
  )}, ${jsonbArray(c.restrictionNotes)}, ${sqlString(c.riskLevel)})`;
}).join(",\n");

const sql = `-- ===========================================================================
-- Kustaro — tariff_codes seed (generated from lib/tariff-data/seed-data.ts)
-- Regenerate with: npm run seed:sql
-- ===========================================================================

insert into public.tariff_codes
  (code, jurisdiction, title, description, keywords, chapter, section, duty_rate_placeholder, required_documents, restriction_notes, risk_level)
values
${rows}
on conflict (code, jurisdiction) do update set
  title = excluded.title,
  description = excluded.description,
  keywords = excluded.keywords,
  chapter = excluded.chapter,
  section = excluded.section,
  duty_rate_placeholder = excluded.duty_rate_placeholder,
  required_documents = excluded.required_documents,
  restriction_notes = excluded.restriction_notes,
  risk_level = excluded.risk_level;
`;

const outDir = join(process.cwd(), "supabase", "seed");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "seed_tariff_codes.sql");
writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${SEED_TARIFF_CODES.length} seed codes to ${outPath}`);
