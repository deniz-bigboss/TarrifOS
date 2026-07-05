"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { saveToLibraryAction } from "@/app/classify/actions";
import { Button } from "@/components/ui/button";

/** Save the classified product into the SKU library (authed users). */
export function SaveToLibrary({ classificationId }: { classificationId: string }) {
  const [state, setState] = useState<"idle" | "pending" | "saved" | "updated">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setState("pending");
    setError(null);
    const res = await saveToLibraryAction(classificationId);
    if (!res.ok) {
      setError(res.error);
      setState("idle");
      return;
    }
    setState(res.data.updated ? "updated" : "saved");
  }

  if (state === "saved" || state === "updated") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-success">
        <Check className="h-4 w-4" />
        {state === "updated" ? "Product updated in" : "Saved to"}{" "}
        <Link href="/dashboard/products" className="font-medium underline">
          your SKU library
        </Link>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={save} disabled={state === "pending"}>
        {state === "pending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookmarkPlus className="h-4 w-4" />
        )}
        Save to SKU library
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
