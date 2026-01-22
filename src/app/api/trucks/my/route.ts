import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { trucks, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notifyTruckGoesLive } from '@/lib/notifications';

// GET: Get owner's truck
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's truck ID
        const [user] = await db
            .select({ truckId: users.truckId })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.truckId) {
            return NextResponse.json({ error: 'No truck associated' }, { status: 404 });
        }

        // Get truck details
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, user.truckId))
            .limit(1);

        if (!truck) {
            return NextResponse.json({ error: 'Truck not found' }, { status: 404 });
        }

        return NextResponse.json(truck);
    } catch (error) {
        console.error('Get my truck error:', error);
        return NextResponse.json({ error: 'Failed to fetch truck' }, { status: 500 });
    }
}

// PATCH: Update owner's truck
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        // Get user's truck ID
        const [user] = await db
            .select({ truckId: users.truckId })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.truckId) {
            return NextResponse.json({ error: 'No truck associated', code: 'NOT_FOUND' }, { status: 404 });
        }

        // Parse and validate with strict schema
        const body = await request.json();
        const { updateTruckSchema, validate, validationErrorResponse } = await import('@/lib/validation');
        const validation = validate(updateTruckSchema, body);

        if (!validation.success) {
            return NextResponse.json(validationErrorResponse(validation.errors), { status: 400 });
        }

        const validatedData = validation.data;

        // Get current truck state for comparison
        const [currentTruck] = await db
            .select({ isOpen: trucks.isOpen, lat: trucks.lat, lng: trucks.lng, updatedAt: trucks.updatedAt })
            .from(trucks)
            .where(eq(trucks.id, user.truckId))
            .limit(1);

        // Movement validation - prevent impossible GPS jumps
        if (validatedData.lat !== undefined && validatedData.lng !== undefined) {
            if (currentTruck?.lat && currentTruck?.lng && currentTruck?.updatedAt) {
                const { validateMovement } = await import('@/lib/auth-helpers');
                const movementCheck = validateMovement(
                    currentTruck.lat!,
                    currentTruck.lng!,
                    currentTruck.updatedAt,
                    validatedData.lat!,
                    validatedData.lng!,
                    new Date()
                );

                if (!movementCheck.valid) {
                    return NextResponse.json({
                        error: 'Location update rejected - impossible movement detected',
                        code: 'INVALID_MOVEMENT',
                        details: { speedKmH: movementCheck.speedKmH, maxAllowed: 200 }
                    }, { status: 400 });
                }
            }
        }

        // Build updates from validated data only (no mass assignment)
        const updates: Record<string, unknown> = {};
        Object.entries(validatedData).forEach(([key, value]) => {
            if (value !== undefined) {
                updates[key] = value;
            }
        });

        // Update currentLocation with timestamp if lat/lng changed
        if (validatedData.lat !== undefined && validatedData.lng !== undefined) {
            updates.currentLocation = {
                lat: validatedData.lat,
                lng: validatedData.lng,
                updatedAt: new Date().toISOString(),
            };
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        updates.updatedAt = new Date();

        await db
            .update(trucks)
            .set(updates)
            .where(eq(trucks.id, user.truckId));

        // Trigger notification if truck went live
        if (body.isOpen === true && !currentTruck?.isOpen) {
            await notifyTruckGoesLive(user.truckId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update truck error:', error);
        return NextResponse.json({ error: 'Failed to update truck' }, { status: 500 });
    }
}
