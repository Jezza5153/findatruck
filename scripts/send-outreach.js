const { Resend } = require('resend');
const { FOOD_TRUCKS } = require('./sa-food-trucks');

const resend = new Resend('re_27eYBwR2_CkoURns3QJhcwE1g9UfQqoQ6');

const FROM = 'Jeremy from FoodTruckNext2Me <info@foodtrucknext2me.com>';
const REPLY_TO = 'info@jezzacooks.com';
const SUBJECT = 'Free listing for your food truck on FoodTruckNext2Me.com 🚚';

function buildHtml(truck) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
  
  <p style="font-size: 16px; margin-bottom: 16px;">Hey${truck.name ? ' ' + truck.name.split(' ')[0] : ''} team,</p>

  <p style="font-size: 15px;">I'm building a platform to promote food trucks and make it easier for people to find and book you: <a href="https://www.foodtrucknext2me.com/" style="color: #ea580c; font-weight: 600;">foodtrucknext2me.com</a></p>

  <p style="font-size: 15px;"><strong>It's completely free to join.</strong></p>

  <p style="font-size: 15px;">You can either:</p>

  <ul style="font-size: 15px; padding-left: 20px;">
    <li style="margin-bottom: 8px;">Create a free account and add your food truck details yourself, or</li>
    <li style="margin-bottom: 8px;">Send us your details and a few photos, and we'll set everything up for you.</li>
  </ul>

  <p style="font-size: 15px;"><strong>If you want us to create your profile:</strong><br/>
  Email your truck name, contact details, socials, locations/availability (if you have it), menu/cuisine info, and a few good photos to <a href="mailto:info@jezzacooks.com" style="color: #ea580c;">info@jezzacooks.com</a>.</p>

  <p style="font-size: 15px;">We'll create your account, build your listing, and send you the login credentials. For security, please change your password as soon as you log in.</p>

  <p style="font-size: 15px;">We'll be adding more features as we go, so if you have any requests or ideas for what we should add to the site, just let us know. This is genuinely here to support the food truck industry.</p>

  <p style="font-size: 15px; margin-top: 24px;">Cheers,<br/><strong>Jeremy</strong><br/>
  <a href="https://www.foodtrucknext2me.com" style="color: #ea580c;">FoodTruckNext2Me</a></p>

</div>
  `.trim();
}

async function sendEmail(truck) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to: truck.email,
    subject: SUBJECT,
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
  const trucksWithEmail = FOOD_TRUCKS.filter(t => t.email);

  console.log(`Sending outreach to ${trucksWithEmail.length} food trucks...`);
  console.log(`From: ${FROM}`);
  console.log(`Reply-to: ${REPLY_TO}`);
  console.log('');

  let sent = 0;
  let failed = 0;

  for (const truck of trucksWithEmail) {
    const success = await sendEmail(truck);
    if (success) sent++;
    else failed++;

    // 1.5s delay between sends to avoid rate limits and spam triggers
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('');
  console.log(`Done! Sent: ${sent}, Failed: ${failed}`);
  process.exit(0);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
