import { and, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { enquiries, trucks } from '@/lib/db/schema';
import { sendCustomerConfirmation, sendOwnerNotification } from '@/lib/email/send-enquiry-email';

const VALID_EVENT_TYPES = new Set([
  'wedding',
  'corporate',
  'market',
  'festival',
  'private',
  'school',
  'other',
]);

const EVENT_TYPE_ALIASES: Record<string, string> = {
  event: 'other',
  'private-party': 'private',
  'school-fete': 'school',
};

export type SubmitEnquiryInput = {
  truckId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guestCount?: string | number | null;
  message?: string | null;
  source?: string | null;
};

export class EnquiryValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'EnquiryValidationError';
    this.status = status;
  }
}

function normalizeEventType(rawValue?: string | null) {
  const normalized = (rawValue || '').trim().toLowerCase();
  const mapped = EVENT_TYPE_ALIASES[normalized] || normalized;
  return VALID_EVENT_TYPES.has(mapped) ? mapped : 'other';
}

function normalizeGuestCount(rawValue?: string | number | null) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return null;
  }

  const parsed = typeof rawValue === 'number' ? rawValue : parseInt(String(rawValue), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function normalizeEventDate(rawValue?: string | null) {
  if (!rawValue) {
    return null;
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new EnquiryValidationError('Valid event date is required');
  }

  return parsed;
}

export async function submitEnquiry(input: SubmitEnquiryInput) {
  const customerName = input.customerName?.trim();
  const customerEmail = input.customerEmail?.trim().toLowerCase();

  if (!customerName || customerName.length < 2) {
    throw new EnquiryValidationError('Name must be at least 2 characters');
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    throw new EnquiryValidationError('Valid email is required');
  }

  const safeEventType = normalizeEventType(input.eventType);
  const normalizedTruckId = input.truckId?.trim() || null;
  const isEventEnquiry = !normalizedTruckId;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ id: enquiries.id })
    .from(enquiries)
    .where(
      and(
        eq(enquiries.customerEmail, customerEmail),
        gte(enquiries.createdAt, oneHourAgo)
      )
    );

  if (recent.length >= 5) {
    throw new EnquiryValidationError('Too many enquiries. Please wait before sending more.', 429);
  }

  let truck: { id: string; name: string; contactEmail: string | null } | null = null;
  if (normalizedTruckId) {
    const [found] = await db
      .select({ id: trucks.id, name: trucks.name, contactEmail: trucks.contactEmail })
      .from(trucks)
      .where(eq(trucks.id, normalizedTruckId))
      .limit(1);

    if (!found) {
      throw new EnquiryValidationError('Truck not found', 404);
    }

    truck = found;
  }

  const guestCount = normalizeGuestCount(input.guestCount);
  const eventDate = normalizeEventDate(input.eventDate);
  const message = input.message?.trim() || '';

  const newEnquiry: typeof enquiries.$inferInsert = {
    truckId: truck?.id || null,
    customerName,
    customerEmail,
    customerPhone: input.customerPhone?.trim() || null,
    eventType: safeEventType as typeof enquiries.$inferInsert.eventType,
    eventDate,
    guestCount,
    message,
    source: input.source || (isEventEnquiry ? 'event-homepage' : 'profile'),
  };

  const [enquiry] = await db
    .insert(enquiries)
    .values(newEnquiry)
    .returning();

  try {
    await sendCustomerConfirmation({
      customerName,
      customerEmail,
      truckName: truck?.name || null,
      eventType: safeEventType,
      eventDate: input.eventDate || null,
      guestCount,
      message,
      isEventEnquiry,
    });

    if (truck?.contactEmail) {
      await sendOwnerNotification({
        customerName,
        customerEmail,
        truckName: truck.name,
        eventType: safeEventType,
        eventDate: input.eventDate || null,
        guestCount,
        message,
        isEventEnquiry,
        ownerEmail: truck.contactEmail,
      });
    }
  } catch (emailError) {
    console.error('[enquiries] Email send failed (enquiry still saved):', emailError);
  }

  return {
    id: enquiry.id,
    truckName: truck?.name || 'Event Enquiry',
    isEventEnquiry,
  };
}
