"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (uses the anon key). Safe to call in client
 * components. Reads public env vars injected at build time.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
