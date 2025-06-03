
import type { Timestamp, FieldValue } from 'firebase/firestore';

export type FoodTruck = {
  id: string; // Firestore document ID
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  imagePath?: string; // Path in Firebase Storage for the image
  ownerUid: string;

  address?: string;
  lat?: number;
  lng?: number;

  operatingHoursSummary?: string; // e.g., "Mon-Fri: 10am-8pm, Sat: 12pm-6pm"
  isOpen?: boolean; // Calculated or manually set status

  // Detailed schedule (optional, if stored directly on truck doc)
  // For a more robust system, schedule might be in a subcollection or separate settings doc
  regularHours?: {
    [day: string]: { openTime: string; closeTime: string; isClosed: boolean }; // day: "Monday", "Tuesday", etc.
  };
  specialHours?: {
    date: string; // YYYY-MM-DD
    status: 'open-custom' | 'closed';
    openTime?: string; // HH:mm
    closeTime?: string; // HH:mm
  }[];
  isTruckOpenOverride?: boolean | null; // null for auto, true for force open, false for force closed

  // Menu might be fetched from a subcollection for scalability
  // menu?: MenuItem[]; 
  
  rating?: number; // Average rating
  numberOfRatings?: number;

  features?: string[]; // e.g., "Accepts Credit Cards", "Vegan Options", "Outdoor Seating"
  socialMediaLinks?: { [platform: string]: string }; // e.g., { instagram: "url", facebook: "url" }

  contactEmail?: string;
  phone?: string;

  isFeatured?: boolean;
  subscriptionTier?: string; // e.g., "free", "premium"

  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;

  // Client-side calculated, not stored in DB
  distance?: string; 
  testimonials?: Testimonial[]; // Could be a subcollection for many testimonials
};

export type MenuItem = {
  id: string; // Firestore document ID
  name: string;
  description?: string;
  price: number;
  category: string; // Category name (denormalized for easier filtering/display)
  imageUrl?: string;
  imagePath?: string; // Path in Firebase Storage for the item image
  isSpecial?: boolean;
  availability?: 'available' | 'sold_out' | 'unavailable';
  customizations?: CustomizationOption[];
  
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type MenuCategory = { // For managing categories themselves
  id: string; // Firestore document ID for the category document
  name: string;
  truckId: string; // To associate with a specific truck
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export type CustomizationOption = {
  id: string; // Unique ID for this customization section
  name: string; // e.g., "Choose your protein", "Add toppings"
  options: { 
    name: string; // e.g., "Chicken", "Beef", "Extra Cheese"
    additionalPrice?: number; // e.g., 0, 1.50
  }[];
  type: 'radio' | 'checkbox' | 'select'; // How the options are presented
  isRequired?: boolean;
};

export type Testimonial = {
  id: string; // Firestore document ID
  truckId: string; // Which truck this testimonial is for
  userId?: string; // ID of the user who wrote it (if logged in)
  name: string; // User's display name (can be anonymous if not logged in)
  quote: string;
  rating?: number; // 1-5 stars
  avatarUrl?: string; // User's avatar (if available)
  createdAt?: Timestamp | FieldValue;
  dataAiHint?: string; // For placeholder images
};

export type UserRole = 'customer' | 'owner';

// Represents the document structure in the 'users' collection in Firestore
export type UserDocument = {
  uid: string; // Corresponds to Firebase Auth UID
  email: string | null;
  role: UserRole;
  name?: string; // For customers: their display name. For owners: can be their name or primary contact name.
  
  // Owner-specific fields
  ownerName?: string; // Full name or business contact name for the owner
  truckName?: string; // Name of the food truck they own
  cuisineType?: string; // Primary cuisine type of their truck
  truckId?: string; // ID of the truck document in the 'trucks' collection associated with this owner

  // Customer-specific fields
  favoriteTrucks?: string[]; // Array of truck IDs
  notificationPreferences: NotificationPreferences;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

// Often used for client-side state, combining aspects of UserDocument
export type UserProfile = {
  name: string; // Display name
  email: string;
  role?: UserRole; // Helpful to have on profile state
  
  // Customer specific
  savedPaymentMethods?: string[]; // Placeholder for future payment integration
  favoriteTrucks?: string[];
  notificationPreferences: NotificationPreferences;

  // Owner specific (if applicable)
  truckName?: string;
  cuisineType?: string;
  truckId?: string;
};

export type NotificationPreferences = {
  truckNearbyRadius: number; // in miles or km
  orderUpdates: boolean; // e.g., order confirmed, ready for pickup
  promotionalMessages: boolean; // From FindATruck or favorited trucks
};

export type FilterOptions = {
  cuisine?: string[]; // Array of cuisine IDs/names
  distance?: number; // Max distance
  openNow?: boolean;
  searchTerm?: string;
  rating?: number; // Minimum rating
};

export type Cuisine = {
  id: string; // e.g., 'mexican', 'italian' (used as value in selects)
  name: string; // e.g., 'Mexican', 'Italian' (used for display)
  icon?: React.ElementType; // Optional: for displaying icons next to cuisine names
};

// Order related types (simple example)
export interface OrderItemDetail {
  itemId: string;
  name: string;
  quantity: number;
  price: number; // Price per item at time of order
  // Add customizations if needed: customizationChoices?: { optionName: string; choice: string; additionalPrice?: number }[]
}
export interface Order {
    id: string; // Firestore document ID
    truckId: string;
    customerId: string;
    customerName?: string; // Denormalized for display
    items: OrderItemDetail[];
    totalAmount: number;
    status: "New" | "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled";
    createdAt: Timestamp; 
    updatedAt?: Timestamp;
    notes?: string; // Customer notes for the order
    pickupTime?: Timestamp; // Estimated or scheduled pickup time
}
