import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase/server";
import { listProducts } from "@/lib/db/products";
import { ProductRowActions } from "@/components/products/product-row-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countryName, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Products — Kustaro" };

/** Saved product / SKU library: reclassify repeat SKUs against new lanes
 * without retyping them. */
export default async function ProductsPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const products = await listProducts(createClient(), session.organization.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Your saved SKU library — reclassify repeat products against any
            destination in one click.
          </p>
        </div>
        <Button asChild>
          <Link href="/classify">
            <PackagePlus className="h-4 w-4" /> Classify a product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card p-10 text-center">
          <p className="font-medium">No saved products yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Classify a product, then use “Save to SKU library” on the result —
            it lands here for one-click reclassification.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">Product</th>
                <th className="px-3 py-2.5 text-left font-medium">SKU</th>
                <th className="px-3 py-2.5 text-left font-medium">Lane</th>
                <th className="px-3 py-2.5 text-left font-medium">Latest code</th>
                <th className="px-3 py-2.5 text-right font-medium">Confidence</th>
                <th className="px-3 py-2.5 text-right font-medium">Readiness</th>
                <th className="px-3 py-2.5 text-left font-medium">Last classified</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="max-w-[220px] px-3 py-2.5">
                    <p className="truncate font-medium">{p.product_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.sku ?? "—"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {p.origin_country ? countryName(p.origin_country) : "—"} →{" "}
                    {p.last_destination_country
                      ? countryName(p.last_destination_country)
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    {p.latest_recommended_code ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {p.latest_confidence != null ? (
                      <Badge variant="outline">
                        {Math.round(Number(p.latest_confidence) * 100)}%
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {p.latest_readiness_score != null ? (
                      <Badge
                        variant={
                          p.latest_readiness_score >= 75
                            ? "success"
                            : p.latest_readiness_score >= 50
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {p.latest_readiness_score}/100
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {p.last_classified_at ? formatDateTime(p.last_classified_at) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <ProductRowActions productId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
