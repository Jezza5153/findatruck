import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user's subscription
        const [subscription] = await db
            .select({
                status: subscriptions.status,
                cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
                currentPeriodEnd: subscriptions.currentPeriodEnd,
                stripePriceId: subscriptions.stripePriceId,
            })
            .from(subscriptions)
            .where(eq(subscriptions.userId, session.user.id))
            .limit(1);

        if (!subscription) {
            return NextResponse.json({
                status: 'none',
                cancelAtPeriodEnd: false,
                currentPeriodEnd: null,
            });
        }

        return NextResponse.json({
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
        });
    } catch (error) {
        console.error('Subscription status error:', error);
        return NextResponse.json(
            { error: 'Failed to get subscription status' },
            { status: 500 }
        );
    }
}
