import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { getPlan } from "@/lib/billing/plans";
import { activeProviderName } from "@/lib/ai";

interface TopbarProps {
  orgName: string;
  plan: string;
  email?: string;
}

export function DashboardTopbar({ orgName, plan, email }: TopbarProps) {
  const planDef = getPlan(plan);
  const provider = activeProviderName();
  const { locale, t } = getI18n();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5">
      <div className="flex items-center gap-3">
        <span className="font-semibold">{orgName}</span>
        <Badge variant="secondary">{planDef.name} {t.app.topbar.plan}</Badge>
        <Badge variant="outline" className="hidden sm:inline-flex">
          AI: {provider}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {planDef.id === "free" && (
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href="/dashboard/billing">
              {t.app.topbar.upgrade} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {email}
        </span>
        <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <Button type="submit" size="sm" variant="ghost">
            {t.app.topbar.signOut}
          </Button>
        </form>
      </div>
    </header>
  );
}
