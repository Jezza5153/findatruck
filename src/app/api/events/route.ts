import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { festivalEvents, festivalSightings, trucks } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// GET /api/events — List all festival events with truck counts
// Optional: ?truckId=X to get events for a specific truck
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const truckId = searchParams.get('truckId');

    if (truckId) {
      // Get events for a specific truck
      const sightings = await db
        .select({
          eventId: festivalSightings.eventId,
          eventName: festivalEvents.name,
          eventSlug: festivalEvents.slug,
          eventLocation: festivalEvents.location,
          year: festivalSightings.year,
        })
        .from(festivalSightings)
        .innerJoin(festivalEvents, eq(festivalSightings.eventId, festivalEvents.id))
        .where(eq(festivalSightings.truckId, truckId))
        .orderBy(desc(festivalSightings.year));

      return NextResponse.json({ success: true, data: sightings });
    }

    // Get all events with truck counts
    const events = await db
      .select({
        id: festivalEvents.id,
        name: festivalEvents.name,
        slug: festivalEvents.slug,
        location: festivalEvents.location,
        description: festivalEvents.description,
        imageUrl: festivalEvents.imageUrl,
        isRecurring: festivalEvents.isRecurring,
        truckCount: sql<number>`(SELECT COUNT(DISTINCT ${festivalSightings.truckId}) FROM ${festivalSightings} WHERE ${festivalSightings.eventId} = ${festivalEvents.id})`.as('truck_count'),
      })
      .from(festivalEvents)
      .orderBy(desc(sql`truck_count`));

    return NextResponse.json({
      success: true,
      data: events,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
