/**
 * Master contact enrichment — all contact data from web research.
 * 
 * Usage: npx tsx scripts/enrich-all-contacts.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

const CONTACTS: Record<string, Record<string, string>> = {
  // From foodtrucksinadelaide.com.au
  'Baltic Fine Food': {
    instagramHandle: 'balticfinefood',
  },
  // From cheesystreet.com.au
  'Cheesy Street': {
    contactEmail: 'getcheesy@cheesystreet.com.au',
    facebookHandle: 'cheesystreetadl',
  },
  // From holdfast.sa.gov.au + southaustralia.com
  'Cakeboy': {
    contactEmail: 'cakeboydonuts@gmail.com',
    phone: '0411 246 801',
    websiteUrl: 'https://www.cakeboydonuts.com',
  },
  // From woodythewagon.com.au
  'Woody the Wood Oven Wagon': {
    contactEmail: 'info@woodythewagon.com.au',
  },
  // From eventsupplier.com.au
  'WienerBago': {
    phone: '0413 411 211',
  },
  'The Satay Hut': {
    phone: '0416 181 771',
  },
  // From chipalicious.com.au
  'Chipalicious ': {  // note trailing space in DB
    contactEmail: 'chipalicious17@gmail.com',
  },
  // From therollingpizzaoven.com.au
  'The Rolling Pizza Oven': {
    contactEmail: 'rollingpizzaoven@adam.com.au',
    phone: '0430 161 936',
    websiteUrl: 'https://therollingpizzaoven.com.au',
  },
  // From travelxchange.com.au
  'Esaan Thai Street Food': {
    phone: '+61 8 7260 9556',
  },
  // Instagram handles from research
  'Taste of Paradise': {
    instagramHandle: 'tasteofparadisesa',
  },
  'Honey Puff Lads': {
    instagramHandle: 'honeypufflads',
  },
  'Sookii La La': {
    instagramHandle: 'sookiilala_adelaide',
  },
  // Bellachino from common Adelaide food truck listings
  'Bellachino Coffee Van': {
    instagramHandle: 'bellachino_coffee',
  },
  'The Pastelaria': {
    instagramHandle: 'thepastelaria',
  },
  'Van Dough': {
    instagramHandle: 'vandoughpizza',
  },
  'Strawberries Galore': {
    instagramHandle: 'strawberriesgalore_',
  },
  'Humpty Dumplings': {
    instagramHandle: 'humptydumplingsadelaide',
  },
  'The Brew Cruiser': {
    instagramHandle: 'thebrewcruiser',
  },
  'Bubble Bus': {
    instagramHandle: 'bubblebusadelaide',
  },
  'Bavarian Grill': {
    instagramHandle: 'bavariangrilladl',
  },
  'Fusion of Tandor': {
    instagramHandle: 'fusionoftandor',
  },
};

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log('\n📧 Enriching truck contacts from web research...\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [name, data] of Object.entries(CONTACTS)) {
    const [truck] = await db
      .select()
      .from(schema.trucks)
      .where(eq(schema.trucks.name, name))
      .limit(1);

    if (!truck) {
      console.log(`  ❌ "${name}" not found`);
      notFound++;
      continue;
    }

    // Only update fields that aren't already set
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!(truck as any)[key]) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log(`  ⏭️  "${name}" already has all info`);
      skipped++;
      continue;
    }

    await db.update(schema.trucks).set(updates).where(eq(schema.trucks.id, truck.id));
    console.log(`  ✅ "${name}" → ${Object.keys(updates).join(', ')}`);
    updated++;
  }

  // Final audit — check how many trucks still have NO contact method
  const allTrucks = await db.select().from(schema.trucks);
  const noContact = allTrucks.filter(t => 
    !t.contactEmail && !t.phone && !t.instagramHandle && !t.facebookHandle && !t.websiteUrl
  );
  const noImage = allTrucks.filter(t => !t.imageUrl);

  console.log(`\n📊 RESULTS: ${updated} updated, ${skipped} already had info, ${notFound} not found`);
  console.log(`\n🔍 AUDIT:`);
  console.log(`   Total trucks: ${allTrucks.length}`);
  console.log(`   With images: ${allTrucks.length - noImage.length}/${allTrucks.length}`);
  console.log(`   With ≥1 contact: ${allTrucks.length - noContact.length}/${allTrucks.length}`);
  if (noContact.length > 0) {
    console.log(`   ❌ Still zero contact: ${noContact.map(t => t.name).join(', ')}`);
  }
  if (noImage.length > 0) {
    console.log(`   📷 Still no image: ${noImage.map(t => t.name).join(', ')}`);
  }
  console.log('');
}

main().catch(console.error);
