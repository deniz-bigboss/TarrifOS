"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  KeyRound,
  LayoutDashboard,
  PackageSearch,
  Plus,
  Ship,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/classifications", label: "Shipment plans", icon: PackageSearch },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/billing", label: "Plans", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-emerald-300">
          <Ship className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-tight tracking-tight">
            TariffOS
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Shipping operations agent
          </span>
        </span>
      </div>

      <div className="p-3">
        <Button asChild className="w-full justify-start gap-2">
          <Link href="/dashboard/classifications/new">
            <Plus className="h-4 w-4" /> New shipment plan
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-emerald-50/70 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
