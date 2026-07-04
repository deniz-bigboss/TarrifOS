import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of Service — TariffOS" };

/* Original terms written for TariffOS's actual functionality. Items marked
   [FILL IN] must be completed by the operator before general availability, and
   the whole document should be reviewed by counsel. */

const SECTIONS: LegalSection[] = [
  {
    heading: "1. The service",
    paragraphs: [
      "TariffOS provides AI-assisted tariff-classification recommendations, duty and landed-cost estimates, document checklists, compliance checkpoints, and shipment execution plans, via the web application and the API. The service is operated by [FILL IN: legal entity name]. By creating an account or using the API you agree to these terms.",
    ],
  },
  {
    heading: "2. Recommendations, not legal advice",
    paragraphs: [
      "This is the most important term. TariffOS outputs — including HS code recommendations, duty and additional-tariff estimates, trade-remedy references, document lists, and plans — are recommendations generated from the information you provide and available tariff data. They are not legal, customs, or tax advice, and rates shown may be estimates or dated reference points. You are responsible for confirming the final classification, duty treatment, and declarations with a qualified customs broker or the customs authority before filing. TariffOS is a decision-support tool, not a declarant.",
    ],
  },
  {
    heading: "3. Your account and acceptable use",
    paragraphs: [
      "Keep your credentials and API keys confidential; activity under your account is your responsibility. You agree not to misuse the service — including attempting to breach security or rate limits, reselling access without an agreement, submitting unlawful content, or using outputs to misdeclare goods to a customs authority.",
    ],
  },
  {
    heading: "4. Plans, limits, and billing",
    paragraphs: [
      "Each plan includes a monthly classification allowance and feature set as described on the pricing page. Paid billing is processed by our payment provider when enabled; plan limits are enforced per workspace. We may change plan pricing with notice effective from your next billing cycle.",
    ],
  },
  {
    heading: "5. Your data and our IP",
    paragraphs: [
      "You retain all rights to the product information you submit and may export your classification results. We retain all rights to the TariffOS software, models of operation, and interface. You grant us the limited license needed to process your inputs and store your results in order to provide the service, as described in the Privacy Policy.",
    ],
  },
  {
    heading: "6. Availability and third-party services",
    paragraphs: [
      "The service depends on third-party AI providers and government tariff sources. We engineer for graceful degradation (fallback providers, cached and seed data), but we do not guarantee uninterrupted availability of live data sources or the service itself.",
    ],
  },
  {
    heading: "7. Disclaimer and limitation of liability",
    paragraphs: [
      "The service is provided \"as is\" without warranties of any kind, express or implied, including accuracy of classifications or duty figures. To the maximum extent permitted by law, our total liability for any claims arising from the service is limited to the amounts you paid to us in the twelve months before the event giving rise to the claim, and we are not liable for indirect or consequential losses — including duties, penalties, or delays assessed by a customs authority.",
    ],
  },
  {
    heading: "8. Termination",
    paragraphs: [
      "You may stop using the service and request account deletion at any time. We may suspend or terminate accounts that violate these terms, with notice where practicable. Sections 2, 5, 7, and 9 survive termination.",
    ],
  },
  {
    heading: "9. Governing law and changes",
    paragraphs: [
      "These terms are governed by the laws of [FILL IN: governing jurisdiction], and disputes are subject to the courts of that jurisdiction. If we change these terms materially, we will update the date above and notify account holders; continued use after the effective date constitutes acceptance.",
      "Questions about these terms: deniz@terra-reform.org.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="2026-07-04" sections={SECTIONS} />
  );
}
