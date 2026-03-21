/**
 * Add missing website URLs for trucks so the OG image scraper can find them.
 * 
 * Usage: npx tsx scripts/add-missing-urls.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

// Verified URLs from web research
const TRUCK_URLS: Record<string, {
  websiteUrl?: string;
  facebookHandle?: string;
}> = {
  'Chipalicious': { websiteUrl: 'https://www.chipalicious.com.au' },
  '48 Flavours': { websiteUrl: 'https://48flavours.com.au' },
  'WienerBago': { websiteUrl: 'https://www.wienerbago.com.au', facebookHandle: 'WienerBagoFoodTruck' },
  'The Satay Hut': { facebookHandle: 'TheSatayHutFoodTruckAdelaide' },
  'Humpty Dumplings': { facebookHandle: 'humptydumplingsadelaide' },
  'Esaan Thai Street Food': { facebookHandle: 'EsaanThaiStreetFoodAdelaide', websiteUrl: 'https://esaanstreetfood.com' },
  'Fusion of Tandor': { facebookHandle: 'fotadelaide' },
  'Bavarian Grill': { facebookHandle: 'BavarianGrillFoodTruck' },
  "Bab's Greek BBQ": { facebookHandle: 'babsgreekbbq' },
  'Z Town Burgers': { facebookHandle: 'ZTownBurgers' },
  'Honey Puff Lads': { facebookHandle: 'honeypufflads' },
  'The Brew Cruiser': { facebookHandle: 'thebrewcruiser' },
  'Van Dough': { facebookHandle: 'vandoughpizza' },
  'Cakeboy': { facebookHandle: 'cakeboyadelaide' },
  'Bubble Bus': { facebookHandle: 'bubblebusadelaide' },
  'The Rolling Pizza Oven': { facebookHandle: 'therollingpizzaoven' },
  'Bellachino Coffee Van': { facebookHandle: 'bellachinocoffee' },
  'The Pastelaria': { facebookHandle: 'thepastelaria' },
  'Strawberries Galore': { facebookHandle: 'strawberriesgalore' },
  'Taste of Paradise': { facebookHandle: 'tasteofparadiseadelaide' },
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n🔗 Adding missing website/Facebook URLs...\n');

  let updated = 0;
  let notFound = 0;

  for (const [name, urls] of Object.entries(TRUCK_URLS)) {
    const [truck] = await db
      .select()
      .from(schema.trucks)
      .where(eq(schema.trucks.name, name))
      .limit(1);

    if (!truck) {
      // Try with trimmed name (some have trailing spaces)
      const [truckTrimmed] = await db
        .select()
        .from(schema.trucks)
        .where(eq(schema.trucks.name, name + ' '))
        .limit(1);
      
      if (!truckTrimmed) {
        console.log(`  ❌ "${name}" not found`);
        notFound++;
        continue;
      }
      
      const updates: Record<string, string> = {};
      if (urls.websiteUrl && !truckTrimmed.websiteUrl) updates.websiteUrl = urls.websiteUrl;
      if (urls.facebookHandle && !truckTrimmed.facebookHandle) updates.facebookHandle = urls.facebookHandle;
      
      if (Object.keys(updates).length > 0) {
        await db.update(schema.trucks).set(updates).where(eq(schema.trucks.id, truckTrimmed.id));
        console.log(`  ✅ "${name}" → ${Object.keys(updates).join(', ')}`);
        updated++;
      }
      continue;
    }

    const updates: Record<string, string> = {};
    if (urls.websiteUrl && !truck.websiteUrl) updates.websiteUrl = urls.websiteUrl;
    if (urls.facebookHandle && !truck.facebookHandle) updates.facebookHandle = urls.facebookHandle;

    if (Object.keys(updates).length === 0) {
      console.log(`  ⏭️  "${name}" already has URLs`);
      continue;
    }

    await db.update(schema.trucks).set(updates).where(eq(schema.trucks.id, truck.id));
    console.log(`  ✅ "${name}" → ${Object.keys(updates).join(', ')}`);
    updated++;
  }

  console.log(`\n📊 RESULTS: ${updated} updated, ${notFound} not found\n`);
}

main().catch(console.error);
