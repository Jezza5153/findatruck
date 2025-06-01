// src/lib/types.ts

import type { Timestamp, FieldValue } from 'firebase/firestore';

export type FoodTruck = {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  ownerUid?: string;

  // Location: You can have address, lat, lng, or both.
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

  menu?: MenuItem[];
  rating?: number;
  numberOfRatings?: number;

  features?: string[];
  socialMediaLinks?: { [platform: string]: string };

  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;

  isFeatured?: boolean;
  subscriptionTier?: string;

  distance?: string;
  testimonials?: Testimonial[];
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  isSpecial?: boolean;
  availability?: 'available' | 'unavailable';
  customizations?: CustomizationOption[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
  name: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  createdAt?: Timestamp;
  dataAiHint?: string;
};

export type UserRole = 'customer' | 'owner';

export type UserDocument = {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
  createdAt: Timestamp | FieldValue;
  ownerName?: string;
  truckName?: string;
  cuisineType?: string;
  truckId?: string;
  favoriteTrucks?: string[];
  notificationPreferences?: NotificationPreferences;
};

export type NotificationPreferences = {
  truckNearbyRadius: number;
  orderUpdates: boolean;
  promotionalMessages: boolean;
};

export type UserProfile = {
  name: string;
  email: string;
  savedPaymentMethods: string[];
  favoriteTrucks: string[];
  notificationPreferences: NotificationPreferences;
};

export type FilterOptions = {
  cuisine: string[];
  distance: number[];
  openNow: boolean;
};

export type Cuisine = {
  id: string;
  name: string;
  icon?: React.ElementType;
};
