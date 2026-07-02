import { type ClassValue, clsx } from "clsx";
import { ALL_COUNTRIES, FREQUENT_LANES } from "@/lib/countries";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = "USD",
): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Launch-focus country map, kept for the wizard's "Frequent lanes" group. */
export const COUNTRIES: Record<string, string> = Object.fromEntries(
  FREQUENT_LANES.map((code) => [code, ALL_COUNTRIES[code]]),
);

export function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  return ALL_COUNTRIES[code.toUpperCase()] ?? code.toUpperCase();
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
