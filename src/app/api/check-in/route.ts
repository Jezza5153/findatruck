import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkIns, trucks, loyaltyCards, notifications } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Check-in eligibility rules
const CHECK_IN_RADIUS_METERS = 200; // Must be within 200m of truck
const TRUCK_LOCATION_MAX_AGE_MINUTES = 60; // Truck location must be updated within last hour
const CHECK_IN_COOLDOWN_HOURS = 4; // Can only check-in once per 4 hours per truck

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        // Parse and validate with strict schema
        const body = await request.json();
        const { checkInSchema, validate, validationErrorResponse } = await import('@/lib/validation');
        const validation = validate(checkInSchema, body);

        if (!validation.success) {
            return NextResponse.json(validationErrorResponse(validation.errors), { status: 400 });
        }

        const { truckId, lat, lng } = validation.data;

        // Per-userId rate limit (in addition to middleware per-IP limit)
        // Prevents abuse even with IP rotation
        const { checkRateLimit } = await import('@/lib/rate-limit');
        const userRateLimit = await checkRateLimit('checkIn', `user:${session.user.id}`);
        if (!userRateLimit.success) {
            return NextResponse.json(
                {
                    error: 'Too many check-in attempts. Please slow down.',
                    code: 'RATE_LIMITED',
                    retryAfter: userRateLimit.retryAfter,
                },
                { status: 429, headers: { 'Retry-After': String(userRateLimit.retryAfter || 60) } }
            );
        }

        // Per-user + per-truck rate limit (stricter - 3 per hour per truck)
        const truckRateLimit = await checkRateLimit('checkIn', `user:${session.user.id}:truck:${truckId}`);
        if (!truckRateLimit.success) {
            return NextResponse.json(
                {
                    error: 'Too many check-in attempts for this truck.',
                    code: 'RATE_LIMITED',
                },
                { status: 429 }
            );
        }

        // Get truck details
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) {
            return NextResponse.json({ error: 'Truck not found' }, { status: 404 });
        }

        // Check if truck is open
        if (!truck.isOpen) {
            return NextResponse.json(
                { error: 'Truck is not currently open', code: 'TRUCK_CLOSED' },
                { status: 400 }
            );
        }

        // Check if truck has a recent location
        if (!truck.lat || !truck.lng) {
            return NextResponse.json(
                { error: 'Truck location not available', code: 'NO_TRUCK_LOCATION' },
                { status: 400 }
            );
        }

        // Check if truck location is recent
        const truckUpdatedAt = truck.updatedAt;
        const maxAge = new Date(Date.now() - TRUCK_LOCATION_MAX_AGE_MINUTES * 60 * 1000);
        if (truckUpdatedAt < maxAge) {
            return NextResponse.json(
                { error: 'Truck location is outdated', code: 'LOCATION_STALE' },
                { status: 400 }
            );
        }

        // Calculate distance from user to truck
        const distance = calculateDistance(lat, lng, truck.lat, truck.lng);

        if (distance > CHECK_IN_RADIUS_METERS) {
            return NextResponse.json(
                {
                    error: `You must be within ${CHECK_IN_RADIUS_METERS}m of the truck to check in`,
                    code: 'TOO_FAR',
                    distance: Math.round(distance),
                    maxDistance: CHECK_IN_RADIUS_METERS
                },
                { status: 400 }
            );
        }

        // Check cooldown - recent check-in at this truck
        const cooldownTime = new Date(Date.now() - CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000);
        const recentCheckIns = await db
            .select()
            .from(checkIns)
            .where(
                and(
                    eq(checkIns.userId, session.user.id),
                    eq(checkIns.truckId, truckId),
                    gte(checkIns.createdAt, cooldownTime)
                )
            )
            .limit(1);

        if (recentCheckIns.length > 0) {
            const lastCheckIn = recentCheckIns[0];
            const timeRemaining = CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000 - (Date.now() - lastCheckIn.createdAt.getTime());
            const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

            return NextResponse.json(
                {
                    error: `You can check in again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`,
                    code: 'COOLDOWN',
                    nextCheckIn: new Date(lastCheckIn.createdAt.getTime() + CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
                },
                { status: 400 }
            );
        }

        // DB-enforced dedupe - prevents race condition double stamps
        const { claimCheckInSlot, linkCheckInToKey } = await import('@/lib/idempotency');
        const { claimed, existing } = await claimCheckInSlot(session.user.id, truckId, CHECK_IN_COOLDOWN_HOURS);

        if (!claimed) {
            return NextResponse.json(
                {
                    error: 'Already checked in during this window',
                    code: 'DUPLICATE_CHECKIN',
                    existingCheckInId: existing,
                },
                { status: 409 }
            );
        }

        // All checks passed - create check-in
        const [newCheckIn] = await db
            .insert(checkIns)
            .values({
                userId: session.user.id,
                truckId,
                lat,
                lng,
            })
            .returning();

        // Link check-in to idempotency key
        await linkCheckInToKey(session.user.id, truckId, newCheckIn.id, CHECK_IN_COOLDOWN_HOURS);

        // Update or create loyalty card
        const [existingCard] = await db
            .select()
            .from(loyaltyCards)
            .where(
                and(
                    eq(loyaltyCards.userId, session.user.id),
                    eq(loyaltyCards.truckId, truckId)
                )
            )
            .limit(1);

        let stampsEarned = 1;
        let rewardUnlocked = false;
        let totalStamps = 1;
        let stampsRequired = 10;

        if (existingCard) {
            const currentStamps = existingCard.stamps ?? 0;
            const currentRequired = existingCard.stampsRequired ?? 10;
            const currentRewards = existingCard.rewardsEarned ?? 0;

            const newStamps = currentStamps + 1;
            const newRewardsEarned = Math.floor(newStamps / currentRequired);
            rewardUnlocked = newRewardsEarned > currentRewards;
            totalStamps = newStamps % currentRequired || (rewardUnlocked ? currentRequired : 0);
            stampsRequired = currentRequired;

            await db
                .update(loyaltyCards)
                .set({
                    stamps: rewardUnlocked ? 0 : newStamps,
                    rewardsEarned: newRewardsEarned,
                    lastCheckIn: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(loyaltyCards.id, existingCard.id));

            totalStamps = rewardUnlocked ? 0 : newStamps;
        } else {
            await db
                .insert(loyaltyCards)
                .values({
                    userId: session.user.id,
                    truckId,
                    stamps: 1,
                    lastCheckIn: new Date(),
                });
            totalStamps = 1;
        }

        // Create notification if reward unlocked
        if (rewardUnlocked) {
            await db.insert(notifications).values({
                userId: session.user.id,
                type: 'reward_unlocked',
                title: 'Reward Unlocked! 🎉',
                message: `You've earned a free reward at ${truck.name}!`,
                truckId,
            });
        }

        return NextResponse.json({
            success: true,
            checkIn: newCheckIn,
            loyalty: {
                stampsEarned,
                totalStamps,
                stampsRequired,
                rewardUnlocked,
            },
            truck: {
                id: truck.id,
                name: truck.name,
            },
        });

    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json(
            { error: 'Failed to process check-in' },
            { status: 500 }
        );
    }
}

// GET - Check eligibility without creating check-in
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const truckId = searchParams.get('truckId');
        const lat = parseFloat(searchParams.get('lat') || '');
        const lng = parseFloat(searchParams.get('lng') || '');

        if (!truckId || isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: 'Missing required params: truckId, lat, lng' },
                { status: 400 }
            );
        }

        // Get truck
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) {
            return NextResponse.json({ eligible: false, reason: 'Truck not found' });
        }

        // Check conditions
        const checks = {
            truckOpen: truck.isOpen,
            hasLocation: !!(truck.lat && truck.lng),
            withinRange: false,
            noCooldown: true,
            distance: 0,
        };

        if (checks.hasLocation && truck.lat && truck.lng) {
            checks.distance = calculateDistance(lat, lng, truck.lat, truck.lng);
            checks.withinRange = checks.distance <= CHECK_IN_RADIUS_METERS;
        }

        // Check cooldown
        const cooldownTime = new Date(Date.now() - CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000);
        const recentCheckIns = await db
            .select()
            .from(checkIns)
            .where(
                and(
                    eq(checkIns.userId, session.user.id),
                    eq(checkIns.truckId, truckId),
                    gte(checkIns.createdAt, cooldownTime)
                )
            )
            .limit(1);

        checks.noCooldown = recentCheckIns.length === 0;

        const eligible = checks.truckOpen && checks.hasLocation && checks.withinRange && checks.noCooldown;

        return NextResponse.json({
            eligible,
            checks,
            truck: {
                id: truck.id,
                name: truck.name,
                isOpen: truck.isOpen,
            },
        });

    } catch (error) {
        console.error('Check eligibility error:', error);
        return NextResponse.json({ eligible: false, reason: 'Server error' }, { status: 500 });
    }
}
