"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  PackageSearch,
  Plus,
  UploadCloud,
} from "lucide-react";
import { KustaroMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n/messages";

type SidebarMessages = Messages["app"]["sidebar"];

export function DashboardSidebar({ messages }: { messages: SidebarMessages }) {
  const pathname = usePathname();

  const nav = [
    { href: "/dashboard", label: messages.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/dashboard/classifications", label: messages.nav.plans, icon: PackageSearch },
    { href: "/dashboard/products", label: messages.nav.products, icon: Boxes },
    { href: "/dashboard/bulk-upload", label: messages.nav.bulkUpload, icon: UploadCloud },
    { href: "/dashboard/api-keys", label: messages.nav.apiKeys, icon: KeyRound },
    { href: "/dashboard/billing", label: messages.nav.billing, icon: CreditCard },
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950">
          <KustaroMark className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-tight tracking-tight">
            Kustaro
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {messages.tagline}
          </span>
        </span>
      </div>

      <div className="p-3">
        <Button asChild className="w-full justify-start gap-2">
          <Link href="/classify">
            <Plus className="h-4 w-4" /> {messages.newPlan}
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
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
                  ? "bg-accent text-primary dark:bg-accent"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-primary",
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
