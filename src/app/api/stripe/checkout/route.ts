import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createCheckoutSession, SUBSCRIPTION_PRICE_ID } from '@/lib/stripe';

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

        // Check if price ID is configured
        if (!SUBSCRIPTION_PRICE_ID) {
            return NextResponse.json(
                { error: 'Stripe price not configured' },
                { status: 500 }
            );
        }

        // Get user with Stripe customer ID
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                stripeCustomerId: users.stripeCustomerId,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Build success/cancel URLs
        const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:9002';
        const successUrl = `${origin}/owner/billing?success=true`;
        const cancelUrl = `${origin}/owner/billing?canceled=true`;

        // Create checkout session
        const checkoutSession = await createCheckoutSession({
            customerId: user.stripeCustomerId || undefined,
            customerEmail: user.email,
            userId: user.id,
            successUrl,
            cancelUrl,
        });

        return NextResponse.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id,
        });
    } catch (error) {
        console.error('Checkout session error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
