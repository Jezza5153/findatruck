/**
 * Centralized validation schemas for all API routes
 * Uses Zod with strict mode to reject extra keys (mass assignment protection)
 */

import { z } from 'zod';

// =====================
// COMMON VALIDATORS
// =====================

// UUID validator
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Coordinate validators with bounds
export const latitudeSchema = z.number()
    .min(-90, 'Latitude must be >= -90')
    .max(90, 'Latitude must be <= 90');

export const longitudeSchema = z.number()
    .min(-180, 'Longitude must be >= -180')
    .max(180, 'Longitude must be <= 180');

// String with max length
export const shortStringSchema = z.string().max(100, 'Max 100 characters');
export const mediumStringSchema = z.string().max(500, 'Max 500 characters');
export const longStringSchema = z.string().max(2000, 'Max 2000 characters');

// URL validator
export const urlSchema = z.string().url('Invalid URL').max(500).optional().nullable();

// Phone validator
export const phoneSchema = z.string()
    .max(20)
    .regex(/^[+]?[\d\s\-().]+$/, 'Invalid phone format')
    .optional()
    .nullable();

// Price validator
export const priceSchema = z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price too high');

// Pagination
export const paginationSchema = z.object({
    limit: z.number().int().min(1).max(50).default(20),
    offset: z.number().int().min(0).default(0),
    cursor: z.string().optional(),
}).strict();

// =====================
// AUTH SCHEMAS
// =====================

export const registerSchema = z.object({
    email: z.string().email('Invalid email').max(255),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    name: shortStringSchema.min(1, 'Name is required'),
    role: z.enum(['customer', 'owner']),
    truckName: shortStringSchema.optional(),
    cuisineType: shortStringSchema.optional(),
    description: mediumStringSchema.optional(),
    phone: phoneSchema,
}).strict();

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
}).strict();

// =====================
// TRUCK SCHEMAS
// =====================

export const createTruckSchema = z.object({
    name: shortStringSchema.min(1, 'Name is required'),
    cuisine: shortStringSchema.min(1, 'Cuisine is required'),
    description: longStringSchema.optional().nullable(),
    address: mediumStringSchema.optional().nullable(),
    lat: latitudeSchema.optional().nullable(),
    lng: longitudeSchema.optional().nullable(),
    imageUrl: urlSchema,
    phone: phoneSchema,
    websiteUrl: urlSchema,
    contactEmail: z.string().email().max(255).optional().nullable(),
    tags: z.array(shortStringSchema).max(20).optional(),
    features: z.array(shortStringSchema).max(20).optional(),
}).strict();

export const updateTruckSchema = z.object({
    name: shortStringSchema.optional(),
    cuisine: shortStringSchema.optional(),
    description: longStringSchema.optional().nullable(),
    address: mediumStringSchema.optional().nullable(),
    lat: latitudeSchema.optional().nullable(),
    lng: longitudeSchema.optional().nullable(),
    imageUrl: urlSchema,
    phone: phoneSchema,
    websiteUrl: urlSchema,
    isOpen: z.boolean().optional(),
    tags: z.array(shortStringSchema).max(20).optional(),
    features: z.array(shortStringSchema).max(20).optional(),
}).strict();

// =====================
// SPECIAL SCHEMAS
// =====================

export const createSpecialSchema = z.object({
    title: shortStringSchema.min(1, 'Title is required'),
    description: mediumStringSchema.optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    startTime: z.string().datetime().optional().nullable(),
    endTime: z.string().datetime().optional().nullable(),
}).strict();

export const updateSpecialSchema = z.object({
    title: shortStringSchema.optional(),
    description: mediumStringSchema.optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    startTime: z.string().datetime().optional().nullable(),
    endTime: z.string().datetime().optional().nullable(),
    isActive: z.boolean().optional(),
}).strict();

// =====================
// CHECK-IN SCHEMA
// =====================

export const checkInSchema = z.object({
    truckId: uuidSchema,
    lat: latitudeSchema,
    lng: longitudeSchema,
    // Idempotency key for retry safety
    idempotencyKey: z.string().max(100).optional(),
}).strict();

// =====================
// MENU SCHEMAS
// =====================

export const createMenuItemSchema = z.object({
    type: z.enum(['item', 'category']).optional(),
    name: shortStringSchema.min(1),
    categoryId: uuidSchema.optional(),
    description: mediumStringSchema.optional().nullable(),
    price: priceSchema.optional(),
    category: shortStringSchema.optional(),
    imageUrl: urlSchema,
    isSpecial: z.boolean().optional(),
    availability: z.enum(['available', 'limited', 'sold_out']).optional(),
    tags: z.array(shortStringSchema).max(10).optional(),
    order: z.number().int().min(0).max(1000).optional(),
}).strict();

// =====================
// ADMIN SCHEMAS
// =====================

export const adminUpdateTruckSchema = z.object({
    isVerified: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    verificationNote: mediumStringSchema.optional(),
}).strict();

export const adminUpdateUserSchema = z.object({
    role: z.enum(['customer', 'owner', 'admin']),
}).strict();

export const adminUpdateReviewSchema = z.object({
    moderationState: z.enum(['pending', 'approved', 'rejected', 'flagged']),
}).strict();

// =====================
// HELPER: VALIDATE OR THROW
// =====================

export type ValidationError = {
    field: string;
    message: string;
};

export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
    }));

    return { success: false, errors };
}

/**
 * Create a 400 response for validation errors
 */
export function validationErrorResponse(errors: ValidationError[]) {
    return {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
    };
}
