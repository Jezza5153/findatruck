import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Middleware for:
 * 1. Role-based route protection
 * 2. Distributed rate limiting (Upstash Redis with fallback)
 * 3. Modern security headers (CSP)
 * 4. Request ID tracing
 */

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    // Generate or use existing request ID for tracing
    const requestId = request.headers.get('x-request-id') ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Security headers (modern policy)
    const response = NextResponse.next();
    response.headers.set('X-Request-Id', requestId);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS headers for API routes - STRICT ALLOWLIST ONLY
    // Only set CORS headers for explicitly allowed origins
    if (pathname.startsWith('/api/')) {
        const origin = request.headers.get('origin');

        // Strict allowlist - add your production domain here
        const ALLOWED_ORIGINS = new Set([
            process.env.NEXT_PUBLIC_APP_URL,
            'http://localhost:3000',
            'http://localhost:9002',
        ].filter(Boolean) as string[]);

        // Only set CORS headers if origin is in allowlist
        if (origin && ALLOWED_ORIGINS.has(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Vary', 'Origin');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id, X-Idempotency-Key');
            response.headers.set('Access-Control-Allow-Credentials', 'true');

            // Handle preflight requests
            if (request.method === 'OPTIONS') {
                return new NextResponse(null, { status: 204, headers: response.headers });
            }
        }
        // If origin not in allowlist: no CORS headers = browser blocks cross-origin
    }

    // Content Security Policy - complete policy
    response.headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.stripe.com https://www.googletagmanager.com https:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://*.neon.tech https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com wss:",
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'self'",
    ].join('; '));

    // Permissions Policy
    response.headers.set('Permissions-Policy', [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=(self)',
    ].join(', '));

    // Import distributed rate limiter (dynamic to avoid edge runtime issues)
    const { checkRateLimit } = await import('@/lib/rate-limit');

    // Rate limit: Login (HIGH-RISK - fail-closed)
    if (pathname === '/api/auth/callback/credentials' && request.method === 'POST') {
        const result = await checkRateLimit('login', ip);
        if (!result.success) {
            // Fail-closed: Redis unavailable returns 503
            const status = result.unavailable ? 503 : 429;
            const code = result.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMITED';
            return NextResponse.json(
                { error: result.unavailable ? 'Service temporarily unavailable' : 'Too many login attempts', code },
                {
                    status,
                    headers: {
                        'Retry-After': String(result.retryAfter || 60),
                        'X-RateLimit-Limit': String(result.limit),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }

    // Rate limit: Register
    if (pathname === '/api/auth/register' && request.method === 'POST') {
        const result = await checkRateLimit('register', ip);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.', code: 'RATE_LIMITED' },
                { status: 429, headers: { 'Retry-After': String(result.retryAfter || 3600) } }
            );
        }
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }

    // Rate limit: Check-in (per IP for now, per-user in route handler)
    if (pathname === '/api/check-in' && request.method === 'POST') {
        const result = await checkRateLimit('checkIn', ip);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many check-in requests. Please slow down.', code: 'RATE_LIMITED' },
                { status: 429, headers: { 'Retry-After': String(result.retryAfter || 60) } }
            );
        }
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }

    // Rate limit: Trucks GET (anti-scraping)
    if (pathname === '/api/trucks' && request.method === 'GET') {
        const result = await checkRateLimit('trucksRead', ip);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
                { status: 429, headers: { 'Retry-After': String(result.retryAfter || 60) } }
            );
        }
    }

    // Role-based API protection: Admin routes
    if (pathname.startsWith('/api/admin')) {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        if ((session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }
    }

    // Role-based protection: Scout internal API routes
    if (pathname.startsWith('/api/internal/scout')) {
        // Allow Vercel Cron with CRON_SECRET
        const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
        const isValidCron = authHeader && process.env.CRON_SECRET && authHeader === process.env.CRON_SECRET;

        // Allow webhook endpoint without admin session (it has its own HMAC auth)
        const isWebhookEndpoint = pathname.startsWith('/api/internal/scout/webhooks/');

        if (!isValidCron && !isWebhookEndpoint) {
            const session = await auth();
            if (!session?.user || (session.user as any).role !== 'admin') {
                return NextResponse.json({ error: 'Admin access required', code: 'FORBIDDEN' }, { status: 403 });
            }
        }
    }

    // Page protection: Scout internal dashboard
    if (pathname.startsWith('/internal/scout')) {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'admin') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Page protection: Admin dashboard
    if (pathname.startsWith('/admin')) {
        const session = await auth();
        if (!session?.user || (session.user as any).role !== 'admin') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Page protection: Owner dashboard
    if (pathname.startsWith('/owner') && pathname !== '/owner/login' && pathname !== '/owner/signup') {
        const session = await auth();
        if (!session?.user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const role = (session.user as any).role;
        if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (role !== 'owner') {
            return NextResponse.redirect(new URL('/customer/dashboard', request.url));
        }
    }

    // Page protection: Customer dashboard
    if (pathname.startsWith('/customer')) {
        const session = await auth();
        if (!session?.user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const role = (session.user as any).role;
        if (role === 'owner') {
            return NextResponse.redirect(new URL('/owner/dashboard', request.url));
        }
        if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Role-based API protection: Owner routes + rate limiting
    if (pathname.startsWith('/api/trucks/my')) {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        if ((session.user as any).role !== 'owner' && (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Owner access required', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }

        // Per-user rate limit for mutations
        if (request.method !== 'GET') {
            const result = await checkRateLimit('ownerMutations', session.user.id);
            if (!result.success) {
                return NextResponse.json(
                    { error: 'Too many updates. Please slow down.', code: 'RATE_LIMITED' },
                    { status: 429, headers: { 'Retry-After': String(result.retryAfter || 60) } }
                );
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/api/admin/:path*',
        '/api/trucks/my/:path*',
        '/api/trucks',
        '/api/auth/register',
        '/api/auth/callback/credentials',
        '/api/check-in',
        '/api/internal/scout/:path*',
        '/owner/:path*',
        '/admin/:path*',
        '/customer/:path*',
        '/internal/scout/:path*',
    ],
};
