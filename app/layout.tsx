import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { isRtl } from "@/lib/i18n/config";
import { isPublicAccessSuspended } from "@/lib/site/access";
import "./globals.css";

// Inter everywhere — headings included — for one uniform voice across the site.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kustaro — Classify products for customs before they ship",
    template: "%s | Kustaro",
  },
  description:
    "Kustaro is a self-serve customs-readiness workspace: generate HS-code candidates, missing-information questions, document checklists, risk flags, and customs-readiness reports directly in your browser.",
  metadataBase: new URL("https://kustaro.app"),
  alternates: { canonical: "/" },
  applicationName: "Kustaro",
  // Google Search Console site ownership. Next renders this into <head> on
  // every page, which also satisfies the "must be on the homepage" check.
  verification: { google: "0NmKEddQiE8m5v6Kg0gJlMN_HDIaRrk4g9OK4fXuxWU" },
  // Belt and braces alongside robots.txt: while public access is suspended,
  // every page carries an explicit noindex so nothing already crawled sticks
  // around in the index.
  ...(isPublicAccessSuspended()
    ? { robots: { index: false, follow: false } }
    : {}),
  openGraph: {
    title: "Kustaro — Classify products for customs before they ship",
    description:
      "HS-code candidates, missing-information questions, document checklists, risk flags, and customs-readiness reports — directly in your browser.",
    url: "https://kustaro.app",
    siteName: "Kustaro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kustaro — Classify products for customs before they ship",
    description:
      "Self-serve customs-readiness workspace for importers, exporters, e-commerce brands, and freight teams.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn(inter.variable)}
    >
      <body className="font-sans">
        {/* Applies the stored (or OS-preferred) theme before first paint so
            dark-mode users never see a white flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()',
          }}
        />
        {children}
        {/* Vercel Web Analytics (cookieless) + Speed Insights — enabled in the
            Vercel dashboard; these components emit the data. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
