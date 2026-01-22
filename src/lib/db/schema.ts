import { pgTable, text, timestamp, boolean, real, integer, jsonb, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =====================
// AUTH TABLES (NextAuth compatible)
// =====================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'), // For credentials auth
  role: text('role', { enum: ['customer', 'owner', 'admin'] }).notNull().default('customer'),

  // Owner-specific fields
  truckId: uuid('truck_id'),

  // Customer-specific fields
  favoriteTrucks: text('favorite_trucks').array().default([]),
  cuisinePreferences: text('cuisine_preferences').array().default([]),
  dietaryTags: text('dietary_tags').array().default([]),
  notificationRadius: real('notification_radius').default(5),

  // Notification preferences
  notificationPreferences: jsonb('notification_preferences').$type<{
    truckNearbyRadius: number;
    orderUpdates: boolean;
    promotionalMessages: boolean;
  }>().default({
    truckNearbyRadius: 5,
    orderUpdates: true,
    promotionalMessages: true,
  }),

  // Stripe integration
  stripeCustomerId: text('stripe_customer_id'),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// =====================
// FOOD TRUCK TABLES
// =====================

export const trucks = pgTable('trucks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUid: uuid('owner_uid').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cuisine: text('cuisine').notNull(),
  description: text('description'),

  // Images
  imageUrl: text('image_url'),
  imagePath: text('image_path'),
  imageGallery: text('image_gallery').array().default([]),

  // Location
  address: text('address'),
  lat: real('lat'),
  lng: real('lng'),

  // Current location (can be different from address)
  currentLocation: jsonb('current_location').$type<{
    lat?: number;
    lng?: number;
    address?: string;
    updatedAt?: string;
    note?: string;
  }>(),

  // Hours
  operatingHoursSummary: text('operating_hours_summary'),
  regularHours: jsonb('regular_hours').$type<Record<string, {
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>>(),
  specialHours: jsonb('special_hours').$type<Array<{
    date: string;
    status: 'open-custom' | 'closed';
    openTime?: string;
    closeTime?: string;
    note?: string;
  }>>(),

  // Status
  isOpen: boolean('is_open').default(false),
  isVisible: boolean('is_visible').default(true),
  isTruckOpenOverride: boolean('is_truck_open_override'),

  // Features & metadata
  tags: text('tags').array().default([]),
  rating: real('rating').default(0),
  numberOfRatings: integer('number_of_ratings').default(0),
  features: text('features').array().default([]),
  socialMediaLinks: jsonb('social_media_links').$type<Record<string, string>>(),
  websiteUrl: text('website_url'),
  contactEmail: text('contact_email'),
  phone: text('phone'),
  ctaPhoneNumber: text('cta_phone_number'), // Prominent CTA phone for customers
  facebookHandle: text('facebook_handle'),
  instagramHandle: text('instagram_handle'),
  tiktokHandle: text('tiktok_handle'),

  // Subscription
  isFeatured: boolean('is_featured').default(false),
  subscriptionTier: text('subscription_tier', {
    enum: ['free', 'plus', 'pro', 'enterprise']
  }).default('free'),

  // Verification (admin-controlled)
  isVerified: boolean('is_verified').default(false),
  verificationNote: text('verification_note'),

  // Today's menu (array of menu item IDs)
  todaysMenu: text('todays_menu').array().default([]),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// MENU TABLES
// =====================

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),

  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category'), // Denormalized category name

  imageUrl: text('image_url'),
  imagePath: text('image_path'),

  isSpecial: boolean('is_special').default(false),
  availability: text('availability', {
    enum: ['available', 'sold_out', 'unavailable']
  }).default('available'),
  outOfStock: boolean('out_of_stock').default(false),

  tags: text('tags').array().default([]),
  order: integer('order').default(0),

  customizations: jsonb('customizations').$type<Array<{
    id: string;
    name: string;
    options: Array<{ name: string; additionalPrice?: number }>;
    type: 'radio' | 'checkbox' | 'select';
    isRequired?: boolean;
  }>>(),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// ORDER TABLES
// =====================

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerName: text('customer_name'),

  items: jsonb('items').notNull().$type<Array<{
    itemId: string;
    name: string;
    quantity: number;
    price: number;
  }>>(),

  totalAmount: real('total_amount').notNull(),
  status: text('status', {
    enum: ['New', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled']
  }).notNull().default('New'),

  notes: text('notes'),
  pickupTime: timestamp('pickup_time', { mode: 'date' }),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// TESTIMONIALS
// =====================

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

  name: text('name').notNull(),
  quote: text('quote').notNull(),
  rating: real('rating'),
  avatarUrl: text('avatar_url'),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SUBSCRIPTIONS
// =====================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),

  // Stripe identifiers
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),

  // Status
  status: text('status', {
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired']
  }).notNull().default('incomplete'),

  // Billing period
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// CHECK-INS (Loyalty System)
// =====================

export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// SPECIALS (Time-bound Promos)
// =====================

export const specials = pgTable('specials', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  discountPercent: real('discount_percent'),
  startTime: timestamp('start_time', { mode: 'date' }),
  endTime: timestamp('end_time', { mode: 'date' }),
  isActive: boolean('is_active').default(true),
  geoTargetLat: real('geo_target_lat'),
  geoTargetLng: real('geo_target_lng'),
  geoTargetRadius: real('geo_target_radius'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// EVENTS / SCHEDULE
// =====================

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  title: text('title'),
  location: text('location'),
  lat: real('lat'),
  lng: real('lng'),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }),
  isRecurring: boolean('is_recurring').default(false),
  recurringPattern: text('recurring_pattern'), // e.g., 'weekly:mon,wed,fri'
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// REVIEWS (with moderation)
// =====================

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: real('rating').notNull(),
  text: text('text'),
  ownerReply: text('owner_reply'),
  ownerRepliedAt: timestamp('owner_replied_at', { mode: 'date' }),
  moderationState: text('moderation_state', {
    enum: ['pending', 'approved', 'hidden', 'flagged']
  }).default('approved'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// NOTIFICATIONS
// =====================

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['truck_nearby', 'favorite_live', 'special', 'reward_unlocked', 'order_update']
  }).notNull(),
  title: text('title').notNull(),
  message: text('message'),
  truckId: uuid('truck_id').references(() => trucks.id, { onDelete: 'set null' }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// LOYALTY CARDS (Stamps per user per truck)
// =====================

export const loyaltyCards = pgTable('loyalty_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  stamps: integer('stamps').default(0),
  stampsRequired: integer('stamps_required').default(10),
  rewardsEarned: integer('rewards_earned').default(0),
  rewardsRedeemed: integer('rewards_redeemed').default(0),
  lastCheckIn: timestamp('last_check_in', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// TRUCK MEMBERS (Multi-user per truck)
// =====================

/**
 * Allows multiple users to manage a single truck
 * - owner: Full access, can invite others
 * - manager: Can edit truck, menu, handle orders
 * - staff: Can update status, view orders
 */
export const truckMembers = pgTable('truck_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'manager', 'staff'] }).notNull().default('staff'),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// =====================
// RELATIONS
// =====================

export const usersRelations = relations(users, ({ one, many }) => ({
  truck: one(trucks, {
    fields: [users.truckId],
    references: [trucks.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  orders: many(orders),
  checkIns: many(checkIns),
  reviews: many(reviews),
  notifications: many(notifications),
  loyaltyCards: many(loyaltyCards),
  truckMemberships: many(truckMembers),
}));

export const trucksRelations = relations(trucks, ({ one, many }) => ({
  owner: one(users, {
    fields: [trucks.ownerUid],
    references: [users.id],
  }),
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  orders: many(orders),
  testimonials: many(testimonials),
  checkIns: many(checkIns),
  specials: many(specials),
  events: many(events),
  reviews: many(reviews),
  loyaltyCards: many(loyaltyCards),
  members: many(truckMembers),
}));

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  truck: one(trucks, {
    fields: [menuCategories.truckId],
    references: [trucks.id],
  }),
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  truck: one(trucks, {
    fields: [menuItems.truckId],
    references: [trucks.id],
  }),
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  truck: one(trucks, {
    fields: [orders.truckId],
    references: [trucks.id],
  }),
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  truck: one(trucks, {
    fields: [testimonials.truckId],
    references: [trucks.id],
  }),
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
  truck: one(trucks, {
    fields: [checkIns.truckId],
    references: [trucks.id],
  }),
}));

export const specialsRelations = relations(specials, ({ one }) => ({
  truck: one(trucks, {
    fields: [specials.truckId],
    references: [trucks.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  truck: one(trucks, {
    fields: [events.truckId],
    references: [trucks.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  truck: one(trucks, {
    fields: [reviews.truckId],
    references: [trucks.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  truck: one(trucks, {
    fields: [notifications.truckId],
    references: [trucks.id],
  }),
}));

export const loyaltyCardsRelations = relations(loyaltyCards, ({ one }) => ({
  user: one(users, {
    fields: [loyaltyCards.userId],
    references: [users.id],
  }),
  truck: one(trucks, {
    fields: [loyaltyCards.truckId],
    references: [trucks.id],
  }),
}));

export const truckMembersRelations = relations(truckMembers, ({ one }) => ({
  truck: one(trucks, {
    fields: [truckMembers.truckId],
    references: [trucks.id],
  }),
  user: one(users, {
    fields: [truckMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [truckMembers.invitedBy],
    references: [users.id],
  }),
}));

// =====================
// TYPE EXPORTS
// =====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Truck = typeof trucks.$inferSelect;
export type NewTruck = typeof trucks.$inferInsert;

export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;

export type Special = typeof specials.$inferSelect;
export type NewSpecial = typeof specials.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type NewLoyaltyCard = typeof loyaltyCards.$inferInsert;

export type TruckMember = typeof truckMembers.$inferSelect;
export type NewTruckMember = typeof truckMembers.$inferInsert;

export type TruckMemberRole = 'owner' | 'manager' | 'staff';

// =====================
// IDEMPOTENCY TABLES (Scale-safe dedupe)
// =====================

/**
 * Stripe webhook idempotency with lease pattern
 * - processing_started_at: for staleness check
 * - lease_id: for CAS (compare-and-swap) to prevent stampede
 * - attempt_count: for alerting on stuck events
 * - last_error: for debugging
 */
export const stripeEvents = pgTable('stripe_events', {
  eventId: text('event_id').primaryKey(), // Stripe event.id
  eventType: text('event_type').notNull(),
  status: text('status', { enum: ['processing', 'success', 'failed'] }).notNull().default('processing'),

  // Lease fields for safe concurrent retry
  processingStartedAt: timestamp('processing_started_at', { mode: 'date' }).notNull().defaultNow(),
  leaseId: text('lease_id'),  // UUID of the instance holding the lease

  // Terminal state fields
  processedAt: timestamp('processed_at', { mode: 'date' }),  // Only set on success/failed

  // Retry tracking
  attemptCount: integer('attempt_count').notNull().default(1),
  lastError: text('last_error'),
});

/**
 * Check-in idempotency - prevents double stamps under concurrency
 * Uses (userId, truckId, windowBucket) to enforce cooldown at DB level
 */
export const checkInKeys = pgTable('check_in_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  truckId: uuid('truck_id').notNull().references(() => trucks.id, { onDelete: 'cascade' }),
  windowBucket: text('window_bucket').notNull(), // e.g., "2026-01-19-00" (4-hour buckets)
  checkInId: uuid('check_in_id').references(() => checkIns.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// Note: Add this unique constraint via migration:
// CREATE UNIQUE INDEX check_in_keys_dedupe ON check_in_keys(user_id, truck_id, window_bucket);

// =====================
// AUDIT LOG TABLE (Governance)
// =====================

/**
 * Admin audit log - tracks all admin actions
 * Required for governance and security compliance
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Who performed the action
  actorUserId: uuid('actor_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorRole: text('actor_role', { enum: ['customer', 'owner', 'admin'] }).notNull(),

  // What was done
  action: text('action').notNull(), // e.g., 'verify_truck', 'update_user_role', 'delete_review'

  // Target of the action
  targetType: text('target_type').notNull(), // e.g., 'truck', 'user', 'review'
  targetId: text('target_id').notNull(),

  // Snapshot of changes
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),

  // Request context
  requestId: text('request_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export type StripeEvent = typeof stripeEvents.$inferSelect;
export type NewStripeEvent = typeof stripeEvents.$inferInsert;

export type CheckInKey = typeof checkInKeys.$inferSelect;
export type NewCheckInKey = typeof checkInKeys.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
