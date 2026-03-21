/**
 * Update Adelaide food trucks with their public image URLs.
 * All URLs verified from truck websites OG meta tags.
 * 
 * Usage: npx tsx scripts/update-truck-images.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

// Verified OG image URLs from trucks' own public websites
const TRUCK_IMAGES: Record<string, string> = {
  'Chimichurri Grill': 'https://chimichurrigrill.com.au/wp-content/uploads/2023/02/Chimichurri-Grill4.jpg',
  'El Guaco Taco': 'https://elguacotaco.au/wp-content/uploads/2023/02/20220311_182545.jpg',
  'DoughBalls Pizza & Catering': 'https://doughballspizza.com.au/wp-content/uploads/2024/06/DoughBalls-Pizza-Logo-for-RankMath.jpg',
  'Gelato Messina': 'https://gelatomessina.com/cdn/shop/files/5bb41412096def3c97f9ba60_Home_opengraph.jpg?v=1679550903',
  'Mexican Madness': 'https://static.wixstatic.com/media/d0a8b1_6af85f006d8243e08e68d3e16f15e1fe~mv2.jpg/v1/fit/w_2500,h_1330,al_c/d0a8b1_6af85f006d8243e08e68d3e16f15e1fe~mv2.jpg',
  'Taco Cartel': 'https://img1.wsimg.com/isteam/ip/7163a208-9001-483b-8bf5-e1ca1cd0477d/391701703_320774700539663_8597865001018836350_.jpg',
};

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n🖼️  Updating truck images from their public websites...\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [truckName, imageUrl] of Object.entries(TRUCK_IMAGES)) {
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

    if (truck.imageUrl) {
      console.log(`  ⏭️  "${truckName}" already has image — skipping`);
      skipped++;
      continue;
    }

    await db
      .update(schema.trucks)
      .set({ imageUrl })
      .where(eq(schema.trucks.id, truck.id));

    console.log(`  ✅ "${truckName}" → image set`);
    updated++;
  }

  console.log(`\n📊 RESULTS: ${updated} updated, ${skipped} skipped, ${notFound} not found\n`);
}

main().catch(console.error);
