import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { events, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Using events table for bookings (event requests from customers)

// Helper to get user's truck ID
async function getUserTruckId(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.truckId || null;
}

// GET: List truck's bookings/event requests
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const truckId = await getUserTruckId(session.user.id);
        if (!truckId) {
            return NextResponse.json({ error: 'No truck associated' }, { status: 404 });
        }

        // Get events/bookings for this truck
        const bookings = await db
            .select()
            .from(events)
            .where(eq(events.truckId, truckId))
            .orderBy(desc(events.startTime));

        // Transform to booking format (using schema fields)
        const formattedBookings = bookings.map(e => ({
            id: e.id,
            eventName: e.title || 'Event',
            location: e.location || 'TBD',
            date: e.startTime?.toISOString().split('T')[0] || '',
            startTime: e.startTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
            endTime: e.endTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
            notes: e.notes,
            status: 'pending' as const, // No isActive in schema, default to pending
            createdAt: e.createdAt.toISOString(),
        }));

        return NextResponse.json({ bookings: formattedBookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
