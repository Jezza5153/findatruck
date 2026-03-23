import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY_FOODTRUCK;
    if (!key) throw new Error('RESEND_API_KEY_FOODTRUCK not set');
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = 'Food Truck Next 2 Me <info@foodtrucknext2me.com>';
const PLATFORM_CC = 'info@jezzacooks.com';

export interface EnquiryEmailData {
  customerName: string;
  customerEmail: string;
  truckName: string | null;
  eventType: string;
  eventDate: string | null;
  guestCount: number | null;
  message: string;
  isEventEnquiry: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  corporate: 'Corporate Event',
  market: 'Market',
  festival: 'Festival',
  private: 'Private Party',
  school: 'School Event',
  other: 'Other / General Enquiry',
};

/**
 * Send confirmation email to the customer after they submit an enquiry.
 */
export async function sendCustomerConfirmation(data: EnquiryEmailData) {
  const subject = data.isEventEnquiry
    ? 'Your event enquiry has been received ✓'
    : `Your enquiry to ${data.truckName} has been sent ✓`;

  const eventLabel = EVENT_TYPE_LABELS[data.eventType] || data.eventType;
  const dateStr = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';

  const text = [
    `Hi ${data.customerName},`,
    '',
    data.isEventEnquiry
      ? `We've received your event enquiry. We'll reach out to suitable trucks on your behalf.`
      : `We've sent your enquiry to ${data.truckName}. Here's a summary:`,
    '',
    `Event type: ${eventLabel}`,
    `Date: ${dateStr}`,
    `Guests: ${data.guestCount || 'Not specified'}`,
    data.message ? `Message: ${data.message}` : '',
    '',
    'What to expect:',
    data.isEventEnquiry
      ? '- We\'ll contact suitable trucks and you should hear back within 48 hours'
      : `- ${data.truckName} typically responds within 24 hours`,
    '- If you don\'t hear back, we\'ll follow up for you',
    '',
    '---',
    'Sent via FoodTruckNext2Me.com — Adelaide\'s food truck directory.',
    'Questions? Email us at info@foodtrucknext2me.com',
  ].filter(Boolean).join('\n');

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      cc: PLATFORM_CC,
      replyTo: 'info@foodtrucknext2me.com',
      subject,
      text,
    });
    console.log(`[EMAIL] Customer confirmation sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send customer confirmation:', error);
    throw error;
  }
}

/**
 * Send notification to a truck owner when they receive an enquiry.
 */
export async function sendOwnerNotification(
  data: EnquiryEmailData & { ownerEmail: string }
) {
  const eventLabel = EVENT_TYPE_LABELS[data.eventType] || data.eventType;
  const dateStr = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';

  const subject = `New enquiry via FoodTruckNext2Me — ${eventLabel}`;

  const text = [
    `Hi ${data.truckName} team,`,
    '',
    `You've received a new enquiry through FoodTruckNext2Me.com.`,
    '',
    `From: ${data.customerName}`,
    `Email: ${data.customerEmail}`,
    `Event type: ${eventLabel}`,
    `Date: ${dateStr}`,
    `Guests: ${data.guestCount || 'Not specified'}`,
    data.message ? `Message: ${data.message}` : '',
    '',
    `Please reply directly to ${data.customerEmail} to follow up.`,
    '',
    '---',
    'This enquiry was sent via FoodTruckNext2Me.com — Adelaide\'s food truck directory.',
    'Want to manage your profile? Visit foodtrucknext2me.com/owner/portal',
  ].filter(Boolean).join('\n');

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      cc: PLATFORM_CC,
      replyTo: [data.customerEmail, 'info@foodtrucknext2me.com'],
      subject,
      text,
    });
    console.log(`[EMAIL] Owner notification sent to ${data.ownerEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send owner notification:', error);
    throw error;
  }
}
