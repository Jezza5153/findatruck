/**
 * DB-backed idempotency with LEASE pattern for scale-safe webhook processing
 * 
 * STATUS-AWARE RETRY POLICY:
 * - status='success' → return duplicate (no-op)
 * - status='processing' + fresh (<10min) → return duplicate (let other instance finish)
 * - status='processing' + stale (>10min) → acquire lease + retry
 * - status='failed' → acquire lease + retry
 * 
 * LEASE PATTERN (CAS):
 * - Only one instance can claim a stale/failed event via conditional UPDATE
 * - Prevents stampede when multiple instances see "stale"
 */

import { db } from '@/lib/db';
import { stripeEvents, checkInKeys } from '@/lib/db/schema';
import { eq, and, lt, or, sql } from 'drizzle-orm';

// Stale processing threshold (10 minutes)
const STALE_THRESHOLD_MS = 10 * 60 * 1000;
// Max attempts before alerting
const MAX_ATTEMPTS = 10;

/**
 * Process a Stripe webhook with lease-based idempotency
 * Returns shouldReturnError: true to signal route should return 500 for Stripe retry
 */
export async function processStripeEventIdempotently<T>(
    eventId: string,
    eventType: string,
    processor: () => Promise<T>
): Promise<{
    processed: boolean;
    result?: T;
    error?: Error;
    duplicate?: boolean;
    skipped?: string;
    shouldReturnError?: boolean;  // True = return 500 so Stripe retries
}> {
    const leaseId = crypto.randomUUID();
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_THRESHOLD_MS);

    // First, try to INSERT new event
    try {
        await db.insert(stripeEvents).values({
            eventId,
            eventType,
            status: 'processing',
            processingStartedAt: now,
            leaseId,
            attemptCount: 1,
        });
        // We own the event - proceed to processing
    } catch (error: any) {
        // PK violation - event exists, check status
        if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
            const [existing] = await db
                .select()
                .from(stripeEvents)
                .where(eq(stripeEvents.eventId, eventId))
                .limit(1);

            if (!existing) {
                // Race condition edge case
                return { processed: false, duplicate: true, skipped: 'race_condition' };
            }

            // SUCCESS: Already processed
            if (existing.status === 'success') {
                return { processed: false, duplicate: true, skipped: 'already_success' };
            }

            // PROCESSING: Check if stale
            if (existing.status === 'processing') {
                const processingAge = now.getTime() - existing.processingStartedAt.getTime();

                if (processingAge < STALE_THRESHOLD_MS) {
                    // Fresh - another instance is handling it
                    return { processed: false, duplicate: true, skipped: 'processing_in_progress' };
                }
                // Stale - try to acquire lease (fall through to CAS below)
            }

            // FAILED or STALE PROCESSING: Try to acquire lease via CAS
            const claimResult = await db
                .update(stripeEvents)
                .set({
                    status: 'processing',
                    processingStartedAt: now,
                    leaseId,
                    attemptCount: sql`${stripeEvents.attemptCount} + 1`,
                    lastError: null,
                })
                .where(
                    and(
                        eq(stripeEvents.eventId, eventId),
                        or(
                            eq(stripeEvents.status, 'failed'),
                            and(
                                eq(stripeEvents.status, 'processing'),
                                lt(stripeEvents.processingStartedAt, staleThreshold)
                            )
                        )
                    )
                )
                .returning({ leaseId: stripeEvents.leaseId, attemptCount: stripeEvents.attemptCount });

            if (!claimResult.length) {
                // Another instance claimed it first
                return { processed: false, duplicate: true, skipped: 'claimed_by_other' };
            }

            // Check attempt count for alerting
            if (claimResult[0].attemptCount > MAX_ATTEMPTS) {
                console.error(`[Webhook] Event exceeds max attempts (${MAX_ATTEMPTS}): ${eventId}`);
            }

            console.log(`[Webhook] Acquired lease for retry: ${eventId} (attempt ${claimResult[0].attemptCount})`);
            // Lease acquired - proceed to processing
        } else {
            throw error;
        }
    }

    // Process the event (we hold the lease)
    try {
        const result = await processor();

        // Mark success
        await db
            .update(stripeEvents)
            .set({
                status: 'success',
                processedAt: new Date(),
                lastError: null,
            })
            .where(
                and(
                    eq(stripeEvents.eventId, eventId),
                    eq(stripeEvents.leaseId, leaseId)  // Only our lease can mark success
                )
            );

        console.log(`[Webhook] Processed: ${eventId} (${eventType})`);
        return { processed: true, result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Mark failed
        await db
            .update(stripeEvents)
            .set({
                status: 'failed',
                processedAt: new Date(),
                lastError: errorMessage.slice(0, 1000),  // Truncate long errors
            })
            .where(eq(stripeEvents.eventId, eventId));

        console.error(`[Webhook] Failed: ${eventId} (${eventType})`, error);

        // Signal to route: return 500 so Stripe retries
        return { processed: true, error: error as Error, shouldReturnError: true };
    }
}

// =====================
// CHECK-IN IDEMPOTENCY (unchanged)
// =====================

export function getCheckInWindowBucket(hoursWindow: number = 4): string {
    const now = new Date();
    const windowMs = hoursWindow * 60 * 60 * 1000;
    const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

    return `${windowStart.getUTCFullYear()}-${String(windowStart.getUTCMonth() + 1).padStart(2, '0')}-${String(windowStart.getUTCDate()).padStart(2, '0')}-${String(windowStart.getUTCHours()).padStart(2, '0')}`;
}

export async function claimCheckInSlot(
    userId: string,
    truckId: string,
    windowHours: number = 4
): Promise<{ claimed: boolean; existing?: string }> {
    const windowBucket = getCheckInWindowBucket(windowHours);

    try {
        const [existing] = await db
            .select({ checkInId: checkInKeys.checkInId })
            .from(checkInKeys)
            .where(
                and(
                    eq(checkInKeys.userId, userId),
                    eq(checkInKeys.truckId, truckId),
                    eq(checkInKeys.windowBucket, windowBucket)
                )
            )
            .limit(1);

        if (existing) {
            return { claimed: false, existing: existing.checkInId || undefined };
        }

        await db.insert(checkInKeys).values({ userId, truckId, windowBucket });
        return { claimed: true };
    } catch (error: any) {
        if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
            const [existing] = await db
                .select({ checkInId: checkInKeys.checkInId })
                .from(checkInKeys)
                .where(
                    and(
                        eq(checkInKeys.userId, userId),
                        eq(checkInKeys.truckId, truckId),
                        eq(checkInKeys.windowBucket, windowBucket)
                    )
                )
                .limit(1);

            return { claimed: false, existing: existing?.checkInId || undefined };
        }
        throw error;
    }
}

export async function linkCheckInToKey(
    userId: string,
    truckId: string,
    checkInId: string,
    windowHours: number = 4
): Promise<void> {
    const windowBucket = getCheckInWindowBucket(windowHours);

    await db
        .update(checkInKeys)
        .set({ checkInId })
        .where(
            and(
                eq(checkInKeys.userId, userId),
                eq(checkInKeys.truckId, truckId),
                eq(checkInKeys.windowBucket, windowBucket)
            )
        );
}
