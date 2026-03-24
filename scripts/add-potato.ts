import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, trucks } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const SCOUT_EMAIL = 'scout@foodtrucknext2me.com';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const [scoutUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, SCOUT_EMAIL)).limit(1);
  if (!scoutUser) { console.error('Scout user not found'); process.exit(1); }

  // Check if already exists
  const existing = await db.select({ id: trucks.id }).from(trucks).where(eq(trucks.name, 'Potato on a Stick')).limit(1);
  if (existing.length > 0) {
    console.log('Already exists, skipping');
    process.exit(0);
  }

  const photoRef = 'ATCDNfWkOV7sYSq23Eo2076rlGU8oNZnLsD3ZLqYpS7g_NX9yFRzwmXMF6qnME3a1EQo1PNsnRKsIEiijbrpzDaDJM7Ae9HOfL7Yva5wKlIT9Um0c69tGtNh0x4VICZeI_6x0S2wrw1IsPhr58iligYUcLNAb4ycoXYtGULkg2A4L9sei8o1hG2RkJINOUsqY-bLn1atGvp6bddJSjhcRkinPpHqEtGOz4RAX7gLb6D_dbbbvJUzCPhniQXL8AtBCPcmqUAidaS7ZLr_Eopt9QflSrQebIO7rQzWAM-elqfLYygox9POqoILVCLQ25luSDJauinPhBtwgsNsATG8nKse9dZXz5iHDMLIzrn6Z0wiGPO5z7iJ7byeRVLiHYcG7uuXB7P7DaYn6_ZJRK7YISHgzZWBX1Nyr6Hgp7PncVi8ETu65D8Z';
  const photoUrl = `/api/image-proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`)}`;

  const [newTruck] = await db.insert(trucks).values({
    ownerUid: scoutUser.id,
    name: 'Potato on a Stick',
    cuisine: 'Festival Food',
    description: 'Deliciously crispy potato twisters on a stick! Adelaide festival favourite since 2013. Also serving mozzarella sticks, pork belly on a stick, churros, cinnamon donuts, and slushies. Soy-free, nut-free, and vegan-friendly options available. Available for festivals, events, and private catering.',
    contactEmail: 'info@potatoonastick.com.au',
    phone: '0401 394 174',
    websiteUrl: 'https://potatoonastick.com.au/',
    imageUrl: photoUrl,
    tags: ['festival', 'potato', 'street-food', 'events', 'catering', 'vegan-friendly'],
    isVisible: true,
    isOpen: false,
    lat: -34.92252190000001,
    lng: 138.5991757,
    address: '25 King William St, Adelaide SA 5000, Australia',
  }).returning({ id: trucks.id, name: trucks.name });

  console.log(`✅ Added: ${newTruck.name} (${newTruck.id})`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
