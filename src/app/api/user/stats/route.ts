import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, checkIns, loyaltyCards } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET: Get user stats for profile page
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get favorites count
        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const favoritesCount = user?.favoriteTrucks?.length || 0;

        // Get check-ins count
        const [checkInsResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(checkIns)
            .where(eq(checkIns.userId, session.user.id));

        const checkInsCount = checkInsResult?.count || 0;

        // Get total rewards earned
        const [rewardsResult] = await db
            .select({ total: sql<number>`COALESCE(SUM(rewards_earned), 0)::int` })
            .from(loyaltyCards)
            .where(eq(loyaltyCards.userId, session.user.id));

        const rewardsCount = rewardsResult?.total || 0;

        return NextResponse.json({
            favorites: favoritesCount,
            checkIns: checkInsCount,
            rewards: rewardsCount,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({
            favorites: 0,
            checkIns: 0,
            rewards: 0
        });
    }
}
