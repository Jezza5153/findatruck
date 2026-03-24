import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SEARCH_STOP_WORDS = new Set([
  'adelaide',
  'and',
  'best',
  'find',
  'food',
  'for',
  'hire',
  'local',
  'me',
  'near',
  'nearby',
  'rent',
  'sa',
  'search',
  'south',
  'truck',
  'trucks',
  'van',
  'vans',
]);

const SEARCH_ALIASES: Record<string, string[]> = {
  bbq: ['barbecue', 'barbeque', 'smoked'],
  barbeque: ['bbq', 'barbecue'],
  barbecue: ['bbq', 'barbeque'],
  cafe: ['coffee'],
  coffee: ['cafe', 'espresso'],
  espresso: ['coffee', 'cafe'],
  gf: ['gluten free', 'gluten-free'],
  gluten: ['gf', 'gluten free', 'gluten-free'],
  veg: ['vegetarian', 'vego'],
  vegan: ['plant based', 'plant-based'],
  vegetarian: ['veg', 'vego', 'veggie'],
  vego: ['vegetarian', 'veg'],
  veggie: ['vegetarian', 'veg', 'vego'],
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getTokenVariants(token: string): string[] {
  const aliases = SEARCH_ALIASES[token] ?? [];

  return unique(
    [token, ...aliases]
      .map((value) => normalizeSearchText(value))
      .filter(Boolean)
  );
}

function getSearchTokens(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query);
  const rawTokens = normalizedQuery.split(' ').filter(Boolean);
  const filteredTokens = rawTokens.filter((token) => !SEARCH_STOP_WORDS.has(token));

  return unique(filteredTokens);
}

export function scoreSearchMatch(
  query: string,
  fields: Array<{ value?: string | null; weight: number }>
): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const normalizedFields = fields
    .map((field) => ({
      value: normalizeSearchText(field.value),
      weight: field.weight,
    }))
    .filter((field) => field.value);

  if (normalizedFields.length === 0) return -1;

  let score = -1;

  for (const field of normalizedFields) {
    if (field.value === normalizedQuery) {
      score = Math.max(score, 200 + field.weight * 20);
      continue;
    }

    if (field.value.startsWith(normalizedQuery)) {
      score = Math.max(score, 150 + field.weight * 18);
      continue;
    }

    if (field.value.includes(normalizedQuery)) {
      score = Math.max(score, 110 + field.weight * 14);
    }
  }

  const tokens = getSearchTokens(normalizedQuery);
  if (tokens.length === 0) return Math.max(score, 0);

  let tokenScore = 0;

  for (const token of tokens) {
    const variants = getTokenVariants(token);
    let bestWeight = 0;

    for (const field of normalizedFields) {
      if (variants.some((variant) => field.value.includes(variant))) {
        bestWeight = Math.max(bestWeight, field.weight);
      }
    }

    if (!bestWeight) {
      return score;
    }

    tokenScore += bestWeight * 12;
  }

  return Math.max(score, tokenScore);
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
