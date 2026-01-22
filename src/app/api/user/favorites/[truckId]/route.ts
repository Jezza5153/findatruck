import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ truckId: string }>;
}

// GET: Check if truck is favorited
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { truckId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ isFavorite: false });
        }

        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const isFavorite = user?.favoriteTrucks?.includes(truckId) || false;

        return NextResponse.json({ isFavorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        return NextResponse.json({ isFavorite: false });
    }
}

// DELETE: Remove truck from favorites
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { truckId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const currentFavorites = user?.favoriteTrucks || [];
        const updatedFavorites = currentFavorites.filter(id => id !== truckId);

        await db
            .update(users)
            .set({
                favoriteTrucks: updatedFavorites,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove favorite error:', error);
        return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
}
