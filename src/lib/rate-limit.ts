/**
 * Distributed rate limiting using Redis (Vercel KV or Upstash)
 * 
 * TWO-TIER POLICY:
 * - HIGH-RISK (register, login, check-in, owner mutations): FAIL-CLOSED (503)
 * - LOW-RISK (trucks read): Degrade to strict in-memory fallback
 * 
 * Supports both:
 * - Vercel KV: KV_REST_API_URL + KV_REST_API_TOKEN
 * - Upstash: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check environment - support both Vercel KV and Upstash
const vercelKvUrl = process.env.KV_REST_API_URL;
const vercelKvToken = process.env.KV_REST_API_TOKEN;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isVercelKvConfigured = !!(vercelKvUrl && vercelKvToken);
const isUpstashConfigured = !!(upstashUrl && upstashToken);
const isRedisConfigured = isVercelKvConfigured || isUpstashConfigured;
const isProduction = process.env.NODE_ENV === 'production';

// High-risk endpoints that require Redis in production (fail-closed)
const HIGH_RISK_ENDPOINTS: RateLimiterType[] = ['login', 'register', 'checkIn', 'ownerMutations'];

// Log warning on startup
if (isProduction && !isRedisConfigured) {
    console.error(
        '🚨 [SECURITY] Redis not configured in production! ' +
        'Set KV_REST_API_URL/TOKEN (Vercel KV) or UPSTASH_REDIS_REST_URL/TOKEN. ' +
        'High-risk endpoints will FAIL-CLOSED (503). Low-risk uses in-memory fallback.'
    );
} else if (isRedisConfigured) {
    console.log(`✅ [RateLimit] Using ${isVercelKvConfigured ? 'Vercel KV' : 'Upstash Redis'}`);
}

// Create Redis client - prefer Vercel KV, fallback to Upstash
const redis = isRedisConfigured
    ? new Redis({
        url: (vercelKvUrl || upstashUrl)!,
        token: (vercelKvToken || upstashToken)!,
    })
    : null;

/**
 * Rate limiters for different endpoints
 */
export const rateLimiters = {
    login: redis
        ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '15 m'), prefix: 'rl:login' })
        : null,
    register: redis
        ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 h'), prefix: 'rl:register' })
        : null,
    checkIn: redis
        ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'rl:checkin' })
        : null,
    trucksRead: redis
        ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'rl:trucks' })
        : null,
    ownerMutations: redis
        ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'), prefix: 'rl:owner' })
        : null,
};

export type RateLimiterType = keyof typeof rateLimiters;

export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
    unavailable?: boolean;  // True if rate limiter is unavailable (fail-closed)
    error?: string;
};

/**
 * Check rate limit for an identifier
 * Returns unavailable=true for high-risk endpoints when Redis is down in production
 */
export async function checkRateLimit(
    limiterType: RateLimiterType,
    identifier: string
): Promise<RateLimitResult> {
    const limiter = rateLimiters[limiterType];
    const isHighRisk = HIGH_RISK_ENDPOINTS.includes(limiterType);

    // FAIL-CLOSED: High-risk + production + no Redis
    if (!limiter && isProduction && isHighRisk) {
        // Dynamic import to avoid circular deps
        import('@/lib/alerting').then(({ alertRateLimitUnavailable }) => {
            alertRateLimitUnavailable({ route: limiterType });
        }).catch(() => { });

        console.error(`[RateLimit] FAIL-CLOSED: ${limiterType} blocked (no Redis)`);
        return {
            success: false,
            limit: 0,
            remaining: 0,
            reset: Date.now() + 60000,
            retryAfter: 60,
            unavailable: true,
            error: 'RATE_LIMIT_UNAVAILABLE',
        };
    }

    // Low-risk or dev: use fallback
    if (!limiter) {
        return applyFallbackRateLimit(limiterType, identifier);
    }

    // Use Redis
    try {
        const result = await limiter.limit(identifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
            retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
        };
    } catch (error) {
        // Redis error in production for high-risk: fail-closed
        if (isProduction && isHighRisk) {
            console.error(`[RateLimit] Redis error, FAIL-CLOSED: ${limiterType}`, error);
            return {
                success: false,
                limit: 0,
                remaining: 0,
                reset: Date.now() + 60000,
                retryAfter: 60,
                unavailable: true,
                error: 'RATE_LIMIT_UNAVAILABLE',
            };
        }
        // Low-risk: degrade to fallback
        console.warn(`[RateLimit] Redis error, using fallback: ${limiterType}`, error);
        return applyFallbackRateLimit(limiterType, identifier);
    }
}

// =====================
// FALLBACK: In-memory (dev + low-risk production degraded mode)
// =====================

const fallbackStore = new Map<string, { count: number; resetTime: number }>();

const FALLBACK_LIMITS: Record<RateLimiterType, { max: number; windowMs: number }> = {
    login: { max: 5, windowMs: 15 * 60 * 1000 },
    register: { max: 2, windowMs: 60 * 60 * 1000 },
    checkIn: { max: 5, windowMs: 60 * 1000 },
    trucksRead: { max: 50, windowMs: 60 * 1000 },
    ownerMutations: { max: 15, windowMs: 60 * 1000 },
};

function applyFallbackRateLimit(
    limiterType: RateLimiterType,
    identifier: string
): RateLimitResult {
    const config = FALLBACK_LIMITS[limiterType];
    const key = `${limiterType}:${identifier}`;
    const now = Date.now();

    const record = fallbackStore.get(key);

    if (!record || record.resetTime < now) {
        fallbackStore.set(key, { count: 1, resetTime: now + config.windowMs });
        return {
            success: true,
            limit: config.max,
            remaining: config.max - 1,
            reset: now + config.windowMs,
        };
    }

    if (record.count >= config.max) {
        return {
            success: false,
            limit: config.max,
            remaining: 0,
            reset: record.resetTime,
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
        };
    }

    record.count++;
    return {
        success: true,
        limit: config.max,
        remaining: config.max - record.count,
        reset: record.resetTime,
    };
}

export function isRedisEnabled(): boolean {
    return isRedisConfigured;
}

// Keep old name for backward compatibility
export const isUpstashEnabled = isRedisEnabled;
