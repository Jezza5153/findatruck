import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enquiries, trucks } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

/**
 * POST /api/enquiries — create a new enquiry (no auth required).
 * Rate-limited: max 5 enquiries per email per hour.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      truckId,
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      eventDate,
      guestCount,
      message,
      source,
    } = body;

    // Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    // Message is optional — most intent is captured by event type + date + guest count

    const validEventTypes = ['wedding', 'corporate', 'market', 'festival', 'private', 'school', 'other'];
    const safeEventType = validEventTypes.includes(eventType) ? eventType : 'other';
    const isEventEnquiry = !truckId;

    // Rate limiting: max 5 per email per hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recent = await db
      .select({ id: enquiries.id })
      .from(enquiries)
      .where(
        and(
          eq(enquiries.customerEmail, customerEmail.trim().toLowerCase()),
          gte(enquiries.createdAt, oneHourAgo)
        )
      );

    if (recent.length >= 5) {
      return NextResponse.json(
        { error: 'Too many enquiries. Please wait before sending more.' },
        { status: 429 }
      );
    }

    // For single-truck enquiries, verify the truck exists
    let truck: { id: string; name: string; contactEmail: string | null } | null = null;
    if (truckId) {
      const [found] = await db
        .select({ id: trucks.id, name: trucks.name, contactEmail: trucks.contactEmail })
        .from(trucks)
        .where(eq(trucks.id, truckId))
        .limit(1);

      if (!found) {
        return NextResponse.json({ error: 'Truck not found' }, { status: 404 });
      }
      truck = found;
    }

    // Create enquiry
    const [enquiry] = await db
      .insert(enquiries)
      .values({
        truckId: truck?.id || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone?.trim() || null,
        eventType: safeEventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        guestCount: guestCount ? parseInt(guestCount, 10) : null,
        message: message?.trim() || '',
        source: source || (isEventEnquiry ? 'event-homepage' : 'profile'),
      })
      .returning();

    // TODO: Send email notification to truck owner(s)
    // For single-truck: email to truck.contactEmail
    // For event enquiries: email to matching trucks by cuisine preference

    return NextResponse.json({
      success: true,
      data: {
        id: enquiry.id,
        truckName: truck?.name || 'Event Enquiry',
        isEventEnquiry,
      },
    }, { status: 201 });

  } catch (error) {
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
