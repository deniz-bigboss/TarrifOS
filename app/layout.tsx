import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TariffOS — AI customs classification & landed-cost",
  description:
    "TariffOS helps importers classify products, estimate landed costs, and prepare customs-ready documentation. AI-powered tariff classification with evidence, confidence scores, and broker-ready reports.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
