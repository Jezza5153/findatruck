// ====================================
// SHARED TYPES FOR FINDATRUCK
// Re-exported from database schema where applicable
// ====================================

import type React from 'react';

// Re-export database model types
export type {
  User,
  NewUser,
  Truck,
  NewTruck,
  MenuItem,
  NewMenuItem,
  MenuCategory,
  NewMenuCategory,
  Order,
  NewOrder,
  Testimonial,
  NewTestimonial,
  Subscription,
  NewSubscription,
  CheckIn,
  NewCheckIn,
  Special,
  NewSpecial,
  Event,
  NewEvent,
  Review,
  NewReview,
  Notification,
  NewNotification,
  LoyaltyCard,
  NewLoyaltyCard,
} from './db/schema';

// =======================
// LEGACY TYPE ALIASES
// (For backward compatibility during migration)
// =======================

// FoodTruck is an alias for Truck
export type { Truck as FoodTruck } from './db/schema';

// Extended FoodTruck with computed display properties
import type { Truck } from './db/schema';
export type FoodTruckDisplay = Truck & {
  isFavorite?: boolean;
  distance?: string;
};

// UserDocument is an alias for User
export type { User as UserDocument } from './db/schema';

// =======================
// LOCATION TYPES
// =======================
export type TruckLocation = {
  lat?: number;
  lng?: number;
  address?: string;
  updatedAt?: string | null;
  note?: string;
  coordinates?: { latitude: number; longitude: number };
};

// =======================
// HOURS TYPES
// =======================
export type TodaysHours = {
  open?: string;
  close?: string;
  note?: string;
};

export type RegularHoursEntry = {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

// =======================
// CUSTOMIZATION OPTIONS
// =======================
export type CustomizationOption = {
  id: string;
  name: string;
  options: { name: string; additionalPrice?: number }[];
  type: 'radio' | 'checkbox' | 'select';
  isRequired?: boolean;
};

// =======================
// USER TYPES
// =======================
export type UserRole = 'customer' | 'owner' | 'admin';

export type NotificationPreferences = {
  truckNearbyRadius: number;
  orderUpdates: boolean;
  promotionalMessages: boolean;
};

export type UserProfile = {
  name: string;
  email: string;
  avatarUrl: string;
  savedPaymentMethods: string[];
  favoriteTrucks: string[];
  notificationPreferences: NotificationPreferences;
  role?: UserRole;
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
// ORDER TYPES (for API responses)
// =======================
export interface OrderItemDetail {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'New' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

// =======================
// TRUCK WITH MENU (for Map)
// =======================
export type TruckWithMenu = {
  id: string;
  name: string;
  cuisine: string;
  description?: string | null;
  imageUrl?: string | null;
  ownerUid: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  isOpen?: boolean | null;
  isVisible?: boolean | null;
  rating?: number | null;
  isFeatured?: boolean | null;
  tags?: string[] | null;
  features?: string[] | null;
  phone?: string | null;
  websiteUrl?: string | null;
  // Extended fields
  todaysMenuItems: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
  }>;
  isHere: boolean;
  distance?: string;
};

// =======================
// API RESPONSE TYPES
// =======================
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

// =======================
// SESSION TYPES (NextAuth)
// =======================
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      truckId?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    truckId?: string | null;
  }

  interface JWT {
    id: string;
    role: UserRole;
    truckId?: string | null;
  }
}
