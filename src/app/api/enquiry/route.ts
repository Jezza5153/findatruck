import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, eventType, eventDate, guestCount, phone, venue, message } = body;

        if (!name || !email || !eventType || !eventDate || !guestCount) {
            return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
        }

        // Log enquiry (in production, this should go to a DB table or email service like Resend)
        console.log('=== NEW FOOD TRUCK ENQUIRY ===');
        console.log(JSON.stringify({
            name,
            email,
            phone: phone || 'N/A',
            eventType,
            eventDate,
            guestCount,
            venue: venue || 'TBD',
            message: message || 'No additional details',
            timestamp: new Date().toISOString(),
        }, null, 2));
        console.log('=== END ENQUIRY ===');

        // TODO: In the future, wire this up to:
        // 1. Resend API to email info@foodtrucknext2me.com
        // 2. Store in a DB "enquiries" table
        // 3. Auto-match with food truck owners by cuisine/location
        // 4. Send confirmation email to the enquirer

        return NextResponse.json({
            success: true,
            message: 'Enquiry received! We\'ll get back to you within 24 hours.',
        });
    } catch {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
