"use client";

import type { ProductInputSchema } from "@/lib/validation/schemas";

/**
 * Carries a guest's product details across the signup wall.
 *
 * A guest fills in the wizard, gets a result, and is at their most convinced
 * exactly when they click "create an account" — at which point everything they
 * typed used to be thrown away, and the reward for signing up was an empty
 * form. This keeps the input in the browser so their first saved
 * classification is one click away.
 *
 * Stored in localStorage rather than sessionStorage on purpose: email
 * confirmation is often opened in a different tab, which would lose a session
 * value. Entries expire so an abandoned attempt doesn't resurface weeks later.
 */

const KEY = "kustaro_pending_classification";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface Stored {
  input: Partial<ProductInputSchema>;
  savedAt: number;
}

export function savePendingClassification(input: Partial<ProductInputSchema>): void {
  if (typeof window === "undefined") return;
  try {
    const payload: Stored = { input, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Private mode or a full quota — losing the handoff is not worth an error.
  }
}

export function readPendingClassification(): Partial<ProductInputSchema> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.input || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearPendingClassification();
      return null;
    }
    return parsed.input;
  } catch {
    return null;
  }
}

export function clearPendingClassification(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
