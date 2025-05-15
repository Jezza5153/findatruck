
export type FoodTruck = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  description: string;
  menu: MenuItem[];
  hours: string;
  location?: { lat: number; lng: number; address: string };
  isOpen?: boolean;
  distance?: string; // e.g. "0.5 miles"
  features?: string[]; // e.g. ["Real-time location", "Mobile ordering"]
  testimonials?: Testimonial[];
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  customizations?: CustomizationOption[];
};

export type CustomizationOption = {
  id: string;
  name: string;
  options: { name: string; additionalPrice?: number }[];
  type: 'radio' | 'checkbox' | 'select';
};

export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  avatarUrl?: string;
};

export type UserProfile = {
  name: string;
  email: string;
  savedPaymentMethods?: string[]; // Simplified
  favoriteTrucks?: string[]; // Array of truck IDs
  notificationPreferences: NotificationPreferences;
};

export type NotificationPreferences = {
  truckNearbyRadius: number; // in miles
  orderUpdates: boolean;
  promotionalMessages: boolean;
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
