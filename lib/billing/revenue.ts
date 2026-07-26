import { paddleFetchPage, planFromPaddlePriceId } from "./paddle";
import { getPlan } from "./plans";

/**
 * Revenue reporting straight from Paddle — the authoritative source, since
 * Paddle is the merchant of record and holds every charge, tax figure and fee.
 * Our own `billing_events` table records plan changes but no amounts, so it
 * cannot answer "how much money came in".
 *
 * All Paddle amounts are strings in the currency's minor unit ("4900" = $49.00)
 * and every total object carries its own `currency_code`, so nothing is summed
 * across currencies — totals are grouped per currency instead.
 */

const PAGE_SIZE = 100;
const MAX_PAGES = 5; // 500 rows; enough for a long while, and bounds the request

interface PaddleTotals {
  grand_total?: string;
  total?: string;
  tax?: string;
  fee?: string;
  earnings?: string;
  currency_code?: string;
}

export interface PaddleTransaction {
  id: string;
  status?: string;
  billed_at?: string | null;
  created_at?: string;
  currency_code?: string;
  customer_id?: string | null;
  subscription_id?: string | null;
  customer?: { email?: string | null } | null;
  items?: Array<{ price?: { id?: string } | null } | null> | null;
  details?: {
    totals?: PaddleTotals;
    payout_totals?: PaddleTotals | null;
  };
}

export interface PaddleAdjustment {
  id: string;
  action?: string; // refund | credit | chargeback | chargeback_warning | ...
  status?: string; // pending_approval | approved | rejected | reversed
  transaction_id?: string | null;
  customer_id?: string | null;
  created_at?: string;
  currency_code?: string;
  totals?: PaddleTotals;
  payout_totals?: PaddleTotals | null;
}

function minor(value: string | undefined | null): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Currencies Paddle quotes without minor units. */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "HUF"]);

export function formatMoney(amountMinor: number, currency: string): string {
  const digits = ZERO_DECIMAL.has(currency) ? 0 : 2;
  const value = digits === 0 ? amountMinor : amountMinor / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${value.toFixed(digits)} ${currency}`;
  }
}

export interface CurrencyTotals {
  currency: string;
  /** What customers were charged, tax included. */
  collected: number;
  /** Paddle's fee on those charges. */
  fees: number;
  /** Seller earnings on those charges (charge − tax − fee), before refunds. */
  earnings: number;
  /** Money returned to customers (approved refunds and chargebacks). */
  refunded: number;
  /** Earnings given back by those refunds. */
  refundedEarnings: number;
  /** earnings − refundedEarnings: what actually accrues to the payout balance. */
  net: number;
  purchases: number;
  refunds: number;
}

export interface PurchaseRow {
  id: string;
  date: string | null;
  email: string | null;
  planName: string | null;
  currency: string;
  collected: number;
  fee: number;
  earnings: number;
  refundedAmount: number;
  fullyRefunded: boolean;
}

export interface RefundRow {
  id: string;
  date: string | null;
  action: string;
  status: string;
  currency: string;
  amount: number;
  pending: boolean;
}

export interface RevenueSummary {
  totals: CurrencyTotals[];
  purchases: PurchaseRow[];
  refunds: RefundRow[];
  /** Refunds awaiting Paddle approval — money not returned yet. */
  pendingRefundCount: number;
  truncated: boolean;
}

/** A refund only takes money back once Paddle has approved it. */
function isSettledRefund(a: PaddleAdjustment): boolean {
  const action = (a.action ?? "").toLowerCase();
  const status = (a.status ?? "").toLowerCase();
  const takesMoney = action === "refund" || action === "chargeback";
  return takesMoney && status !== "rejected" && status !== "reversed" && status !== "pending_approval";
}

function totalsOf(t: PaddleTransaction): { totals: PaddleTotals; currency: string } {
  // payout_totals is expressed in the payout currency — the money that actually
  // reaches the balance — so prefer it when Paddle provides it.
  const totals = t.details?.payout_totals ?? t.details?.totals ?? {};
  const currency =
    totals.currency_code ?? t.details?.totals?.currency_code ?? t.currency_code ?? "USD";
  return { totals, currency };
}

/**
 * Pure aggregation over Paddle rows — kept separate from fetching so it can be
 * unit-tested against fixtures.
 */
export function summarizeRevenue(
  transactions: PaddleTransaction[],
  adjustments: PaddleAdjustment[],
  opts: { truncated?: boolean } = {},
): RevenueSummary {
  const byCurrency = new Map<string, CurrencyTotals>();
  const bucket = (currency: string): CurrencyTotals => {
    let b = byCurrency.get(currency);
    if (!b) {
      b = {
        currency,
        collected: 0,
        fees: 0,
        earnings: 0,
        refunded: 0,
        refundedEarnings: 0,
        net: 0,
        purchases: 0,
        refunds: 0,
      };
      byCurrency.set(currency, b);
    }
    return b;
  };

  // Refunds first, so each purchase row can show what was given back.
  const refundedByTransaction = new Map<string, number>();
  const refunds: RefundRow[] = [];
  let pendingRefundCount = 0;

  for (const a of adjustments) {
    const totals = a.payout_totals ?? a.totals ?? {};
    const currency = totals.currency_code ?? a.currency_code ?? "USD";
    const amount = minor(totals.total ?? totals.grand_total);
    const status = (a.status ?? "").toLowerCase();
    const action = (a.action ?? "adjustment").toLowerCase();
    const pending = status === "pending_approval";
    if (pending) pendingRefundCount += 1;

    refunds.push({
      id: a.id,
      date: a.created_at ?? null,
      action,
      status: a.status ?? "unknown",
      currency,
      amount,
      pending,
    });

    if (!isSettledRefund(a)) continue;
    const b = bucket(currency);
    b.refunded += amount;
    b.refundedEarnings += minor(totals.earnings) || amount;
    b.refunds += 1;
    if (a.transaction_id) {
      refundedByTransaction.set(
        a.transaction_id,
        (refundedByTransaction.get(a.transaction_id) ?? 0) + amount,
      );
    }
  }

  const purchases: PurchaseRow[] = [];
  for (const t of transactions) {
    const { totals, currency } = totalsOf(t);
    const collected = minor(totals.grand_total ?? totals.total);
    const fee = minor(totals.fee);
    const earnings = minor(totals.earnings);

    const b = bucket(currency);
    b.collected += collected;
    b.fees += fee;
    b.earnings += earnings;
    b.purchases += 1;

    const priceId = t.items?.find((i) => i?.price?.id)?.price?.id ?? null;
    const planId = planFromPaddlePriceId(priceId);
    const refundedAmount = refundedByTransaction.get(t.id) ?? 0;

    purchases.push({
      id: t.id,
      date: t.billed_at ?? t.created_at ?? null,
      email: t.customer?.email ?? null,
      planName: planId ? getPlan(planId).name : null,
      currency,
      collected,
      fee,
      earnings,
      refundedAmount,
      fullyRefunded: refundedAmount > 0 && refundedAmount >= collected,
    });
  }

  for (const b of byCurrency.values()) {
    b.net = b.earnings - b.refundedEarnings;
  }

  const order = (d: string | null) => (d ? Date.parse(d) : 0);
  purchases.sort((a, b) => order(b.date) - order(a.date));
  refunds.sort((a, b) => order(b.date) - order(a.date));

  return {
    totals: [...byCurrency.values()].sort((a, b) => b.collected - a.collected),
    purchases,
    refunds,
    pendingRefundCount,
    truncated: Boolean(opts.truncated),
  };
}

async function fetchAll<T>(path: string): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  let url: string | null = path;
  for (let page = 0; page < MAX_PAGES && url !== null; page++) {
    const page$: { data: T[]; next: string | null } = await paddleFetchPage<T>(url);
    rows.push(...page$.data);
    url = page$.next;
  }
  return { rows, truncated: url !== null };
}

/** Loads completed charges and adjustments from Paddle and summarizes them. */
export async function loadRevenueSummary(): Promise<RevenueSummary> {
  const [txns, adjs] = await Promise.all([
    fetchAll<PaddleTransaction>(
      `/transactions?status=completed&include=customer&per_page=${PAGE_SIZE}&order_by=billed_at[DESC]`,
    ),
    fetchAll<PaddleAdjustment>(`/adjustments?per_page=${PAGE_SIZE}`),
  ]);
  return summarizeRevenue(txns.rows, adjs.rows, {
    truncated: txns.truncated || adjs.truncated,
  });
}
