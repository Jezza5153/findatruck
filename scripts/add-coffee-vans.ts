/**
 * Add coffee vans to the FoodTruckNext2Me database.
 * Uses Google Places API for photos and details.
 * 
 * Run: npx tsx scripts/add-coffee-vans.ts
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

const coffeeVans = [
  {
    name: 'Incognito Espresso',
    contactEmail: 'brett@incognitocafe.com.au',
    phone: '0410 228 290',
    website: 'https://www.incognitocafe.com.au/incognito-mobile',
    cuisine: 'Coffee',
    description: 'Premium mobile coffee carts serving Adelaide since 2016. Expert baristas, exclusive Cognition blend, compostable cups. Available for corporate events, weddings, and private functions.',
    tags: ['coffee', 'mobile', 'events', 'corporate', 'weddings'],
    query: 'Incognito Espresso Mobile Coffee Carts Adelaide',
  },
  {
    name: 'Kombi Crew',
    contactEmail: 'hello@kombicrew.au',
    phone: '0404 371 978',
    website: 'https://kombicrew.au/',
    cuisine: 'Coffee',
    description: 'Vintage Kombi van coffee experience. Artisan espresso, experienced baristas, and professional bar services for weddings, corporate events, and festivals across South Australia.',
    tags: ['coffee', 'kombi', 'vintage', 'events', 'weddings', 'bar'],
    query: 'Kombi Crew Adelaide coffee',
  },
  {
    name: 'Mugshot Coffee Co',
    contactEmail: 'info@mugshotcoffee.com.au',
    phone: '0488 570 476',
    website: 'https://www.mugshotcoffee.com.au/',
    cuisine: 'Coffee',
    description: 'Mobile coffee hire for corporate events, commercial sites, parties, and office deliveries. Fresh hot coffee, specialty drinks, and snacks.',
    tags: ['coffee', 'mobile', 'corporate', 'events', 'office'],
    query: 'Mugshot Coffee Co Adelaide',
  },
  {
    name: 'Bellachino Mobile Coffee',
    contactEmail: 'george@bellachinocoffee.com',
    phone: '0416 041 479',
    website: 'https://www.bellachinocoffee.com/',
    cuisine: 'Coffee',
    description: 'Adelaide coffee van for hire serving locally roasted, award-winning coffee. Available for events, markets, and private functions.',
    tags: ['coffee', 'mobile', 'events', 'award-winning'],
    query: 'Bellachino Mobile Coffee Van Adelaide',
  },
  {
    name: 'Adelaide Roaming Coffee Van',
    contactEmail: 'AdelaideRCV@gmail.com',
    phone: '0468 767 333',
    website: 'https://adelaidercv.wixsite.com/roaming-coffee-van',
    cuisine: 'Coffee',
    description: 'Roaming coffee van bringing quality coffee to events and locations across Adelaide. Available for hire.',
    tags: ['coffee', 'mobile', 'roaming', 'events'],
    query: 'Adelaide Roaming Coffee Van',
  },
  {
    name: 'Daisy Mobile Bar',
    contactEmail: 'info@daisyburger.com.au',
    phone: '0415 179 139',
    website: 'http://www.daisymobilebar.com.au/',
    cuisine: 'Coffee & Bar',
    description: 'Mobile bar and coffee packages with barista-made unlimited coffee, premium beans, milk options, tea, hot chocolate, and eco-friendly cups. Perfect for parties and corporate events.',
    tags: ['coffee', 'bar', 'mobile', 'events', 'corporate'],
    query: 'Daisy Mobile Bar Adelaide',
  },
  {
    name: 'Cargo Catering Co',
    contactEmail: 'hello@cargocateringco.com',
    phone: '0402 757 081',
    website: 'https://www.cargocateringco.com/',
    cuisine: 'Coffee & Catering',
    description: 'Mobile catering with premium coffee service. Available for corporate events, weddings, festivals, and private functions across Adelaide.',
    tags: ['coffee', 'catering', 'mobile', 'events', 'weddings'],
    query: 'Cargo Catering Co Adelaide',
  },
  {
    name: 'Roving Cafe',
    contactEmail: 'info@rovingcafe.com.au',
    phone: '',
    website: 'https://rovingcafe.com.au',
    cuisine: 'Coffee',
    description: 'Unique cafe on a tricycle — self-sustainable, environmentally friendly, using an old-style lever espresso machine. Locally sourced, fair-trade coffee with compostable cups.',
    tags: ['coffee', 'tricycle', 'eco-friendly', 'events', 'weddings'],
    query: 'Roving Cafe Adelaide coffee tricycle',
  },
  {
    name: 'Deja Brew Specialty Coffee',
    contactEmail: 'Enquiries@dejabrewspecialtycoffee.com',
    phone: '(08) 7223 0368',
    website: 'https://dejabrewspecialtycoffee.com.au',
    cuisine: 'Coffee',
    description: 'Mobile coffee van hire for events, workplaces, and private gatherings. Consistent, high-quality, locally sourced specialty coffee.',
    tags: ['coffee', 'specialty', 'mobile', 'events', 'workplace'],
    query: 'Deja Brew Specialty Coffee Adelaide',
  },
  {
    name: 'Mrs Sippy',
    contactEmail: 'mrssippyadelaide@gmail.com',
    phone: '',
    website: 'https://mrssippyadelaide.com.au',
    cuisine: 'Coffee',
    description: 'Vintage-style coffee caravans and carts. Multiple setups available for events across South Australia. Started from a handmade cart and grown into a beloved Adelaide brand.',
    tags: ['coffee', 'vintage', 'caravan', 'events', 'weddings'],
    query: 'Mrs Sippy Adelaide coffee',
  },
  {
    name: 'Combi Coffee Bar',
    contactEmail: 'info@combiccoffeebar.com',
    phone: '',
    website: 'https://combicoffeebar.com',
    cuisine: 'Coffee',
    description: 'A 1972 Low Light Volkswagen Kombi serving premium local coffee at major events around Adelaide. Family-owned, specializing in event catering including weddings.',
    tags: ['coffee', 'kombi', 'vintage', 'events', 'weddings'],
    query: 'Combi Coffee Bar Adelaide',
  },
  {
    name: 'Cirelli Coffee',
    contactEmail: 'enquiries@cirellicoffee.com.au',
    phone: '0447 847 897',
    website: 'https://cirellicoffee.com.au',
    cuisine: 'Coffee',
    description: 'Premium mobile coffee cart for corporate events, weddings, product launches, and private events. Includes barista, equipment, coffee, and a selection of hot beverages.',
    tags: ['coffee', 'mobile', 'corporate', 'weddings', 'events'],
    query: 'Cirelli Coffee Adelaide',
  },
  {
    name: 'Lygon Coffee',
    contactEmail: 'admin@lygoncoffee.com',
    phone: '',
    website: 'https://lygoncoffee.com',
    cuisine: 'Coffee',
    description: 'Leading mobile coffee van delivering high-quality espresso and coffee beverages to events and workplaces across Adelaide and surrounding suburbs.',
    tags: ['coffee', 'mobile', 'espresso', 'events', 'workplace'],
    query: 'Lygon Coffee Adelaide mobile',
  },
];

async function getPlacePhoto(query: string): Promise<string | null> {
  try {
    // Search for the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchData.results?.[0]?.photos?.[0]?.photo_reference) {
      return null;
    }
    
    const photoRef = searchData.results[0].photos[0].photo_reference;
    // Return the proxy URL so we don't expose the API key
    return `/api/image-proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`)}`;
  } catch (err) {
    console.error(`  Photo fetch failed for ${query}:`, err);
    return null;
  }
}

async function getPlaceLocation(query: string): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const place = searchData.results?.[0];
    if (!place) return null;
    
    return {
      lat: place.geometry?.location?.lat || -34.9285,
      lng: place.geometry?.location?.lng || 138.6007,
      address: place.formatted_address || '',
    };
  } catch {
    return null;
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const db = drizzle(sql);

  // Create or find scout user (placeholder owner for scouted trucks)
  let [scoutUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, SCOUT_EMAIL))
    .limit(1);

  if (!scoutUser) {
    console.log('Creating scout user...');
    const hash = await bcrypt.hash('scout-placeholder-not-a-real-login', 12);
    [scoutUser] = await db
      .insert(users)
      .values({
        email: SCOUT_EMAIL,
        name: 'FoodTruck Scout',
        passwordHash: hash,
        role: 'owner',
      })
      .returning({ id: users.id });
  }

  console.log(`Scout user ID: ${scoutUser.id}\n`);

  let added = 0;
  let skipped = 0;

  for (const van of coffeeVans) {
    // Check if already exists
    const existing = await db
      .select({ id: trucks.id })
      .from(trucks)
      .where(eq(trucks.name, van.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️  ${van.name} — already exists, skipping`);
      skipped++;
      continue;
    }

    console.log(`☕ Adding ${van.name}...`);

    // Get photo from Google Places
    const photoUrl = await getPlacePhoto(van.query);
    const location = await getPlaceLocation(van.query);

    const [newTruck] = await db
      .insert(trucks)
      .values({
        ownerUid: scoutUser.id,
        name: van.name,
        cuisine: van.cuisine,
        description: van.description,
        contactEmail: van.contactEmail,
        phone: van.phone || null,
        websiteUrl: van.website,
        imageUrl: photoUrl,
        tags: van.tags,
        isVisible: true,
        isOpen: false,
        lat: location?.lat || null,
        lng: location?.lng || null,
        address: location?.address || null,
      })
      .returning({ id: trucks.id, name: trucks.name });

    console.log(`  ✅ Added: ${newTruck.name} (${newTruck.id})`);
    if (photoUrl) console.log(`  📸 Photo: yes`);
    else console.log(`  📸 Photo: none found`);
    if (location) console.log(`  📍 Location: ${location.address}`);
    console.log('');
    added++;
  }

  console.log(`\n🏁 Done! Added ${added} coffee vans, skipped ${skipped} existing.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
