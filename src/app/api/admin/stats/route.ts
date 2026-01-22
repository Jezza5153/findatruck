import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { trucks, users, reviews, subscriptions } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

// GET: Admin stats for dashboard
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check admin role
        const [user] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get counts
        const [trucksLive] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(trucks)
            .where(eq(trucks.isOpen, true));

        const [totalTrucks] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(trucks);

        const [totalUsers] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(users);

        const [pendingReviews] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(reviews)
            .where(eq(reviews.moderationState, 'pending'));

        const [activeSubscriptions] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(subscriptions)
            .where(eq(subscriptions.status, 'active'));

        // Signups today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [signupsToday] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(users)
            .where(gte(users.createdAt, today));

        return NextResponse.json({
            trucksLive: trucksLive?.count || 0,
            totalTrucks: totalTrucks?.count || 0,
            totalUsers: totalUsers?.count || 0,
            pendingReviews: pendingReviews?.count || 0,
            activeSubscriptions: activeSubscriptions?.count || 0,
            signupsToday: signupsToday?.count || 0,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
