import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, users, subscriptions, trucks } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { stripe, constructWebhookEvent } from '@/lib/stripe';
import type Stripe from 'stripe';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    if (!WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = constructWebhookEvent(body, signature, WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // DB-backed idempotency - survives serverless scaling
        const { processStripeEventIdempotently } = await import('@/lib/idempotency');

        const { processed, error, duplicate, shouldReturnError } = await processStripeEventIdempotently(
            event.id,
            event.type,
            async () => {
                // Handle the event
                switch (event.type) {
                    case 'checkout.session.completed':
                        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                        break;

                    case 'customer.subscription.updated':
                        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                        break;

                    case 'customer.subscription.deleted':
                        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                        break;

                    case 'invoice.payment_failed':
                        await handlePaymentFailed(event.data.object as Stripe.Invoice);
                        break;

                    default:
                        console.log(`Unhandled event type: ${event.type}`);
                }
            }
        );

        // Duplicate via DB unique constraint - already handled
        if (duplicate) {
            return NextResponse.json({ received: true, processed: false, duplicate: true });
        }

        // Processing failed - return 500 so Stripe retries
        if (error || shouldReturnError) {
            console.error('Webhook processing error:', error);
            return NextResponse.json(
                { error: 'Webhook handler failed', willRetry: true },
                { status: 500 }
            );
        }

        return NextResponse.json({ received: true, processed });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Helper to safely get subscription period timestamps
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
    // Access period data from the subscription items
    const item = subscription.items?.data?.[0];
    const periodStart = item?.current_period_start || (subscription as any).current_period_start;
    const periodEnd = item?.current_period_end || (subscription as any).current_period_end;

    return {
        start: periodStart ? new Date(periodStart * 1000) : null,
        end: periodEnd ? new Date(periodEnd * 1000) : null,
    };
}

/**
 * Handle successful checkout - create/update subscription
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId || !subscriptionId) {
        console.error('Missing userId or subscriptionId in checkout session');
        return;
    }

    // Fetch subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const period = getSubscriptionPeriod(subscription);

    // Update user with Stripe customer ID
    await db
        .update(users)
        .set({
            stripeCustomerId: customerId,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    // Create or update subscription record
    await db
        .insert(subscriptions)
        .values({
            userId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            stripePriceId: subscription.items.data[0]?.price.id || '',
            status: subscription.status as typeof subscriptions.$inferInsert.status,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                stripePriceId: subscription.items.data[0]?.price.id || '',
                status: subscription.status as typeof subscriptions.$inferInsert.status,
                currentPeriodStart: period.start,
                currentPeriodEnd: period.end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                updatedAt: new Date(),
            },
        });

    // Update truck subscription tier
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (user?.truckId) {
        await db
            .update(trucks)
            .set({
                subscriptionTier: 'pro',
                updatedAt: new Date(),
            })
            .where(eq(trucks.id, user.truckId));
    }

    console.log(`Subscription activated for user ${userId}`);
}

/**
 * Handle subscription updates (status changes, renewals)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
        // Try to find user by subscription ID
        const [subRecord] = await db
            .select({ userId: subscriptions.userId })
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
            .limit(1);

        if (!subRecord) {
            console.error('No subscription record found for:', subscription.id);
            return;
        }

        await updateSubscriptionRecord(subRecord.userId, subscription);
    } else {
        await updateSubscriptionRecord(userId, subscription);
    }
}

async function updateSubscriptionRecord(userId: string, subscription: Stripe.Subscription) {
    const period = getSubscriptionPeriod(subscription);

    await db
        .update(subscriptions)
        .set({
            status: subscription.status as typeof subscriptions.$inferInsert.status,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));

    // Update truck tier based on status
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (user?.truckId) {
        const tier = subscription.status === 'active' ? 'pro' : 'free';
        await db
            .update(trucks)
            .set({
                subscriptionTier: tier,
                updatedAt: new Date(),
            })
            .where(eq(trucks.id, user.truckId));
    }

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const [subRecord] = await db
        .select({ userId: subscriptions.userId })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .limit(1);

    if (!subRecord) {
        console.error('No subscription record found for deleted:', subscription.id);
        return;
    }

    // Update subscription status
    await db
        .update(subscriptions)
        .set({
            status: 'canceled',
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, subRecord.userId));

    // Downgrade truck to free tier
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, subRecord.userId))
        .limit(1);

    if (user?.truckId) {
        await db
            .update(trucks)
            .set({
                subscriptionTier: 'free',
                isFeatured: false,
                updatedAt: new Date(),
            })
            .where(eq(trucks.id, user.truckId));
    }

    console.log(`Subscription canceled for user ${subRecord.userId}`);
}

/**
 * Handle failed payments
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
    // Get subscription ID from the invoice parent or subscription field
    const subscriptionId = (invoice as any).subscription ||
        (invoice.parent as any)?.subscription_details?.subscription;

    if (!subscriptionId) return;

    await db
        .update(subscriptions)
        .set({
            status: 'past_due',
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

    console.log(`Payment failed for subscription ${subscriptionId}`);
}
