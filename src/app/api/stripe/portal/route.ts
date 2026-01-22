import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user with Stripe customer ID
        const [user] = await db
            .select({
                id: users.id,
                stripeCustomerId: users.stripeCustomerId,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 400 }
            );
        }

        // Build return URL
        const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:9002';
        const returnUrl = `${origin}/owner/billing`;

        // Create portal session
        const portalSession = await createPortalSession({
            customerId: user.stripeCustomerId,
            returnUrl,
        });

        return NextResponse.json({
            url: portalSession.url,
        });
    } catch (error) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
