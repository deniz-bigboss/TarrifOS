import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated } from "../guard";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Sign up — TariffOS" };

export default async function SignupPage() {
  if (await redirectIfAuthenticated()) redirect("/dashboard");
  const { t } = getI18n();
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signupTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
      </div>
      <Suspense>
        <AuthForm mode="signup" messages={t.auth} />
      </Suspense>
      <p className="text-center text-xs text-muted-foreground">
        {t.legal.consentPrefix}{" "}
        <a href="/terms" className="underline hover:text-foreground">
          {t.legal.terms}
        </a>{" "}
        {t.legal.and}{" "}
        <a href="/privacy" className="underline hover:text-foreground">
          {t.legal.privacy}
        </a>
        .
      </p>
    </div>
  );
}
