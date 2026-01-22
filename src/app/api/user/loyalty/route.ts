import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { loyaltyCards, trucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET: Get user's loyalty cards
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cards = await db
            .select({
                id: loyaltyCards.id,
                truckId: loyaltyCards.truckId,
                stamps: loyaltyCards.stamps,
                stampsRequired: loyaltyCards.stampsRequired,
                rewardsEarned: loyaltyCards.rewardsEarned,
                lastCheckIn: loyaltyCards.lastCheckIn,
                truckName: trucks.name,
                truckCuisine: trucks.cuisine,
                truckImageUrl: trucks.imageUrl,
            })
            .from(loyaltyCards)
            .innerJoin(trucks, eq(loyaltyCards.truckId, trucks.id))
            .where(eq(loyaltyCards.userId, session.user.id));

        // Calculate totals
        const totalStamps = cards.reduce((sum, c) => sum + (c.stamps || 0), 0);
        const totalRewards = cards.reduce((sum, c) => sum + (c.rewardsEarned || 0), 0);

        return NextResponse.json({
            cards: cards.map(c => ({
                id: c.id,
                truckId: c.truckId,
                stamps: c.stamps || 0,
                stampsRequired: c.stampsRequired || 10,
                rewardsEarned: c.rewardsEarned || 0,
                lastCheckIn: c.lastCheckIn,
                truck: {
                    name: c.truckName,
                    cuisine: c.truckCuisine,
                    imageUrl: c.truckImageUrl,
                },
            })),
            totalStamps,
            totalRewards,
        });
    } catch (error) {
        console.error('Get loyalty error:', error);
        return NextResponse.json({ cards: [], totalStamps: 0, totalRewards: 0 });
    }
}
