import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  PackageSearch,
  Plus,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { listClassifications } from "@/lib/db/classifications";
import { countUsageThisMonth } from "@/lib/db/usage";
import { checkClassificationLimit } from "@/lib/billing/limits";
import { getPlan } from "@/lib/billing/plans";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HumanReviewBadge } from "@/components/human-review-badge";
import { countryName, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = createClient();
  const orgId = session.organization.id;
  const plan = getPlan(session.organization.plan);

  const [items, apiUsage, limit] = await Promise.all([
    listClassifications(supabase, orgId),
    countUsageThisMonth(supabase, orgId, "api_classification"),
    checkClassificationLimit(supabase, orgId, session.organization.plan),
  ]);

  const total = items.length;
  const highConfidence = items.filter(
    (i) => i.result?.confidence_label === "high",
  ).length;
  const needsReview = items.filter(
    (i) => i.result?.human_review_required,
  ).length;
  const recent = items.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {limit.limit == null
              ? `${limit.used} classifications this month`
              : `${limit.used} / ${limit.limit} classifications used this month`}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/classifications/new">
            <Plus className="h-4 w-4" /> New classification
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total classifications" value={total} icon={PackageSearch} />
        <StatCard
          label="High confidence"
          value={highConfidence}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Needs review"
          value={needsReview}
          icon={AlertTriangle}
          accent="warning"
        />
        <StatCard
          label="API calls (mo.)"
          value={apiUsage}
          icon={Zap}
          hint="Usage-based metering"
        />
      </div>

      {/* Plan / usage + upgrade */}
      {plan.id === "free" && (
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Gauge className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">You're on the Free plan</p>
                <p className="text-sm text-muted-foreground">
                  {limit.remaining ?? 0} classifications left this month. Upgrade
                  for more volume, API access, and document uploads.
                </p>
              </div>
            </div>
            <Button asChild variant="default">
              <Link href="/dashboard/billing">
                Upgrade plan <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent classifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent classifications</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/classifications">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Lane</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map(({ request, result }) => (
                  <TableRow key={request.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/classifications/${request.id}`}>
                        {request.product_name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result?.recommended_code || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.origin_country} → {request.destination_country}
                    </TableCell>
                    <TableCell>
                      {result ? (
                        <Badge
                          variant={
                            result.confidence_label === "high"
                              ? "success"
                              : result.confidence_label === "medium"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {Math.round((result.confidence ?? 0) * 100)}%
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <HumanReviewBadge
                        required={Boolean(result?.human_review_required)}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <PackageSearch className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium">No classifications yet</p>
        <p className="text-sm text-muted-foreground">
          Classify your first product to see it here.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/classifications/new">
          <Plus className="h-4 w-4" /> New classification
        </Link>
      </Button>
    </div>
  );
}
