
import type { Timestamp, FieldValue, GeoPoint } from 'firebase/firestore';
import type React from 'react';

// =======================
// LOCATION TYPES
// =======================
export type TruckLocation = {
  lat?: number;
  lng?: number;
  address?: string;
  updatedAt?: string | null; // Changed from Timestamp | FieldValue
  note?: string;
  coordinates?: { latitude: number; longitude: number }; // Changed from GeoPoint
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
// FOOD TRUCK BASE TYPE
// =======================
export type FoodTruck = {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  imagePath?: string;
  imageGallery?: string[];
  ownerUid: string;

  address?: string;
  lat?: number;
  lng?: number;
  operatingHoursSummary?: string;
  isOpen?: boolean;
  isVisible?: boolean;

  currentLocation?: TruckLocation;
  todaysMenu?: string[];
  todaysHours?: TodaysHours;

  regularHours?: Record<string, RegularHoursEntry>;
  specialHours?: Array<{
    date: string; // YYYY-MM-DD
    status: 'open-custom' | 'closed';
    openTime?: string; // HH:mm
    closeTime?: string; // HH:mm
    note?: string;
  }>;
  isTruckOpenOverride?: boolean | null;

  tags?: string[];
  rating?: number;
  numberOfRatings?: number;
  features?: string[];
  socialMediaLinks?: Record<string, string>;
  websiteUrl?: string;
  contactEmail?: string;
  phone?: string;
  isFeatured?: boolean;
  subscriptionTier?: 'free' | 'plus' | 'pro' | 'enterprise' | string;
  isFavorite?: boolean;
  createdAt?: string | null; // Changed
  updatedAt?: string | null; // Changed
  distance?: string;
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
  createdAt?: string | null; // Changed
  updatedAt?: string | null; // Changed
  order?: number; // Added from menu page
  outOfStock?: boolean; // Added from menu page
  tags?: string[]; // Added from menu page
};

export type MenuCategory = {
  id: string;
  name: string;
  truckId: string; // Added for potential direct queries, though often subcollection
  createdAt?: string | null; // Changed
  updatedAt?: string | null; // Changed
  order?: number; // Added from menu page
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
  truckId?: string; // Optional if subcollection
  userId?: string;
  name: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  createdAt?: string | null; // Changed
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
  ownerName?: string; // If role is owner
  truckName?: string; // Denormalized for owner users
  cuisineType?: string; // Denormalized for owner users
  truckId?: string; // Link to their truck if role is owner
  favoriteTrucks?: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: string | null; // Changed
  updatedAt?: string | null; // Changed
  // Potentially add more customer specific fields
  // Potentially add more owner specific fields
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
  createdAt: string | null; // Changed
  updatedAt?: string | null; // Changed
  notes?: string;
  pickupTime?: string | null; // Changed
}

// =======================
// TRUCK WITH MENU (for Map)
// =======================
export type TruckWithMenu = FoodTruck & {
  todaysMenuItems: MenuItem[];
  isHere: boolean; // Example, if derived dynamically
};
