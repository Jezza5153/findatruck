import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates required env vars at build/runtime
 */
const envSchema = z.object({
    // Database (required)
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Auth (required)
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),

    // Cloudflare R2 Storage (optional - upload features disabled without)
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().default('findatruck'),

    // Stripe (optional - billing disabled without)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // Google Maps (optional - map features disabled without)
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

    // App URL
    NEXTAUTH_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed env object
 * Call this early in app initialization
 */
export function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:');
        parsed.error.issues.forEach(issue => {
            console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
        throw new Error('Invalid environment configuration');
    }

    return parsed.data;
}

/**
 * Check if a feature is enabled based on env vars
 */
export const featureFlags = {
    get storageEnabled() {
        return !!(
            process.env.R2_ACCOUNT_ID &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY
        );
    },

    get stripeEnabled() {
        return !!(
            process.env.STRIPE_SECRET_KEY &&
            process.env.STRIPE_PRICE_ID
        );
    },

    get mapsEnabled() {
        return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    },

    get isProduction() {
        return process.env.NODE_ENV === 'production';
    },
};

/**
 * Get environment summary for debugging (safe - no secrets)
 */
export function getEnvSummary(): Record<string, boolean | string> {
    return {
        database: !!process.env.DATABASE_URL,
        auth: !!process.env.AUTH_SECRET,
        storage: featureFlags.storageEnabled,
        stripe: featureFlags.stripeEnabled,
        maps: featureFlags.mapsEnabled,
        nodeEnv: process.env.NODE_ENV || 'development',
    };
}
