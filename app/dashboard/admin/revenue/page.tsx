import { AlertTriangle, Wallet } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admins";
import { notFound } from "next/navigation";
import { getPaymentProvider } from "@/lib/billing/payment";
import { isPaddleConfigured, paddleEnvironment } from "@/lib/billing/paddle";
import {
  loadRevenueSummary,
  formatMoney,
  type CurrencyTotals,
  type RevenueSummary,
} from "@/lib/billing/revenue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Revenue — Kustaro" };
export const dynamic = "force-dynamic";
// Several paginated Paddle calls.
export const maxDuration = 30;

/** Operator-only revenue console: every charge, every refund, and what's left. */
export default async function AdminRevenuePage() {
  const session = await getSessionContext();
  if (!session) return null;
  if (!isAdminEmail(session.user.email)) notFound();

  const provider = getPaymentProvider();
  const configured = isPaddleConfigured();

  let summary: RevenueSummary | null = null;
  let error: string | null = null;
  if (configured) {
    try {
      summary = await loadRevenueSummary();
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load Paddle data.";
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Wallet className="h-4 w-4" /> Operator console
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Revenue</h1>
        <p className="text-sm text-muted-foreground">
          Read live from Paddle, the merchant of record — every charge and refund
          across all customers.{" "}
          {configured && (
            <>
              Environment:{" "}
              <span className="font-medium">{paddleEnvironment()}</span>.
            </>
          )}
        </p>
      </div>

      {!configured && (
        <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
          No payment provider is configured yet (currently{" "}
          <span className="font-medium">{provider}</span>), so there is nothing
          to report. Revenue appears here once Paddle credentials are set.
        </p>
      )}

      {error && (
        <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Could not load Paddle data: {error}
        </p>
      )}

      {summary && (
        <>
          {summary.totals.length === 0 ? (
            <p className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
              No charges yet. The first purchase will appear here, and both
              founders get an email.
            </p>
          ) : (
            summary.totals.map((t) => <TotalsBlock key={t.currency} totals={t} />)
          )}

          {summary.pendingRefundCount > 0 && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {summary.pendingRefundCount} refund
              {summary.pendingRefundCount === 1 ? "" : "s"} awaiting Paddle
              approval — not deducted from the net figure yet.
            </p>
          )}

          {summary.purchases.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Charged</TableHead>
                      <TableHead className="text-right">Paddle fee</TableHead>
                      <TableHead className="text-right">Your earnings</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.purchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {p.date ? formatDateTime(p.date) : "—"}
                        </TableCell>
                        <TableCell className="max-w-[16rem] truncate">
                          {p.email ?? "—"}
                        </TableCell>
                        <TableCell>{p.planName ?? "—"}</TableCell>
                        <TableCell className="whitespace-nowrap text-right tabular-nums">
                          {formatMoney(p.collected, p.currency)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right tabular-nums text-muted-foreground">
                          −{formatMoney(p.fee, p.currency)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                          {formatMoney(p.earnings, p.currency)}
                        </TableCell>
                        <TableCell>
                          {p.fullyRefunded ? (
                            <Badge variant="destructive">Refunded</Badge>
                          ) : p.refundedAmount > 0 ? (
                            <Badge variant="warning">
                              Partly refunded −
                              {formatMoney(p.refundedAmount, p.currency)}
                            </Badge>
                          ) : (
                            <Badge variant="success">Paid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {summary.refunds.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Refunds &amp; adjustments
              </h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.refunds.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {r.date ? formatDateTime(r.date) : "—"}
                          </TableCell>
                          <TableCell className="capitalize">{r.action}</TableCell>
                          <TableCell className="whitespace-nowrap text-right tabular-nums">
                            {formatMoney(r.amount, r.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={r.pending ? "warning" : "secondary"}>
                              {r.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {summary.truncated && (
            <p className="text-xs text-muted-foreground">
              Showing the most recent 500 records — older history is in the
              Paddle dashboard.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TotalsBlock({ totals: t }: { totals: CurrencyTotals }) {
  return (
    <div className="space-y-2">
      {t.currency !== "USD" && (
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.currency}
        </h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Net accrued"
          value={formatMoney(t.net, t.currency)}
          hint="Earnings after refunds — what reaches your payout balance"
          strong
        />
        <Stat
          label="Collected"
          value={formatMoney(t.collected, t.currency)}
          hint={`${t.purchases} charge${t.purchases === 1 ? "" : "s"}, tax included`}
        />
        <Stat
          label="Refunded"
          value={t.refunded > 0 ? `−${formatMoney(t.refunded, t.currency)}` : formatMoney(0, t.currency)}
          hint={`${t.refunds} refund${t.refunds === 1 ? "" : "s"} returned to customers`}
          tone={t.refunded > 0 ? "bad" : undefined}
        />
        <Stat
          label="Paddle fees & tax"
          value={formatMoney(t.collected - t.earnings, t.currency)}
          hint={`Includes ${formatMoney(t.fees, t.currency)} in Paddle fees`}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  strong,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
  tone?: "bad";
}) {
  return (
    <div
      className={
        "rounded-lg border bg-card p-4 " +
        (strong ? "border-primary/40 ring-1 ring-primary/10" : "")
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-1 text-2xl font-bold tabular-nums " +
          (tone === "bad"
            ? "text-red-600 dark:text-red-400"
            : strong
              ? "text-primary"
              : "text-foreground")
        }
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
