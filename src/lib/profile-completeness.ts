/**
 * Profile completeness scoring for food trucks.
 * Used in owner dashboard banner and to filter incomplete trucks from public listings.
 */

export interface CompletenessItem {
  key: string;
  label: string;
  points: number;
  completed: boolean;
  href: string; // Where to go to fix it
  priority: 'high' | 'medium' | 'low';
}

export interface CompletenessResult {
  score: number;       // 0–100
  items: CompletenessItem[];
  missing: CompletenessItem[];
  isPublishReady: boolean; // score >= 40
}

interface TruckLike {
  imageUrl?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  ctaPhoneNumber?: string | null;
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  tiktokHandle?: string | null;
  websiteUrl?: string | null;
  regularHours?: unknown | null;
  operatingHoursSummary?: string | null;
}

/**
 * Calculate profile completeness for a truck.
 * @param truck - Truck row data
 * @param menuItemCount - Number of menu items (pass 0 if unknown)
 */
export function getProfileCompleteness(
  truck: TruckLike,
  menuItemCount: number = 0
): CompletenessResult {
  const items: CompletenessItem[] = [
    {
      key: 'image',
      label: 'Add a cover photo',
      points: 25,
      completed: !!truck.imageUrl,
      href: '/owner/profile',
      priority: 'high',
    },
    {
      key: 'description',
      label: 'Write a description (50+ chars)',
      points: 15,
      completed: !!truck.description && truck.description.length >= 50,
      href: '/owner/profile',
      priority: 'high',
    },
    {
      key: 'address',
      label: 'Set your location',
      points: 20,
      completed: !!truck.address,
      href: '/owner/dashboard',
      priority: 'high',
    },
    {
      key: 'phone',
      label: 'Add a contact number',
      points: 10,
      completed: !!(truck.phone || truck.ctaPhoneNumber),
      href: '/owner/profile',
      priority: 'medium',
    },
    {
      key: 'menu',
      label: 'Add at least 1 menu item',
      points: 20,
      completed: menuItemCount > 0,
      href: '/owner/menu',
      priority: 'high',
    },
    {
      key: 'social',
      label: 'Link a social media account',
      points: 5,
      completed: !!(truck.instagramHandle || truck.facebookHandle || truck.tiktokHandle || truck.websiteUrl),
      href: '/owner/profile',
      priority: 'low',
    },
    {
      key: 'hours',
      label: 'Set operating hours',
      points: 5,
      completed: !!(truck.regularHours || truck.operatingHoursSummary),
      href: '/owner/schedule',
      priority: 'low',
    },
  ];

  const score = items
    .filter(i => i.completed)
    .reduce((sum, i) => sum + i.points, 0);

  const missing = items.filter(i => !i.completed);

  return {
    score,
    items,
    missing,
    isPublishReady: score >= 40,
  };
}

/**
 * Quick check: is this truck complete enough to show publicly?
 * Requires at minimum: image OR (description + address)
 */
export function isPublishReady(truck: TruckLike): boolean {
  if (truck.imageUrl) return true;
  if (truck.description && truck.description.length >= 30 && truck.address) return true;
  return false;
}
