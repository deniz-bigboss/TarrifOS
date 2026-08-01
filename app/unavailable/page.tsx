import type { Metadata } from "next";
import Link from "next/link";
import { KustaroMark } from "@/components/brand/logo";

/**
 * Holding page shown while public access is suspended. Middleware rewrites
 * every gated request here, so this page must stand on its own: no navigation
 * into the product, no marketing claims, nothing that implies the service can
 * be bought today.
 */

export const metadata: Metadata = {
  title: "Temporarily unavailable",
  description: "Kustaro is not open to the public at the moment.",
  robots: { index: false, follow: false },
};

export default function UnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
          <KustaroMark className="h-7 w-7" />
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Kustaro is temporarily unavailable
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We have closed the service to new visitors while we complete a review
          of our terms, policies and product documentation. Nothing can be
          purchased in the meantime.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          If you already have an account, your data is untouched and will be
          waiting for you when we reopen.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-card px-5 py-4 text-sm">
          <p className="text-muted-foreground">
            Questions, or need access sooner?
          </p>
          <a
            className="mt-1 inline-block font-medium text-primary hover:underline"
            href="mailto:support@kustaro.app"
          >
            support@kustaro.app
          </a>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
