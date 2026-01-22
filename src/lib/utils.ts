import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Australian locale for all formatting
const AU_LOCALE = 'en-AU';

/**
 * Formats a price in Australian Dollars (AUD)
 * @param amount The amount in dollars
 * @param showCurrency Show "AUD" suffix (default: false, just shows $)
 * @returns Formatted price string like "$15.00" or "$15.00 AUD"
 */
export function formatPrice(amount: number, showCurrency = false): string {
  const formatted = new Intl.NumberFormat(AU_LOCALE, {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showCurrency ? `${formatted} AUD` : formatted;
}

/**
 * Formats a Firestore Timestamp or JavaScript Date into a readable string.
 * Uses Australian date format (DD/MM/YYYY).
 * @param timestamp Firestore Timestamp or JavaScript Date object.
 * @param options Intl.DateTimeFormatOptions to customize output.
 * @returns Formatted date string, or "Invalid Date" if input is problematic.
 */
export function formatDate(
  timestamp: { toDate: () => Date } | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!timestamp) {
    return 'Date not available';
  }
  try {
    const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(AU_LOCALE, options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error in date";
  }
}

/**
 * Formats a date in short Australian format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat(AU_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats a time in Australian format (12-hour with AM/PM)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Time';
  return new Intl.DateTimeFormat(AU_LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
