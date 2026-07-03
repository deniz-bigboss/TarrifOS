import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5">
      <div className="flex items-center gap-3">
        <span className="font-semibold">{orgName}</span>
        <Badge variant="secondary">{planDef.name} plan</Badge>
        <Badge variant="outline" className="hidden sm:inline-flex">
          AI: {provider}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {planDef.id === "free" && (
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href="/dashboard/billing">
              Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {email}
        </span>
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <Button type="submit" size="sm" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
