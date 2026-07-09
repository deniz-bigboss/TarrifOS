import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Kustaro",
  description:
    "How refunds and cancellations work for Kustaro subscriptions, processed through Paddle, our merchant of record.",
};

/* Refund policy written for Kustaro's actual billing model (prepaid monthly
   credit plans sold through Paddle as merchant of record). Operated solely by
   Mahmut Kartal; should be reviewed by counsel before scaling. */

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who you are buying from",
    paragraphs: [
      "Kustaro is operated solely by Mahmut Kartal (Ankara, Türkiye). Payments for paid plans are processed by Paddle.com Market Ltd, which acts as our merchant of record and authorized reseller. This means Paddle — not Kustaro — is the seller of record for your purchase, handles the payment, collects any applicable VAT or sales tax, and issues your receipt. A Kustaro charge will typically appear on your statement as \"Paddle.net\" or similar.",
      "Refunds are handled by us in accordance with this policy and are issued through Paddle back to your original payment method. This policy does not limit any additional rights you may have under Paddle's Buyer Terms or mandatory consumer law.",
    ],
  },
  {
    heading: "2. What you are buying",
    paragraphs: [
      "Paid Kustaro plans (Starter, Pro, Business) are prepaid, auto-renewing monthly subscriptions. Each plan includes a monthly allowance of classifications, report translations, and related features as described on the pricing page. Kustaro is a digital service: classifications, confidence refinements, translations, and reports are generated on demand and delivered to you immediately.",
    ],
  },
  {
    heading: "3. 14-day refund window",
    paragraphs: [
      "If you are not satisfied with a paid plan, you may request a full refund of your most recent subscription payment within 14 days of that charge, provided you have not substantially used the plan's monthly allowance during that period. \"Substantial use\" means consuming more than a small fraction of the included monthly allowance (for example, running more than a handful of classifications or translations).",
      "Because Kustaro is delivered digitally and begins performing as soon as you use it, this 14-day window is offered by us as a good-faith satisfaction guarantee. Where mandatory consumer law grants you a broader right, that law prevails (see section 7).",
    ],
  },
  {
    heading: "4. What is non-refundable",
    paragraphs: [
      "Usage you have already consumed is non-refundable, because each classification, refinement, translation, and generated report incurs real AI and processing costs at the moment it is produced. Specifically:",
    ],
    bullets: [
      "Classifications, confidence refinements, translations, and reports already generated in the billing period.",
      "Subscription periods that have already fully elapsed.",
      "Renewals where a cancellation was not made before the renewal date but could have been (see section 5) — though we review these case by case.",
      "Any plan where the monthly allowance has been substantially or fully used.",
    ],
  },
  {
    heading: "5. Cancellations",
    paragraphs: [
      "You can cancel your subscription at any time from the Billing page in your dashboard, from the customer portal linked there, or by emailing us. Cancelling stops all future renewals — you will not be charged again. Your paid plan and its allowance remain active until the end of the billing period you have already paid for, after which the workspace returns to the free plan. We do not pro-rate or refund the unused remainder of a cancelled period except where required by law or under the 14-day window in section 3.",
    ],
  },
  {
    heading: "6. How to request a refund",
    paragraphs: [
      "Email support@kustaro.app from the address on your account, including your Paddle order or receipt number (from the emailed receipt) and a brief reason. We aim to respond within 2 business days. Approved refunds are issued by Paddle to your original payment method and typically appear within 5–10 business days, depending on your bank or card issuer.",
      "If you believe you were charged in error or have a billing question, please contact us first — we can almost always resolve it faster than a bank dispute.",
    ],
  },
  {
    heading: "7. Your statutory rights",
    paragraphs: [
      "Nothing in this policy removes or reduces any mandatory rights you have as a consumer under the law that applies to you. Consumers in the EU, the UK, and comparable jurisdictions have a statutory right to withdraw from a digital-services purchase within 14 days; for digital services this right can end once performance begins with your consent and acknowledgement that you lose the right of withdrawal. Where such a right applies to you and has not been lawfully waived, we honor it in full.",
    ],
  },
  {
    heading: "8. Chargebacks",
    paragraphs: [
      "Please contact support@kustaro.app before opening a chargeback or payment dispute with your bank. Most issues are billing mistakes or misunderstandings we can refund directly and immediately. Fraudulent chargebacks on legitimately delivered service may result in suspension of the account.",
    ],
  },
  {
    heading: "9. Changes and contact",
    paragraphs: [
      "We may update this policy; the effective date above will change and material updates are notified to account holders. This policy is governed by the laws of the Republic of Türkiye, with disputes subject to the courts of Ankara, Türkiye, without prejudice to the mandatory consumer protections of your country of residence.",
      "Questions about refunds or billing: support@kustaro.app.",
    ],
  },
];

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      updated="2026-07-09"
      sections={SECTIONS}
    />
  );
}
