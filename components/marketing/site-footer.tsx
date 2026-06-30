import Link from "next/link";
import { Ship } from "lucide-react";

export function SiteFooter() {
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
          TariffOS provides classification recommendations generated from
          product information and tariff data. It is not legal advice. Final
          classification and duty treatment must be confirmed by a qualified
          customs broker or customs authority.
        </p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/login" className="hover:text-foreground">Log in</Link>
          <Link href="/signup" className="hover:text-foreground">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
