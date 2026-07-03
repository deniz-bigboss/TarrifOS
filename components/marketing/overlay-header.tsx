import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Transparent header that floats over a dark hero band — shared by every
 * pre-login page so the marketing surface reads as one system.
 */
export function OverlayHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold text-white">
          TariffOS
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex">
          <a href="/#workflow" className="hover:text-white">Workflow</a>
          <a href="/#customers" className="hover:text-white">Customers</a>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle className="border-white/25 bg-white/10 text-white hover:bg-white/20" />
          <Link
            href="/login"
            className="text-sm font-medium text-white/85 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-slate-950 shadow-sm transition-colors hover:bg-slate-100"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </header>
  );
}
