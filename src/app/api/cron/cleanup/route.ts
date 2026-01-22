import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeEvents, checkInKeys } from '@/lib/db/schema';
import { lt, and, eq } from 'drizzle-orm';

// This can be triggered by a cron job (Vercel Cron, etc.)
// Cron config: every 24 hours

export async function GET() {
    const now = new Date();

    // Delete processed stripe events older than 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Delete old check-in keys older than 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = {
        stripeEventsDeleted: 0,
        checkInKeysDeleted: 0,
    };

    try {
        // Clean old successful stripe events
        const stripeResult = await db
            .delete(stripeEvents)
            .where(
                and(
                    eq(stripeEvents.status, 'success'),
                    lt(stripeEvents.processedAt!, thirtyDaysAgo)
                )
            )
            .returning({ id: stripeEvents.eventId });

        results.stripeEventsDeleted = stripeResult.length;

        // Clean old check-in keys
        const checkInResult = await db
            .delete(checkInKeys)
            .where(lt(checkInKeys.createdAt, sevenDaysAgo))
            .returning({ id: checkInKeys.id });

        results.checkInKeysDeleted = checkInResult.length;

        console.log('[Cleanup] Completed:', results);

        return NextResponse.json({
            success: true,
            cleaned: results,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error('[Cleanup] Error:', error);
        return NextResponse.json(
            { error: 'Cleanup failed' },
            { status: 500 }
        );
    }
}
