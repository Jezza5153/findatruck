import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, users, trucks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Admin check helper
async function isAdmin(userId: string): Promise<boolean> {
    const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.role === 'admin';
}

// GET: List all reviews for moderation
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const allReviews = await db
            .select({
                id: reviews.id,
                truckId: reviews.truckId,
                userId: reviews.userId,
                rating: reviews.rating,
                text: reviews.text,
                moderationState: reviews.moderationState,
                createdAt: reviews.createdAt,
                userName: users.name,
                userEmail: users.email,
                truckName: trucks.name,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .leftJoin(trucks, eq(reviews.truckId, trucks.id))
            .orderBy(desc(reviews.createdAt));

        return NextResponse.json({ reviews: allReviews });
    } catch (error) {
        console.error('Admin reviews error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
