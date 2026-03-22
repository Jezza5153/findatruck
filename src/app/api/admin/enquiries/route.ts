import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enquiries, trucks } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * GET /api/admin/enquiries — list all enquiries with truck name joined.
 * Protected by middleware (admin role required).
 */
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100', 10);
    const status = request.nextUrl.searchParams.get('status'); // new, read, replied, closed

    const results = await db
      .select({
        id: enquiries.id,
        truckId: enquiries.truckId,
        truckName: trucks.name,
        customerName: enquiries.customerName,
        customerEmail: enquiries.customerEmail,
        customerPhone: enquiries.customerPhone,
        eventType: enquiries.eventType,
        eventDate: enquiries.eventDate,
        guestCount: enquiries.guestCount,
        message: enquiries.message,
        status: enquiries.status,
        source: enquiries.source,
        createdAt: enquiries.createdAt,
      })
      .from(enquiries)
      .leftJoin(trucks, eq(enquiries.truckId, trucks.id))
      .where(status ? eq(enquiries.status, status as any) : undefined)
      .orderBy(desc(enquiries.createdAt))
      .limit(limit);

    // Get summary stats
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        new: sql<number>`count(*) filter (where ${enquiries.status} = 'new')::int`,
        read: sql<number>`count(*) filter (where ${enquiries.status} = 'read')::int`,
        replied: sql<number>`count(*) filter (where ${enquiries.status} = 'replied')::int`,
        closed: sql<number>`count(*) filter (where ${enquiries.status} = 'closed')::int`,
      })
      .from(enquiries);

    return NextResponse.json({
      success: true,
      data: results,
      stats: {
        total: stats?.total || 0,
        new: stats?.new || 0,
        read: stats?.read || 0,
        replied: stats?.replied || 0,
        closed: stats?.closed || 0,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/enquiries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/enquiries — update enquiry status.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [updated] = await db
      .update(enquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(enquiries.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[PATCH /api/admin/enquiries] Error:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
