import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated } from "../guard";

export const metadata = { title: "Log in — TariffOS" };

export default async function LoginPage() {
  if (await redirectIfAuthenticated()) redirect("/dashboard");
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to your TariffOS workspace.
        </p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
