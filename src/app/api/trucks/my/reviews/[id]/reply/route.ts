import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, users, trucks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notifyReviewReply } from '@/lib/notifications';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to get user's truck ID
async function getUserTruckId(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.truckId || null;
}

// POST: Reply to a review
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const truckId = await getUserTruckId(session.user.id);
        if (!truckId) {
            return NextResponse.json({ error: 'No truck associated' }, { status: 404 });
        }

        const body = await request.json();
        const { reply } = body;

        if (!reply?.trim()) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        // Get the review to find reviewer
        const [review] = await db
            .select({ userId: reviews.userId })
            .from(reviews)
            .where(
                and(
                    eq(reviews.id, id),
                    eq(reviews.truckId, truckId)
                )
            )
            .limit(1);

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Update with reply
        await db
            .update(reviews)
            .set({
                ownerReply: reply.trim(),
                ownerRepliedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(reviews.id, id),
                    eq(reviews.truckId, truckId)
                )
            );

        // Get truck name for notification
        const [truck] = await db
            .select({ name: trucks.name })
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        // Notify reviewer
        if (truck) {
            await notifyReviewReply(review.userId, truckId, truck.name);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reply to review error:', error);
        return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
    }
}
