import Link from "next/link";
import { KustaroMark } from "@/components/brand/logo";
import { getI18n } from "@/lib/i18n/server";

export function SiteFooter() {
  const { t } = getI18n();
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950">
            <KustaroMark className="h-4 w-4" />
          </span>
          Kustaro
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          {t.footer.tagline}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">{t.footer.pricing}</Link>
          <Link href="/privacy" className="hover:text-foreground">{t.legal.privacy}</Link>
          <Link href="/terms" className="hover:text-foreground">{t.legal.terms}</Link>
          <Link href="/login" className="hover:text-foreground">{t.footer.login}</Link>
          <Link href="/signup" className="hover:text-foreground">{t.footer.signup}</Link>
        </div>
      </div>
    </footer>
  );
}
