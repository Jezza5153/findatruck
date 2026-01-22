import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Helper to get user's truck ID
async function getUserTruckId(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.truckId || null;
}

// GET: List truck's reviews
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const truckId = await getUserTruckId(session.user.id);
        if (!truckId) {
            return NextResponse.json({ error: 'No truck associated' }, { status: 404 });
        }

        const truckReviews = await db
            .select({
                id: reviews.id,
                userId: reviews.userId,
                rating: reviews.rating,
                text: reviews.text,
                ownerReply: reviews.ownerReply,
                ownerRepliedAt: reviews.ownerRepliedAt,
                createdAt: reviews.createdAt,
                userName: users.name,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .where(eq(reviews.truckId, truckId))
            .orderBy(desc(reviews.createdAt));

        return NextResponse.json({ reviews: truckReviews });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
