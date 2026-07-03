import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

// Inter for body copy — the de facto standard for clean B2B SaaS UI.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Lexend for headings — slightly more geometric/confident than Inter at
// large sizes, without tipping into "playful." Used sparingly via .font-display.
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TariffOS — AI shipping operations agent",
  description:
    "TariffOS turns product facts into HS code recommendations, document checklists, compliance checkpoints, cost-saving actions, and shipment execution plans — for importers and exporters on any lane worldwide.",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, lexend.variable)}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
