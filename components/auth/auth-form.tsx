"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { createAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Messages } from "@/lib/i18n/messages";

type AuthMessages = Messages["auth"];

/** Turns raw Supabase auth errors into friendly, actionable messages. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts in a short time. Wait a minute and try again — if this keeps happening, your Supabase project's email settings need attention (see README).";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (m.includes("already") || m.includes("registered")) {
    return "An account with this email already exists — log in instead.";
  }
  return message;
}

export function AuthForm({
  mode,
  messages,
}: {
  mode: "login" | "signup";
  messages: AuthMessages;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        // Clear any stale session first, so we can never fall back into a
        // previously signed-in account instead of the new one.
        await supabase.auth.signOut();

        // Preferred path: create a confirmed account server-side (no
        // confirmation email → no email rate limit), then sign in.
        const created = await createAccount({ email, password, fullName });

        if (created.ok) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          router.push(redirectTo);
          router.refresh();
        } else if (created.needsClientSignup) {
          // Fallback when the service-role key isn't configured: standard
          // client signUp. Trust the signUp response's own session — never a
          // separate getSession() that could return a stale one.
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
          if (data.session) {
            router.push(redirectTo);
            router.refresh();
          } else {
            setInfo(messages.checkEmail);
          }
        } else {
          setError(created.error ?? "Could not create the account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{messages.fullName}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Importer"
            autoComplete="name"
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">{messages.email}</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{messages.password}</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
          {info}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSignup ? messages.createAccount : messages.login}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            {messages.haveAccount}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {messages.login}
            </Link>
          </>
        ) : (
          <>
            {messages.noAccount}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {messages.createAccount}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
