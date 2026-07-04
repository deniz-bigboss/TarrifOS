import Link from "next/link";
import { Ship } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

export function SiteFooter() {
  const { t } = getI18n();
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Ship className="h-4 w-4" />
          </span>
          TariffOS
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          {t.footer.tagline}
        </p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">{t.footer.pricing}</Link>
          <Link href="/login" className="hover:text-foreground">{t.footer.login}</Link>
          <Link href="/signup" className="hover:text-foreground">{t.footer.signup}</Link>
        </div>
      </div>
    </footer>
  );
}
