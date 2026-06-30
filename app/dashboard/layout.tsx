import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SetupRequired } from "@/components/setup-required";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const session = await getSessionContext();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          orgName={session.organization.name}
          plan={session.organization.plan}
          email={session.user.email ?? undefined}
        />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
