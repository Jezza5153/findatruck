import { NextRequest, NextResponse } from 'next/server';
import { EnquiryValidationError, submitEnquiry } from '@/lib/enquiry-service';

export async function POST(req: NextRequest) {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') || 'unknown';
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rateCheck = await checkRateLimit('register', ip); // reuse register tier (10/hr)
    if (!rateCheck.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
        );
    }

    try {
        const body = await req.json();
        const result = await submitEnquiry({
            customerName: body.name,
            customerEmail: body.email,
            customerPhone: body.phone,
            eventType: body.eventType,
            eventDate: body.eventDate,
            guestCount: body.guestCount,
            message: body.message
                ? `${body.message}${body.venue ? `\n\nVenue: ${body.venue}` : ''}`
                : body.venue
                    ? `Venue: ${body.venue}`
                    : '',
            source: 'legacy-hire-form',
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Enquiry received! We\'ll get back to you within 24 hours.',
        });
    } catch (error) {
        if (error instanceof EnquiryValidationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
