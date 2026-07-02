/**
 * Currencies offered in the wizard, plus VERY rough USD conversion factors.
 *
 * The factors exist for one purpose only: the data-plausibility check
 * compares declared value-per-kg against category ceilings, and those
 * ceilings are calibrated in USD-magnitude terms. Without normalization, a
 * perfectly normal price in JPY (¥3,000 t-shirt) or IDR would look like a
 * 100–15,000x outlier. Order-of-magnitude accuracy is all that check needs,
 * so these are static placeholders — NOT exchange rates, never shown to the
 * user, and never used for duty math.
 */
export const CURRENCIES: string[] = [
  "USD", "EUR", "GBP", "TRY", "CNY", "JPY", "INR", "AUD", "CAD", "CHF",
  "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "AED", "SAR",
  "QAR", "ILS", "ZAR", "NGN", "EGP", "KES", "MAD", "BRL", "MXN", "ARS",
  "CLP", "COP", "PEN", "SGD", "HKD", "TWD", "KRW", "THB", "MYR", "IDR",
  "PHP", "VND", "PKR", "BDT", "LKR", "UAH", "KZT", "NZD",
];

export const APPROX_USD_RATE: Record<string, number> = {
  USD: 1, EUR: 1.1, GBP: 1.25, TRY: 0.03, CNY: 0.14, JPY: 0.007,
  INR: 0.012, AUD: 0.66, CAD: 0.73, CHF: 1.1, SEK: 0.095, NOK: 0.095,
  DKK: 0.15, PLN: 0.25, CZK: 0.044, HUF: 0.0027, RON: 0.22, BGN: 0.56,
  AED: 0.27, SAR: 0.27, QAR: 0.27, ILS: 0.27, ZAR: 0.055, NGN: 0.0007,
  EGP: 0.02, KES: 0.0077, MAD: 0.1, BRL: 0.18, MXN: 0.055, ARS: 0.001,
  CLP: 0.001, COP: 0.00025, PEN: 0.27, SGD: 0.74, HKD: 0.13, TWD: 0.031,
  KRW: 0.00075, THB: 0.028, MYR: 0.21, IDR: 0.000063, PHP: 0.017,
  VND: 0.00004, PKR: 0.0036, BDT: 0.0085, LKR: 0.0033, UAH: 0.025,
  KZT: 0.002, NZD: 0.61,
};

/** Convert an amount to rough USD magnitude; unknown currencies pass 1:1. */
export function approxUsd(amount: number, currency: string | null | undefined): number {
  const rate = currency ? APPROX_USD_RATE[currency.toUpperCase()] : undefined;
  return amount * (rate ?? 1);
}
