
import type { Timestamp, FieldValue } from 'firebase/firestore';

export type FoodTruck = {
  id: string; // Corresponds to Document ID in Firestore trucks collection
  ownerUid: string; // UID of the owner from Firebase Auth
  name: string;
  cuisine: string;
  description: string;
  imageUrl?: string;
  phoneNumber?: string;
  operatingHoursSummary?: string; // e.g., "Mon-Fri 11AM-7PM"
  
  // Location - can be a GeoPoint in Firestore
  location?: { lat: number; lng: number; address?: string; geohash?: string }; 
  
  // Live Status & Hours - Can be part of the main truck doc or a subcollection
  isOpen?: boolean; 
  regularHours?: {
    [day: string]: { openTime: string; closeTime: string; isClosed: boolean }; // "Monday", "Tuesday", etc.
  };
  specialHours?: {
    date: string; // YYYY-MM-DD
    status: 'open-custom' | 'closed';
    openTime?: string;
    closeTime?: string;
  }[];

  // Menu - likely a subcollection in Firestore for scalability
  menu?: MenuItem[]; // For simplicity, we might start with it embedded if small

  // Rating - could be an aggregation
  rating?: number;
  numberOfRatings?: number;

  // Features for filtering or display
  features?: string[]; 
  socialMediaLinks?: { [platform: string]: string }; // e.g., { instagram: "url", facebook: "url" }

  // Timestamps
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue; // Updated this line

  // For premium features
  isFeatured?: boolean;
  subscriptionTier?: string; // e.g., 'free', 'premium'
  
  // UI specific, not necessarily in DB
  distance?: string; 
  testimonials?: Testimonial[]; // Could be a subcollection
};

export type MenuItem = {
  id: string; // Document ID in a menu subcollection
  // truckId: string; // Foreign key to the truck - Menus will be a subcollection of a truck
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string; // e.g., "Appetizers", "Main Courses", "Desserts"
  isSpecial?: boolean;
  availability?: 'available' | 'unavailable';
  customizations?: CustomizationOption[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type CustomizationOption = {
  id: string;
  name: string; // e.g., "Size", "Toppings"
  options: { name: string; additionalPrice?: number }[];
  type: 'radio' | 'checkbox' | 'select'; // How the options are presented
};

export type Testimonial = {
  id: string;
  // truckId: string; // Testimonials will be a subcollection of a truck
  userId?: string; // Optional if testimonials can be anonymous or sourced differently
  name: string;
  quote: string;
  rating?: number; // 1-5 stars, optional
  avatarUrl?: string;
  createdAt?: Timestamp;
  dataAiHint?: string;
};

export type UserRole = 'customer' | 'owner';

export type UserDocument = {
  uid: string; // Firebase Auth UID
  email: string | null;
  role: UserRole;
  name?: string; // For customers or owner's personal name
  createdAt: Timestamp | FieldValue;
  // Owner-specific fields if role is 'owner'
  ownerName?: string; 
  truckName?: string; 
  cuisineType?: string;
  truckId?: string; // ID of the truck document in 'trucks' collection for this owner
  // Customer-specific fields if role is 'customer'
  favoriteTrucks?: string[]; // Array of truck IDs
  notificationPreferences?: NotificationPreferences;
};

export type NotificationPreferences = {
  truckNearbyRadius: number; // in miles
  orderUpdates: boolean;
  promotionalMessages: boolean;
};

// Define UserProfile based on its usage in dashboard/page.tsx
export type UserProfile = {
  name: string;
  email: string;
  savedPaymentMethods: string[]; // Assuming array of strings (e.g., "Visa ending in 1234")
  favoriteTrucks: string[]; // Array of truck IDs
  notificationPreferences: NotificationPreferences;
};


export type FilterOptions = {
  cuisine: string[];
  distance: number[]; // e.g. [0, 1, 5, 10] miles
  openNow: boolean;
};

export type Cuisine = {
  id: string;
  name: string;
  icon?: React.ElementType; // For Lucide icons
};
