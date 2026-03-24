/**
 * Scout food trucks from Google Business Profiles.
 * 1. Searches Google Places for various food truck types in Adelaide
 * 2. Gets place details (phone, website)
 * 3. Scrapes websites for emails
 * 4. Adds trucks with email + photo to the database
 * 
 * Run: npx tsx scripts/scout-food-trucks.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, trucks } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const SCOUT_EMAIL = 'scout@foodtrucknext2me.com';

const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const junkEmails = ['user@domain.com', 'example@mysite.com', 'impallari@gmail.com', 'hello@rfuenzalida.com', 'team@latofonts.com', 'matt@pixelspread.com'];

interface TruckCandidate {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  placeId: string;
  photoRef: string | null;
  lat: number;
  lng: number;
  email: string | null;
  cuisine: string;
}

// Map queries to cuisine types
const SEARCHES = [
  { query: 'food truck Adelaide', cuisine: 'Mixed' },
  { query: 'burger truck Adelaide', cuisine: 'Burgers' },
  { query: 'taco truck Adelaide', cuisine: 'Mexican' },
  { query: 'pizza truck Adelaide', cuisine: 'Pizza' },
  { query: 'thai food truck Adelaide', cuisine: 'Thai' },
  { query: 'bbq food truck Adelaide', cuisine: 'BBQ' },
  { query: 'crepe van Adelaide', cuisine: 'Desserts' },
  { query: 'ice cream truck Adelaide', cuisine: 'Desserts' },
  { query: 'donut truck Adelaide', cuisine: 'Desserts' },
  { query: 'food van Adelaide catering', cuisine: 'Mixed' },
  { query: 'mobile food Adelaide events', cuisine: 'Mixed' },
  { query: 'street food Adelaide', cuisine: 'Mixed' },
  { query: 'food truck McLaren Vale', cuisine: 'Mixed' },
  { query: 'food truck Barossa Valley', cuisine: 'Mixed' },
  { query: 'Asian food truck Adelaide', cuisine: 'Asian' },
  { query: 'Greek food truck Adelaide', cuisine: 'Greek' },
  { query: 'Indian food truck Adelaide', cuisine: 'Indian' },
  { query: 'vegan food truck Adelaide', cuisine: 'Vegan' },
  { query: 'seafood truck Adelaide', cuisine: 'Seafood' },
  { query: 'wood fired pizza van Adelaide', cuisine: 'Pizza' },
  { query: 'dumpling truck Adelaide', cuisine: 'Asian' },
  { query: 'kebab truck Adelaide', cuisine: 'Middle Eastern' },
  { query: 'waffle truck Adelaide', cuisine: 'Desserts' },
  { query: 'smoothie van Adelaide', cuisine: 'Drinks' },
  { query: 'juice truck Adelaide', cuisine: 'Drinks' },
];

async function searchPlaces(query: string): Promise<any[]> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

async function getPlaceDetails(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,url&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result || {};
}

async function scrapeEmail(website: string): Promise<string | null> {
  if (!website || website.includes('facebook.com') || website.includes('instagram.com')) return null;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(website, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    
    const html = await res.text();
    const emails = [...new Set(html.match(emailRegex) || [])];
    const filtered = emails.filter(e =>
      !junkEmails.includes(e) &&
      !e.includes('sentry') && !e.includes('wixpress') &&
      !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.js') &&
      e.length < 60
    );
    
    if (filtered.length > 0) return filtered[0];
    
    // Try /contact page
    try {
      const contactUrl = new URL('/contact', website).toString();
      const res2 = await fetch(contactUrl, {
        signal: AbortSignal.timeout(6000),
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      });
      const html2 = await res2.text();
      const emails2 = [...new Set(html2.match(emailRegex) || [])];
      const filtered2 = emails2.filter(e =>
        !junkEmails.includes(e) && !e.includes('sentry') && !e.includes('wixpress') &&
        !e.endsWith('.js') && e.length < 60
      );
      if (filtered2.length > 0) return filtered2[0];
    } catch {}
    
    return null;
  } catch {
    return null;
  }
}

function classifyCuisine(name: string, defaultCuisine: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('barista')) return 'Coffee';
  if (lower.includes('burger')) return 'Burgers';
  if (lower.includes('pizza')) return 'Pizza';
  if (lower.includes('taco') || lower.includes('mexican')) return 'Mexican';
  if (lower.includes('thai')) return 'Thai';
  if (lower.includes('bbq') || lower.includes('barbecue') || lower.includes('smokey')) return 'BBQ';
  if (lower.includes('crepe') || lower.includes('donut') || lower.includes('waffle') || lower.includes('ice cream') || lower.includes('gelato')) return 'Desserts';
  if (lower.includes('indian') || lower.includes('curry')) return 'Indian';
  if (lower.includes('greek') || lower.includes('gyro') || lower.includes('souvlaki')) return 'Greek';
  if (lower.includes('asian') || lower.includes('dumpling') || lower.includes('noodle') || lower.includes('bao')) return 'Asian';
  if (lower.includes('kebab') || lower.includes('falafel') || lower.includes('shawarma')) return 'Middle Eastern';
  if (lower.includes('seafood') || lower.includes('fish')) return 'Seafood';
  if (lower.includes('vegan') || lower.includes('plant')) return 'Vegan';
  if (lower.includes('juice') || lower.includes('smoothie')) return 'Drinks';
  return defaultCuisine;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error('DATABASE_URL not set'); process.exit(1); }

  const sql = neon(dbUrl);
  const db = drizzle(sql);

  // Get scout user
  let [scoutUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, SCOUT_EMAIL)).limit(1);
  if (!scoutUser) {
    const hash = await bcrypt.hash('scout-placeholder', 12);
    [scoutUser] = await db.insert(users).values({ email: SCOUT_EMAIL, name: 'FoodTruck Scout', passwordHash: hash, role: 'owner' }).returning({ id: users.id });
  }

  // Get existing truck names to skip
  const existingTrucks = await db.select({ name: trucks.name }).from(trucks);
  const existingNames = new Set(existingTrucks.map(t => t.name.toLowerCase()));

  const seen = new Set<string>();
  const candidates: TruckCandidate[] = [];

  console.log('🔍 Searching Google Places...\n');

  for (const { query, cuisine } of SEARCHES) {
    process.stdout.write(`  ${query}...`);
    const results = await searchPlaces(query);
    let newCount = 0;
    
    for (const place of results) {
      const name = place.name;
      const nameKey = name.toLowerCase().trim();
      
      if (seen.has(nameKey) || existingNames.has(nameKey)) continue;
      seen.add(nameKey);
      
      // Skip if no photos
      if (!place.photos?.[0]?.photo_reference) continue;
      
      // Skip non-operational
      if (place.business_status && place.business_status !== 'OPERATIONAL') continue;
      
      candidates.push({
        name,
        address: place.formatted_address || '',
        phone: '',
        website: '',
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        placeId: place.place_id,
        photoRef: place.photos[0].photo_reference,
        lat: place.geometry?.location?.lat || -34.9285,
        lng: place.geometry?.location?.lng || 138.6007,
        email: null,
        cuisine: classifyCuisine(name, cuisine),
      });
      newCount++;
    }
    
    console.log(` ${newCount} new`);
  }

  console.log(`\n📋 ${candidates.length} unique candidates with photos. Getting details + emails...\n`);

  // Get details and emails
  const withEmail: TruckCandidate[] = [];
  
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    process.stdout.write(`  [${i+1}/${candidates.length}] ${c.name}...`);
    
    // Get phone + website from Place Details
    const details = await getPlaceDetails(c.placeId);
    c.phone = details.formatted_phone_number || '';
    c.website = details.website || '';
    
    // Scrape email from website
    if (c.website) {
      c.email = await scrapeEmail(c.website);
    }
    
    if (c.email) {
      withEmail.push(c);
      console.log(` ✅ ${c.email}`);
    } else {
      console.log(` ❌ no email`);
    }
  }

  console.log(`\n☕ Found ${withEmail.length} trucks with email + photo. Adding to database...\n`);

  let added = 0;
  for (const truck of withEmail) {
    const photoUrl = `/api/image-proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${truck.photoRef}&key=${API_KEY}`)}`;

    try {
      const [newTruck] = await db.insert(trucks).values({
        ownerUid: scoutUser.id,
        name: truck.name,
        cuisine: truck.cuisine,
        description: `${truck.name} — mobile food truck in Adelaide. Rating: ${truck.rating}⭐ (${truck.reviews} reviews). Available for events and catering.`,
        contactEmail: truck.email!,
        phone: truck.phone || null,
        websiteUrl: truck.website || null,
        imageUrl: photoUrl,
        tags: ['food-truck', truck.cuisine.toLowerCase().replace(/\s+/g, '-'), 'adelaide', 'events'],
        isVisible: true,
        isOpen: false,
        lat: truck.lat,
        lng: truck.lng,
        address: truck.address,
        rating: truck.rating,
        numberOfRatings: truck.reviews,
      }).returning({ id: trucks.id, name: trucks.name });

      console.log(`  ✅ ${newTruck.name} | ${truck.email} | ${truck.cuisine}`);
      added++;
    } catch (err: any) {
      console.log(`  ❌ ${truck.name}: ${err.message?.slice(0, 80)}`);
    }
  }

  console.log(`\n🏁 Done! Added ${added} new food trucks to the platform.`);
  process.exit(0);
}

main().catch(err => { console.error('Failed:', err); process.exit(1); });
