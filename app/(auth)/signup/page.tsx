import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign up — TariffOS" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Build your first shipment plan in minutes. A workspace is created
          automatically — no credit card required.
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
