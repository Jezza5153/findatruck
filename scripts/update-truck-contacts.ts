/**
 * Update truck records with contact emails, website URLs, and phone numbers
 * from publicly available info on their websites and social media.
 * 
 * Usage: npx tsx scripts/update-truck-contacts.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

// Verified contact info from trucks' own public websites
const TRUCK_CONTACTS: Record<string, {
  contactEmail?: string;
  websiteUrl?: string;
  phone?: string;
}> = {
  'Chimichurri Grill': {
    websiteUrl: 'https://chimichurrigrill.com.au',
    contactEmail: 'info@chimichurrigrill.com.au',
  },
  'Braising Boy': {
    websiteUrl: 'https://braisingboy.com.au',
    contactEmail: 'braisingboy@gmail.com',
    phone: '0428 287 522',
  },
  'Daisy Burger': {
    websiteUrl: 'https://daisyburger.com.au',
    contactEmail: 'info@daisyburger.com.au',
    phone: '0415 179 139',
  },
  'El Guaco Taco': {
    websiteUrl: 'https://elguacotaco.au',
    phone: '0434 993 061',
  },
  'La Mia Luna Pizza': {
    websiteUrl: 'https://lamialuna.com.au',
    contactEmail: 'lamialunapizza@gmail.com',
    phone: '0493 618 235',
  },
  'DoughBalls Pizza & Catering': {
    websiteUrl: 'https://doughballspizza.com.au',
  },
  'Staazi & Co': {
    websiteUrl: 'https://staaziandco.com.au',
  },
  'Sookii La La': {
    websiteUrl: 'https://sookiilala.com.au',
  },
  'Gelato Messina': {
    websiteUrl: 'https://gelatomessina.com',
  },
  "Jarrod's Jaffles": {
    websiteUrl: 'https://jarrodsjaffles.com.au',
  },
  'Mexican Madness': {
    websiteUrl: 'https://mexicanmadness.com',
  },
  'Taco Cartel': {
    websiteUrl: 'https://tacocartelaus.com.au',
  },
  'Cheesy Street': {
    websiteUrl: 'https://cheesystreet.com.au',
  },
  'Cucina Cufone': {
    websiteUrl: 'https://cucinacufone.com.au',
  },
  'Woody the Wagon': {
    websiteUrl: 'https://woodythewagon.com.au',
  },
  'Paella Bar': {
    websiteUrl: 'https://paellabar.com.au',
  },
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n📧 Updating truck contact info from their public websites...\n');

  let updated = 0;
  let notFound = 0;

  for (const [truckName, contact] of Object.entries(TRUCK_CONTACTS)) {
    const [truck] = await db
      .select()
      .from(schema.trucks)
      .where(eq(schema.trucks.name, truckName))
      .limit(1);

    if (!truck) {
      console.log(`  ❌ "${truckName}" not found in DB`);
      notFound++;
      continue;
    }

    const updates: Record<string, string> = {};
    if (contact.contactEmail && !truck.contactEmail) updates.contactEmail = contact.contactEmail;
    if (contact.websiteUrl && !truck.websiteUrl) updates.websiteUrl = contact.websiteUrl;
    if (contact.phone && !truck.phone) updates.phone = contact.phone;

    if (Object.keys(updates).length === 0) {
      console.log(`  ⏭️  "${truckName}" already has all contact info`);
      continue;
    }

    await db
      .update(schema.trucks)
      .set(updates)
      .where(eq(schema.trucks.id, truck.id));

    console.log(`  ✅ "${truckName}" → ${Object.keys(updates).join(', ')}`);
    updated++;
  }

  console.log(`\n📊 RESULTS: ${updated} updated, ${notFound} not found\n`);
}

main().catch(console.error);
