"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteProductAction,
  duplicateProductAction,
} from "@/app/dashboard/products/actions";
import { Button } from "@/components/ui/button";

export function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"dup" | "del" | null>(null);

  async function duplicate() {
    setPending("dup");
    await duplicateProductAction(productId);
    setPending(null);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Remove this product from the library?")) return;
    setPending("del");
    await deleteProductAction(productId);
    setPending(null);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button asChild size="sm" variant="outline" title="Reclassify — prefills the wizard; change the destination there to test a new lane">
        <Link href={`/classify?product=${productId}`}>
          <RefreshCw className="h-3.5 w-3.5" /> Reclassify
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={duplicate} disabled={pending !== null} title="Duplicate">
        {pending === "dup" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button size="sm" variant="ghost" onClick={remove} disabled={pending !== null} title="Delete">
        {pending === "del" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
