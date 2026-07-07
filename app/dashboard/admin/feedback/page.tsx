import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { getSessionContext } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admins";
import { createAdminClient, isAdminConfigured } from "@/lib/db/supabase/admin";
import { listAllFeedback, type AdminFeedbackRow } from "@/lib/db/feedback";
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

export const metadata = { title: "Feedback console — Kustaro" };
export const dynamic = "force-dynamic";

/** Operator-only console: every organization's broker/customs feedback. */
export default async function AdminFeedbackPage() {
  const session = await getSessionContext();
  if (!session) return null;

  // Anyone who isn't an operator gets a 404 — don't reveal the route exists.
  if (!isAdminEmail(session.user.email)) notFound();
  if (!isAdminConfigured()) notFound();

  const admin = createAdminClient();
  const rows = await listAllFeedback(admin, 300);

  const total = rows.length;
  const accepted = rows.filter((r) => r.was_correct === true).length;
  const rejected = rows.filter((r) => r.was_correct === false).length;
  const delays = rows.filter((r) => r.delay_occurred === true).length;
  const penalties = rows.filter((r) => r.penalty_occurred === true).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <MessageSquarePlus className="h-4 w-4" /> Operator console
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Broker feedback</h1>
        <p className="text-sm text-muted-foreground">
          Every correction customers submit, across all organizations. This is
          the training-data moat — outcomes at the border feed model quality.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Total" value={total} />
        <Stat label="Accepted" value={accepted} tone="success" />
        <Stat label="Rejected" value={rejected} tone="destructive" />
        <Stat label="Delays" value={delays} tone="warning" />
        <Stat label="Penalties" value={penalties} tone="destructive" />
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No feedback yet. When a customer submits broker/customs feedback on
              a classification, it appears here — and you get an email.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Suggested</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Correct code</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <FeedbackRow key={r.id} row={r} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "destructive";
}) {
  const color =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "destructive"
          ? "text-red-600 dark:text-red-400"
          : "text-foreground";
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function FeedbackRow({ row }: { row: AdminFeedbackRow }) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.created_at)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="font-medium">{row.org_name ?? "—"}</span>
        {row.org_plan && (
          <span className="ml-1 text-xs capitalize text-muted-foreground">
            ({row.org_plan})
          </span>
        )}
      </TableCell>
      <TableCell className="max-w-[16rem] truncate">
        {row.request_id ? (
          <Link
            href={`/dashboard/classifications/${row.request_id}`}
            className="text-primary hover:underline"
          >
            {row.product_name ?? "View"}
          </Link>
        ) : (
          (row.product_name ?? "—")
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs">
        {row.recommended_code ?? "—"}
      </TableCell>
      <TableCell>
        {row.was_correct === true ? (
          <Badge variant="success">Accepted</Badge>
        ) : row.was_correct === false ? (
          <Badge variant="destructive">Rejected</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs">
        {row.actual_code ? (
          <span className="text-red-600 dark:text-red-400">{row.actual_code}</span>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {row.shipment_cleared === true && <Badge variant="success">Cleared</Badge>}
          {row.shipment_cleared === false && <Badge variant="outline">Not cleared</Badge>}
          {row.delay_occurred === true && <Badge variant="warning">Delay</Badge>}
          {row.penalty_occurred === true && <Badge variant="destructive">Penalty</Badge>}
        </div>
      </TableCell>
      <TableCell className="max-w-[20rem] text-xs text-muted-foreground">
        {row.broker_notes ? (
          <span title={row.broker_notes}>{row.broker_notes}</span>
        ) : (
          "—"
        )}
      </TableCell>
    </TableRow>
  );
}
