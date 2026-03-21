/**
 * Scrape OG images from all truck websites and update the database.
 * Uses open-graph-scraper to extract og:image from each truck's websiteUrl.
 * 
 * Usage: npx tsx scripts/scrape-truck-images.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import ogs from 'open-graph-scraper';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { isNotNull, eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  // Get all trucks — we'll try website URLs, Instagram handles, etc.
  const allTrucks = await db
    .select({
      id: schema.trucks.id,
      name: schema.trucks.name,
      websiteUrl: schema.trucks.websiteUrl,
      instagramHandle: schema.trucks.instagramHandle,
      facebookHandle: schema.trucks.facebookHandle,
      imageUrl: schema.trucks.imageUrl,
    })
    .from(schema.trucks);

  console.log(`\n🖼️  Scraping OG images for ${allTrucks.length} trucks...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const truck of allTrucks) {
    // Skip trucks that already have an image
    if (truck.imageUrl) {
      console.log(`  ⏭️  "${truck.name}" — already has image`);
      skipped++;
      continue;
    }

    // Try multiple URL sources in priority order
    const urlsToTry: string[] = [];
    if (truck.websiteUrl) urlsToTry.push(truck.websiteUrl);
    if (truck.facebookHandle) urlsToTry.push(`https://www.facebook.com/${truck.facebookHandle}`);
    // Instagram doesn't return OG images easily, skip it

    if (urlsToTry.length === 0) {
      console.log(`  ❌ "${truck.name}" — no website URL to scrape`);
      failed++;
      continue;
    }

    let foundImage: string | null = null;

    for (const url of urlsToTry) {
      try {
        const { result } = await ogs({ url, timeout: 10000 });
        
        // Try og:image first
        if (result.ogImage && result.ogImage.length > 0) {
          foundImage = result.ogImage[0].url;
          break;
        }
        
        // Fallback to twitter:image
        if (result.twitterImage && result.twitterImage.length > 0) {
          foundImage = result.twitterImage[0].url;
          break;
        }
      } catch (err: any) {
        // Try next URL
        continue;
      }
    }

    if (!foundImage) {
      console.log(`  ❌ "${truck.name}" — no OG image found`);
      failed++;
      continue;
    }

    // Update DB
    await db
      .update(schema.trucks)
      .set({ imageUrl: foundImage })
      .where(eq(schema.trucks.id, truck.id));

    console.log(`  ✅ "${truck.name}" → ${foundImage.substring(0, 80)}...`);
    updated++;

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 RESULTS: ${updated} updated, ${skipped} already had images, ${failed} no image found\n`);
}

main().catch(console.error);
