import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { events, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

// PATCH: Update booking (add notes)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        const { notes, title, location } = body;

        const updates: Record<string, unknown> = {};
        if (notes !== undefined) updates.notes = notes;
        if (title !== undefined) updates.title = title;
        if (location !== undefined) updates.location = location;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        await db
            .update(events)
            .set(updates)
            .where(
                and(
                    eq(events.id, id),
                    eq(events.truckId, truckId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update booking error:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

// DELETE: Cancel booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        await db
            .delete(events)
            .where(
                and(
                    eq(events.id, id),
                    eq(events.truckId, truckId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete booking error:', error);
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
