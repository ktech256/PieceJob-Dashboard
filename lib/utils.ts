import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string, locale: string = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.length === 3 ? currency : "USD",
    }).format(amount);
  } catch (e) {
    // Fallback for non-standard currency codes/symbols
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDateTime(date: string | Date | undefined, timezone: string = "UTC", locale: string = "en-US") {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || "UTC",
    }).format(d);
  } catch (e) {
    console.error("Format error", e);
    return "Error";
  }
}
