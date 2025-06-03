import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Firestore Timestamp or JavaScript Date into a more readable string.
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
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error in date";
  }
}
