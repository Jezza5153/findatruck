import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enquiries, trucks } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { EnquiryValidationError, submitEnquiry } from '@/lib/enquiry-service';

/**
 * POST /api/enquiries — create a new enquiry (no auth required).
 * Rate-limited: max 5 enquiries per email per hour.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitEnquiry(body);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        truckName: result.truckName,
        isEventEnquiry: result.isEventEnquiry,
      },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof EnquiryValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[POST /api/enquiries] Error:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}

/**
 * GET /api/enquiries?truckId=xxx — list enquiries for a truck (owner-only, future auth).
 */
export async function GET(request: NextRequest) {
  const truckId = request.nextUrl.searchParams.get('truckId');

  if (!truckId) {
    return NextResponse.json({ error: 'truckId is required' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [truck] = await db
      .select({ ownerUid: trucks.ownerUid })
      .from(trucks)
      .where(eq(trucks.id, truckId))
      .limit(1);

    if (!truck) {
      return NextResponse.json({ error: 'Truck not found' }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === 'admin';
    if (!isAdmin && truck.ownerUid !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results = await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.truckId, truckId))
      .orderBy(desc(enquiries.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('[GET /api/enquiries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}
