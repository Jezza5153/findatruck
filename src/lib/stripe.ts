import Stripe from 'stripe';

// Lazy-initialized Stripe client to prevent build crash
let stripeClient: Stripe | null = null;

/**
 * Get Stripe client - lazy initialized
 * Returns null if STRIPE_SECRET_KEY is not set
 */
export function getStripe(): Stripe | null {
    if (!process.env.STRIPE_SECRET_KEY) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality disabled.');
        }
        return null;
    }

    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        });
    }

    return stripeClient;
}

// Legacy export for backward compatibility (will throw if used without key)
export const stripe = {
    get instance(): Stripe {
        const client = getStripe();
        if (!client) {
            throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY.');
        }
        return client;
    }
};

// Australian Dollar pricing
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
export const SUBSCRIPTION_PRICE_AUD = 15; // $15 AUD per month

// Subscription tiers
export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionFeatures {
    maxMenuItems: number;
    analytics: boolean;
    featuredEligible: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
    free: {
        maxMenuItems: 10,
        analytics: false,
        featuredEligible: false,
        prioritySupport: false,
        customDomain: false,
    },
    pro: {
        maxMenuItems: 100,
        analytics: true,
        featuredEligible: true,
        prioritySupport: true,
        customDomain: true,
    },
};

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession({
    customerId,
    customerEmail,
    userId,
    successUrl,
    cancelUrl,
}: {
    customerId?: string;
    customerEmail: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: SUBSCRIPTION_PRICE_ID,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
        },
        subscription_data: {
            metadata: {
                userId,
            },
        },
        currency: 'aud',
    };

    // Use existing customer or create by email
    if (customerId) {
        sessionConfig.customer = customerId;
    } else {
        sessionConfig.customer_email = customerEmail;
    }

    return stripe.instance.checkout.sessions.create(sessionConfig);
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function createPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string;
    returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
    return stripe.instance.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
        return await stripe.instance.subscriptions.retrieve(subscriptionId);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
        return await stripe.instance.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return null;
    }
}

/**
 * Get or create a Stripe Customer
 */
export async function getOrCreateCustomer({
    email,
    name,
    userId,
}: {
    email: string;
    name?: string;
    userId: string;
}): Promise<Stripe.Customer> {
    // Search for existing customer by email
    const existingCustomers = await stripe.instance.customers.list({
        email,
        limit: 1,
    });

    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
    }

    // Create new customer
    return stripe.instance.customers.create({
        email,
        name,
        metadata: {
            userId,
        },
    });
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return stripe.instance.webhooks.constructEvent(payload, signature, webhookSecret);
}
