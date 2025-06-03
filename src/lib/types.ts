// src/lib/types.ts

import type { Timestamp, FieldValue } from 'firebase/firestore';

export type FoodTruck = {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  ownerUid?: string;

  address?: string;
  lat?: number;
  lng?: number;

  operatingHoursSummary?: string;
  isOpen?: boolean;
  regularHours?: {
    [day: string]: { openTime: string; closeTime: string; isClosed: boolean };
  };
  specialHours?: {
    date: string;
    status: 'open-custom' | 'closed';
    openTime?: string;
    closeTime?: string;
  }[];

  menu?: MenuItem[]; // This might be deprecated if menu is always fetched from subcollection
  rating?: number;
  numberOfRatings?: number;

  features?: string[];
  socialMediaLinks?: { [platform: string]: string };

  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;

  isFeatured?: boolean;
  subscriptionTier?: string;

  distance?: string; // Calculated client-side
  testimonials?: Testimonial[];
};

export type MenuItem = {
  id: string; // Document ID from Firestore
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string; // Name of the category
  isSpecial?: boolean;
  availability?: 'available' | 'unavailable';
  customizations?: CustomizationOption[];
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type CustomizationOption = {
  id: string;
  name: string;
  options: { name: string; additionalPrice?: number }[];
  type: 'radio' | 'checkbox' | 'select';
};

export type Testimonial = {
  id: string;
  userId?: string;
  name: string; // User's display name
  quote: string;
  rating?: number;
  avatarUrl?: string; // User's avatar
  createdAt?: Timestamp | FieldValue;
  dataAiHint?: string;
};

export type UserRole = 'customer' | 'owner';

// Represents the document structure in the 'users' collection
export type UserDocument = {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string; // For customers, this is their display name. For owners, ownerName is preferred.
  ownerName?: string; // Specific for owners: their full name or business contact name
  truckName?: string; // Specific for owners: the name of their food truck
  cuisineType?: string; // Specific for owners: primary cuisine of their truck
  truckId?: string; // Specific for owners: ID of the truck document in the 'trucks' collection
  createdAt: Timestamp | FieldValue;
  favoriteTrucks?: string[]; // For customers
  notificationPreferences?: NotificationPreferences; // For customers
};

// Represents the profile data structure often used in client-side state for dashboards
export type UserProfile = {
  name: string; // Display name, could be UserDocument.name or UserDocument.ownerName
  email: string;
  // Customer specific fields
  savedPaymentMethods?: string[];
  favoriteTrucks?: string[];
  notificationPreferences: NotificationPreferences;
  // Owner specific fields
  truckName?: string;
  cuisineType?: string;
  truckId?: string;
};

export type NotificationPreferences = {
  truckNearbyRadius: number;
  orderUpdates: boolean;
  promotionalMessages: boolean;
};

export type FilterOptions = {
  cuisine: string[]; // Array of cuisine IDs/names
  distance: number[]; // Typically a single value array from a slider [maxDistance]
  openNow: boolean;
  searchTerm?: string;
};

export type Cuisine = {
  id: string; // e.g., 'mexican', 'italian'
  name: string; // e.g., 'Mexican', 'Italian'
  icon?: React.ElementType; // Optional: for displaying icons next to cuisine names
};
