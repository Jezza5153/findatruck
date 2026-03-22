/**
 * Use Google Places API to find photos for trucks that are still missing images.
 * Searches for each truck by name in Adelaide, gets the place details including photos,
 * and updates the DB with the photo URL.
 * 
 * The API key is stored in .env.local (NEVER committed to git).
 * 
 * Usage: npx tsx scripts/google-places-images.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { isNull, eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY not set in .env.local');
  process.exit(1);
}

// Google Places Text Search → get place_id
async function searchPlace(query: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.results && data.results.length > 0) {
    return data.results[0].place_id;
  }
  return null;
}

// Google Places Details → get photos + contact info
async function getPlaceDetails(placeId: string): Promise<{
  photoRef?: string;
  phone?: string;
  website?: string;
} | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,formatted_phone_number,website&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.result) {
    const result: any = {};
    if (data.result.photos && data.result.photos.length > 0) {
      result.photoRef = data.result.photos[0].photo_reference;
    }
    if (data.result.formatted_phone_number) {
      result.phone = data.result.formatted_phone_number;
    }
    if (data.result.website) {
      result.website = data.result.website;
    }
    return result;
  }
  return null;
}

// Convert photo reference to a direct URL
function getPhotoUrl(photoRef: string, maxWidth: number = 800): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${API_KEY}`;
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  // Get trucks without images
  const trucksNoImage = await db
    .select({
      id: schema.trucks.id,
      name: schema.trucks.name,
      phone: schema.trucks.phone,
      websiteUrl: schema.trucks.websiteUrl,
    })
    .from(schema.trucks)
    .where(isNull(schema.trucks.imageUrl));

  console.log(`\n🗺️  Searching Google Places for ${trucksNoImage.length} trucks without images...\n`);

  let imagesFound = 0;
  let contactsFound = 0;
  let notFound = 0;

  for (const truck of trucksNoImage) {
    // Search for the truck in Adelaide
    const searchQuery = `${truck.name} food truck Adelaide South Australia`;
    const placeId = await searchPlace(searchQuery);

    if (!placeId) {
      console.log(`  ❌ "${truck.name}" — not found on Google Places`);
      notFound++;
      // Small delay
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    const details = await getPlaceDetails(placeId);
    if (!details) {
      console.log(`  ❌ "${truck.name}" — no details found`);
      notFound++;
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    const updates: Record<string, string> = {};

    // Photo
    if (details.photoRef) {
      updates.imageUrl = getPhotoUrl(details.photoRef);
      imagesFound++;
    }

    // Phone (only if truck doesn't have one)
    if (details.phone && !truck.phone) {
      updates.phone = details.phone;
      contactsFound++;
    }

    // Website (only if truck doesn't have one)
    if (details.website && !truck.websiteUrl) {
      updates.websiteUrl = details.website;
      contactsFound++;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(schema.trucks).set(updates).where(eq(schema.trucks.id, truck.id));
      const fields = Object.keys(updates).join(', ');
      console.log(`  ✅ "${truck.name}" → ${fields}`);
    } else {
      console.log(`  ⏭️  "${truck.name}" — no new data from Google`);
    }

    // Rate limit: 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`   Images found: ${imagesFound}`);
  console.log(`   Extra contacts: ${contactsFound}`);
  console.log(`   Not found: ${notFound}\n`);
}

main().catch(console.error);
