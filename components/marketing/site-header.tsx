import Link from "next/link";
import { Ship } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Ship className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">TariffOS</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#workflow" className="hover:text-foreground">Workflow</Link>
          <Link href="/#customers" className="hover:text-foreground">Customers</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Start classifying</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
