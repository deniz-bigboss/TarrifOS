import Link from "next/link";
import { KustaroMark } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950">
          <KustaroMark className="h-5 w-5" />
        </span>
        <span className="text-xl tracking-tight">Kustaro</span>
      </Link>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
