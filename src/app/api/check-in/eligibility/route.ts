import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkInKeys } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * Check if user is eligible to check in at a truck
 * GET /api/check-in/eligibility?truckId=xxx
 */
export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const truckId = searchParams.get('truckId');

    if (!truckId) {
        return NextResponse.json({ error: 'truckId required' }, { status: 400 });
    }

    // Check for recent check-in (4 hour cooldown)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const recentCheckIn = await db
        .select({ createdAt: checkInKeys.createdAt })
        .from(checkInKeys)
        .where(
            and(
                eq(checkInKeys.userId, session.user.id),
                eq(checkInKeys.truckId, truckId),
                gt(checkInKeys.createdAt, fourHoursAgo)
            )
        )
        .limit(1);

    if (recentCheckIn.length > 0) {
        const cooldownUntil = new Date(recentCheckIn[0].createdAt.getTime() + 4 * 60 * 60 * 1000);
        return NextResponse.json({
            eligible: false,
            cooldown: true,
            cooldownUntil: cooldownUntil.toISOString(),
        });
    }

    return NextResponse.json({
        eligible: true,
        cooldown: false,
    });
}
