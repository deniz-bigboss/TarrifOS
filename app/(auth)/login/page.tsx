import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated } from "../guard";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Log in — TariffOS" };

export default async function LoginPage() {
  if (await redirectIfAuthenticated()) redirect("/dashboard");
  const { t } = getI18n();
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>
      </div>
      <Suspense>
        <AuthForm mode="login" messages={t.auth} />
      </Suspense>
    </div>
  );
}
