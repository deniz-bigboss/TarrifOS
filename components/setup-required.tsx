import Link from "next/link";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown in the dashboard when Supabase env vars are not configured. */
export function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Database className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold">Connect Supabase to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard needs Supabase for auth and persistence. Set{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          and run the migrations in{" "}
          <code className="rounded bg-muted px-1">supabase/migrations</code>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          See the README for full setup steps. The marketing site and mock
          classification engine work without it.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
