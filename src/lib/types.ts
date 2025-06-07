import type { Timestamp, FieldValue } from 'firebase/firestore';

// =======================
// UTILITY TYPES
// =======================

export type TruckLocation = {
  lat?: number;
  lng?: number;
  address?: string;
  updatedAt?: Timestamp | FieldValue;
  note?: string;
};

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

  regularHours?: {
    [day: string]: RegularHoursEntry;
  };
  specialHours?: Array<{
    date: string;
    status: 'open-custom' | 'closed';
    openTime?: string;
    closeTime?: string;
    note?: string;
  }>;
  isTruckOpenOverride?: boolean | null;

  rating?: number;
  numberOfRatings?: number;
  features?: string[];
  socialMediaLinks?: { [platform: string]: string };
  contactEmail?: string;
  phone?: string;
  isFeatured?: boolean;
  subscriptionTier?: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  distance?: string; // Calculated on frontend
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
  icon?: React.ElementType;
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
