import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { specials, users } from '@/lib/db/schema';
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

// PATCH: Update a special
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
        const allowedFields = ['title', 'description', 'discountPercent', 'startTime', 'endTime', 'isActive'];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === 'startTime' || field === 'endTime') {
                    updates[field] = body[field] ? new Date(body[field]) : null;
                } else {
                    updates[field] = body[field];
                }
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        updates.updatedAt = new Date();

        await db
            .update(specials)
            .set(updates)
            .where(
                and(
                    eq(specials.id, id),
                    eq(specials.truckId, truckId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update special error:', error);
        return NextResponse.json({ error: 'Failed to update special' }, { status: 500 });
    }
}

// DELETE: Delete a special
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
            .delete(specials)
            .where(
                and(
                    eq(specials.id, id),
                    eq(specials.truckId, truckId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete special error:', error);
        return NextResponse.json({ error: 'Failed to delete special' }, { status: 500 });
    }
}
