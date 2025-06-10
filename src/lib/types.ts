import type { Timestamp, FieldValue, GeoPoint } from 'firebase/firestore';
import type React from 'react';

// =======================
// LOCATION TYPES
// =======================
export type TruckLocation = {
  lat?: number;
  lng?: number;
  address?: string;
  updatedAt?: Timestamp | FieldValue;
  note?: string;
  coordinates?: GeoPoint; // Optional for native Firestore geospatial queries
};

// =======================
// HOURS TYPES
// =======================
export type TodaysHours = {
  open?: string;    // "09:00"
  close?: string;   // "17:00"
  note?: string;    // E.g. "Closed for private event"
};

export type RegularHoursEntry = {
  openTime: string;     // "09:00"
  closeTime: string;    // "17:00"
  isClosed: boolean;
};

// =======================
// FOOD TRUCK BASE TYPE
// =======================
export type FoodTruck = {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  imagePath?: string;
  imageGallery?: string[]; // New: support for image gallery
  ownerUid: string;

  address?: string;
  lat?: number;
  lng?: number;
  operatingHoursSummary?: string;   // e.g. "Mon-Fri 9-5"
  isOpen?: boolean;
  isVisible?: boolean;

  currentLocation?: TruckLocation;
  todaysMenu?: string[];            // menuItem IDs
  todaysHours?: TodaysHours;

  regularHours?: Record<string, RegularHoursEntry>;
  specialHours?: Array<{
    date: string;      // "YYYY-MM-DD"
    status: 'open-custom' | 'closed';
    openTime?: string;
    closeTime?: string;
    note?: string;
  }>;
  isTruckOpenOverride?: boolean | null;

  tags?: string[]; // e.g. ["vegan", "pet-friendly"]
  rating?: number;              // 1.0 - 5.0 (average)
  numberOfRatings?: number;     // # of ratings
  features?: string[];
  socialMediaLinks?: Record<string, string>; // e.g. { instagram: url, facebook: url }
  websiteUrl?: string; // External website if any
  contactEmail?: string;
  phone?: string;
  isFeatured?: boolean;
  subscriptionTier?: 'free' | 'plus' | 'pro' | 'enterprise' | string;
  isFavorite?: boolean; // For logged-in user context, computed
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  distance?: string;   // Calculated on frontend, e.g., "1.2km"
  testimonials?: Testimonial[];
};

// =======================
// MENU & CATEGORY TYPES
// =======================
export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  imagePath?: string;
  isSpecial?: boolean;
  availability?: 'available' | 'sold_out' | 'unavailable';
  customizations?: CustomizationOption[];
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type MenuCategory = {
  id: string;
  name: string;
  truckId: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type CustomizationOption = {
  id: string;
  name: string;
  options: { name: string; additionalPrice?: number }[];
  type: 'radio' | 'checkbox' | 'select';
  isRequired?: boolean;
};

// =======================
// TESTIMONIALS
// =======================
export type Testimonial = {
  id: string;
  truckId: string;
  userId?: string;
  name: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  createdAt?: Timestamp | FieldValue;
  dataAiHint?: string;
};

// =======================
// USER TYPES
// =======================
export type UserRole = 'customer' | 'owner';

export type NotificationPreferences = {
  truckNearbyRadius: number;
  orderUpdates: boolean;
  promotionalMessages: boolean;
};

export type UserDocument = {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  ownerName?: string;
  truckName?: string;
  cuisineType?: string;
  truckId?: string;
  favoriteTrucks?: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type UserProfile = {
  name: string;
  email: string;
  role?: UserRole;
  savedPaymentMethods?: string[];
  favoriteTrucks?: string[];
  notificationPreferences: NotificationPreferences;
  truckName?: string;
  cuisineType?: string;
  truckId?: string;
};

// =======================
// FILTERS & CUISINES
// =======================
export type FilterOptions = {
  cuisine?: string[];
  distance?: number;
  openNow?: boolean;
  searchTerm?: string;
  rating?: number;
};

export type Cuisine = {
  id: string;
  name: string;
  icon?: React.ElementType<any>;
};

// =======================
// ORDER TYPES
// =======================
export interface OrderItemDetail {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  truckId: string;
  customerId: string;
  customerName?: string;
  items: OrderItemDetail[];
  totalAmount: number;
  status: "New" | "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  notes?: string;
  pickupTime?: Timestamp;
}

// =======================
// TRUCK WITH MENU (for Map)
// =======================
export type TruckWithMenu = FoodTruck & {
  todaysMenuItems: MenuItem[];
  isHere: boolean;
};
