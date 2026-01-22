import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Ensure Node.js runtime (not Edge) for DB access
export const runtime = 'nodejs';

/**
 * Health check endpoint for uptime monitoring
 * GET /api/health
 */
export async function GET() {
    const start = Date.now();

    // Check if db is configured
    if (!db) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: { status: 'not_configured', error: 'DATABASE_URL not set' },
            },
        }, { status: 503 });
    }

    try {
        // Check database connectivity
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - start;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: { status: 'up', latencyMs: dbLatency },
            },
            version: process.env.npm_package_version || '1.0.0',
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (error) {
        console.error('[Health] Check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    status: 'down',
                    error: error instanceof Error ? error.message : 'Connection failed'
                },
            },
        }, { status: 503 });
    }
}
