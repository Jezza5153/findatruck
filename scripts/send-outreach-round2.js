const { Resend } = require('resend');

const resendKey = process.env.RESEND_API_KEY_FOODTRUCK || process.env.RESEND_API_KEY;
if (!resendKey) {
    throw new Error('Missing RESEND_API_KEY_FOODTRUCK or RESEND_API_KEY');
}

const resend = new Resend(resendKey);

const FROM = 'Jeremy from FoodTruckNext2Me <info@foodtrucknext2me.com>';
const REPLY_TO = 'info@jezzacooks.com';

// === ONLY NEW CONTACTS — not in previous 27-email send ===
const NEW_TRUCKS = [
    { name: 'Mexican Madness', cuisine: 'Mexican', email: 'mexicanmadnessfood@gmail.com' },
    { name: 'Woody the Wagon', cuisine: 'Woodfired Pizza', email: 'info@woodythewagon.com.au' },
    { name: 'FJ Brews Coffee Cruiser', cuisine: 'Coffee', email: 'enquiries@fjbrews.com.au' },
];

// === PREVIOUSLY EMAILED (DO NOT RE-SEND) ===
const ALREADY_SENT = [
    'braisingboy@gmail.com',
    'cebu.soul.food@gmail.com',
    'chimichurri.grill@yahoo.com',
    'mezzemuezza@gmail.com',
    'moorishbites@gmail.com',
    'whatsthescoopadelaide@yahoo.com',
    'info@daisyburger.com.au',
    'rollingpizzaoven@adam.com.au',
    'hey@staaziandco.com.au',
    'info@strawberriesgalore.com.au',
    'hola@tacocartelaus.com.au',
    'lamialunapizza@gmail.com',
    'Jarrod@jarrodsjaffles.com.au',
    'hokeypokeystirling@gmail.com',
    'kafethaki@outlook.com',
    'info@mobeel.com.au',
    'tachs.stroopwafels@gmail.com',
    'sozassrilankanstreetfood@gmail.com',
    'thefusionfork@gmail.com',
    'hello@moianstreetfood.com',
    'info@rebelroasters.com.au',
    'party@thepaellaman.com',
    'events@bambinoadelaide.com.au',
    'feedmyfriends.catering@gmail.com',
    'adelaide@kombikeg.com',
    'AdelaideFoodTrucks@yahoo.com',
    'info@forkontheroad.com.au',
];

function buildSubject(truck) {
    return `Free listing for ${truck.name} on FoodTruckNext2Me 🚚`;
}

function buildHtml(truck) {
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">

  <p style="font-size: 16px; margin-bottom: 16px;">Hi ${truck.name} team,</p>

  <p style="font-size: 15px;">I'm Jeremy — I'm building a free directory to help people find food trucks in Adelaide and across SA: <a href="https://www.foodtrucknext2me.com/" style="color: #ea580c; font-weight: 600;">foodtrucknext2me.com</a></p>

  <p style="font-size: 15px;">I came across your truck and wanted to invite you to get listed. It's <strong>completely free</strong> — no catch, no fees.</p>

  <p style="font-size: 15px;"><strong>Two options to get started:</strong></p>

  <ul style="font-size: 15px; padding-left: 20px;">
    <li style="margin-bottom: 8px;">Create a free account and add your food truck details yourself, or</li>
    <li style="margin-bottom: 8px;">Just reply to this email with your truck name, contact details, socials, locations/availability, menu or cuisine info, and a few good photos — we'll build your listing and send you the login.</li>
  </ul>

  <p style="font-size: 15px;">We already have a handful of Adelaide trucks on the platform. As we grow, we're adding features like live location tracking, customer reviews, and event booking — so if you have ideas for what would actually be useful, I'd love to hear them.</p>

  <p style="font-size: 15px; margin-top: 24px;">Cheers,<br/><strong>Jeremy</strong><br/>
  <a href="https://www.foodtrucknext2me.com" style="color: #ea580c;">FoodTruckNext2Me</a></p>

</div>
  `.trim();
}

async function sendEmail(truck) {
    // Safety check: skip if already sent
    if (ALREADY_SENT.includes(truck.email.toLowerCase()) || ALREADY_SENT.includes(truck.email)) {
        console.log('SKIP (already sent):', truck.email, '(' + truck.name + ')');
        return false;
    }

    const { data, error } = await resend.emails.send({
        from: FROM,
        replyTo: REPLY_TO,
        to: truck.email,
        subject: buildSubject(truck),
        html: buildHtml(truck),
    });

    if (error) {
        console.log('FAILED:', truck.email, '(' + truck.name + ')', '-', error.message);
        return false;
    } else {
        console.log('SENT:', truck.email, '(' + truck.name + ')', '- ID:', data.id);
        return true;
    }
}

async function main() {
    console.log(`Sending outreach to ${NEW_TRUCKS.length} NEW food trucks...`);
    console.log(`From: ${FROM}`);
    console.log(`Reply-to: ${REPLY_TO}`);
    console.log(`Previously emailed: ${ALREADY_SENT.length} (will be skipped)`);
    console.log('');

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const truck of NEW_TRUCKS) {
        const success = await sendEmail(truck);
        if (success) sent++;
        else if (ALREADY_SENT.includes(truck.email)) skipped++;
        else failed++;

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('');
    console.log(`Done! Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
    process.exit(0);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
