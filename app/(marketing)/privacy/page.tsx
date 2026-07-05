import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy — Kustaro" };

/* Original policy text written for Kustaro's actual data flows. Items marked
   [FILL IN] must be completed by the operator before general availability, and
   the whole document should be reviewed by counsel. */

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who we are",
    paragraphs: [
      "Kustaro is an AI-assisted workspace that turns product information into HS code recommendations, document checklists, compliance checkpoints, and shipment execution plans. It is operated by [FILL IN: legal entity name and registered address]. For any privacy question or request, contact deniz@terra-reform.org.",
    ],
  },
  {
    heading: "2. Data we collect",
    paragraphs: ["We collect only what the product needs to work:"],
    bullets: [
      "Account data — your name, work email, and a hashed password, stored with our authentication provider when you create a workspace.",
      "Classification inputs — the product details you submit (names, descriptions, materials, values, trade lanes, attached document metadata) and the results generated from them. These stay associated with your workspace.",
      "Usage records — classification counts and API usage events, used for plan limits and billing.",
      "Site analytics — aggregate, cookieless page-view and performance metrics via Vercel Web Analytics and Speed Insights. These do not use cookies and do not identify individual visitors.",
      "Language preference — a cookie (NEXT_LOCALE) remembering your chosen interface language, and a browser setting for light/dark theme. These are functional, not tracking, cookies.",
    ],
  },
  {
    heading: "3. How we use your data",
    paragraphs: [
      "We use your data to run classifications you request, produce your shipment plans and reports, enforce plan limits, secure accounts, and improve the product from aggregate usage. We do not sell personal data, and we do not use your classification inputs to train AI models.",
    ],
  },
  {
    heading: "4. Processors we rely on",
    paragraphs: [
      "Kustaro runs on a small set of infrastructure providers that process data on our behalf:",
    ],
    bullets: [
      "Supabase — authentication and database hosting for accounts, workspaces, and classification records.",
      "Vercel — application hosting, cookieless web analytics, and performance monitoring.",
      "AI providers (Google Gemini and, as fallbacks, Groq, OpenRouter, or Cerebras) — the product details you submit for a classification or Quick Find lookup are sent to one of these APIs to generate the recommendation. They are sent for processing only; we do not authorize their use for model training.",
      "Government tariff sources (the UK Trade Tariff API, USITC HTS) — receive the HS code being looked up, never your account or product identity.",
    ],
  },
  {
    heading: "5. Retention and deletion",
    paragraphs: [
      "Classification records are kept while your workspace is active so you can reuse them for repeat shipments. If you delete your account, or ask us to, we delete your workspace's records within 30 days, except where a legal obligation requires longer retention. You can request deletion at any time via the contact address above.",
    ],
  },
  {
    heading: "6. Your rights",
    paragraphs: [
      "Depending on where you live (including under the GDPR in the EU/UK and the KVKK in Türkiye), you may have the right to access, correct, export, restrict, or delete your personal data, and to object to certain processing. Write to the contact address above and we will respond within the statutory deadline. You also have the right to complain to your local data-protection authority.",
    ],
  },
  {
    heading: "7. Security",
    paragraphs: [
      "Data is encrypted in transit, database access is protected by row-level security scoped to your workspace, and service credentials are held server-side only. No method of storage is perfectly secure; if a breach affecting your data occurs, we will notify you as required by law.",
    ],
  },
  {
    heading: "8. International transfers",
    paragraphs: [
      "Our providers may process data in regions other than yours (including the United States). Where required, transfers rely on the providers' standard contractual safeguards.",
    ],
  },
  {
    heading: "9. Changes",
    paragraphs: [
      "If we change this policy materially, we will update the date above and, for significant changes, notify account holders by email or an in-app notice.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026-07-04" sections={SECTIONS} />
  );
}
