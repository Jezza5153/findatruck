import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, trucks } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

// GET: List user's favorite trucks
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user with favorites
        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.favoriteTrucks || user.favoriteTrucks.length === 0) {
            return NextResponse.json({ trucks: [] });
        }

        // Get truck details for favorites
        const favoriteTrucks = await db
            .select({
                id: trucks.id,
                name: trucks.name,
                cuisine: trucks.cuisine,
                imageUrl: trucks.imageUrl,
                rating: trucks.rating,
                isOpen: trucks.isOpen,
                address: trucks.address,
                lat: trucks.lat,
                lng: trucks.lng,
            })
            .from(trucks)
            .where(inArray(trucks.id, user.favoriteTrucks));

        return NextResponse.json({ trucks: favoriteTrucks });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST: Add truck to favorites
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { truckId } = await request.json();

        if (!truckId) {
            return NextResponse.json({ error: 'truckId required' }, { status: 400 });
        }

        // Get current favorites
        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const currentFavorites = user?.favoriteTrucks || [];

        if (currentFavorites.includes(truckId)) {
            return NextResponse.json({ success: true, message: 'Already favorited' });
        }

        // Add to favorites
        await db
            .update(users)
            .set({
                favoriteTrucks: [...currentFavorites, truckId],
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Add favorite error:', error);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}
