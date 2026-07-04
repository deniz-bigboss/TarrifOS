import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { isRtl } from "@/lib/i18n/config";
import "./globals.css";

// Inter everywhere — headings included — for one uniform voice across the site.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
      </body>
    </html>
  );
}
