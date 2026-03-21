/**
 * Seed Adelaide food trucks from publicly available data.
 *
 * Usage: npx tsx scripts/seed-adelaide-trucks.ts
 *
 * Creates truck profiles with complete data (descriptions, contact info,
 * social handles, etc.) and populates the event_sightings table.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

// ─── Truck Data ────────────────────────────────────────────────
interface TruckSeed {
  name: string;
  cuisine: string;
  description: string;
  phone?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  tiktokHandle?: string;
  address?: string;
  tags?: string[];
  imageUrl?: string;
  events?: string[]; // Event names this truck has been spotted at
}

const TRUCKS: TruckSeed[] = [
  // ─── Argentinian ─────────────────────────────────────────────
  {
    name: 'Chimichurri Grill',
    cuisine: 'Argentinian',
    description: 'Recognised as one of Adelaide\'s top food trucks, Chimichurri Grill serves delicious, authentic Argentinian dishes. From tender steaks to choripán and empanadas, every dish is packed with smoky, South American flavour using locally sourced SA produce.',
    phone: '0434 993 061',
    websiteUrl: 'https://chimichurrigrill.com.au',
    instagramHandle: 'chimichurrigrill',
    facebookHandle: 'ChimiGrill',
    address: 'Adelaide, South Australia',
    tags: ['argentinian', 'grill', 'steak', 'empanadas', 'catering', 'weddings'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Tasting Australia'],
  },

  // ─── Mexican ─────────────────────────────────────────────────
  {
    name: 'El Guaco Taco',
    cuisine: 'Mexican',
    description: 'Adelaide\'s premier Mexican food truck. El Guaco is all about delicious, fresh, and colourful soft shell tacos and crunchy nachos. Bold flavours, generous portions, and a fiesta on every plate.',
    phone: '0434 993 061',
    websiteUrl: 'https://elguacotaco.au',
    instagramHandle: 'elguacotacoadl',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'tacos', 'nachos', 'street-food', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Gluttony'],
  },
  {
    name: 'Taco Cartel',
    cuisine: 'Mexican',
    description: 'Taco Cartel makes Mexican for everyone! Their entire menu is gluten, dairy, and nut free — so everyone can enjoy delicious street eats. Perfect for corporate events, weddings, and Adelaide\'s major festivals.',
    websiteUrl: 'https://tacocartelaus.com.au',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'gluten-free', 'dairy-free', 'nut-free', 'inclusive', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Ice Cream & Desserts ────────────────────────────────────
  {
    name: "What's The Scoop",
    cuisine: 'Desserts',
    description: 'A classic international ice cream truck that\'s always a fan favourite. What\'s The Scoop is the perfect dessert option for any event — scooping joy across Adelaide with premium flavours and a vintage truck vibe.',
    phone: '0434 993 061',
    websiteUrl: 'https://whatsthescoop.com.au',
    facebookHandle: 'WhatstheScoopAdelaide',
    address: 'Adelaide, South Australia',
    tags: ['ice-cream', 'desserts', 'gelato', 'catering', 'weddings', 'vintage'],
    events: ['Food Truck Carnivale', 'Gluttony'],
  },
  {
    name: '48 Flavours',
    cuisine: 'Desserts',
    description: 'Adelaide\'s beloved gelato institution. 48 Flavours serves artisanal gelato and sorbets using real fruit, premium chocolate, and local ingredients. A Fringe and festival regular with a cult following.',
    address: 'Adelaide, South Australia',
    tags: ['gelato', 'sorbet', 'desserts', 'artisan', 'local'],
    events: ['Gluttony', 'Adelaide Fringe', 'Garden of Unearthly Delights'],
  },

  // ─── Asian ──────────────────────────────────────────────────
  {
    name: 'Sookii La La',
    cuisine: 'Asian',
    description: 'Asian-inspired street food that brings bold flavours and vibrant dishes to Adelaide. From steaming bowls to loaded bao buns, Sookii La La is a Gluttony staple and one of SA\'s most popular festival food trucks.',
    phone: '0432 274 618',
    websiteUrl: 'https://sookiilala.com.au',
    address: 'Adelaide, South Australia',
    tags: ['asian', 'street-food', 'bao', 'noodles', 'festival'],
    events: ['Gluttony', 'Adelaide Fringe', 'Lucky Dumpling Market'],
  },
  {
    name: 'Moi An Viet Street Food Co',
    cuisine: 'Vietnamese',
    description: 'Mời Ăn means "please eat" in Vietnamese — and that\'s exactly what they\'re about. Authentic Vietnamese street food including phở, bánh mì, and fresh rice paper rolls, all made with love and traditional recipes.',
    websiteUrl: 'https://moianstreetfood.com',
    address: 'Adelaide, South Australia',
    tags: ['vietnamese', 'pho', 'banh-mi', 'street-food', 'asian'],
    events: ['Food Truck Carnivale', 'Lucky Dumpling Market', 'Fork on the Road'],
  },
  {
    name: 'Bao+',
    cuisine: 'Asian',
    description: 'Fluffy steamed bao buns filled with creative, flavour-packed combinations. From classic pork belly to modern fusion fillings, Bao+ brings the best of Taiwanese street food to Adelaide festivals and events.',
    address: 'Adelaide, South Australia',
    tags: ['bao', 'asian', 'taiwanese', 'street-food', 'steamed-buns'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },

  // ─── Pizza ──────────────────────────────────────────────────
  {
    name: 'La Mia Luna Pizza',
    cuisine: 'Italian',
    description: 'Authentic, hand-stretched, woodfire-style pizza made with the freshest ingredients sourced mostly from SA local suppliers. La Mia Luna brings the warmth and flavour of traditional Italian pizza to every event.',
    phone: '0493 618 235',
    websiteUrl: 'https://lamialuna.com.au',
    address: 'Adelaide, South Australia',
    tags: ['pizza', 'italian', 'woodfire', 'handmade', 'local-produce'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },
  {
    name: 'DoughBalls Pizza & Catering',
    cuisine: 'Italian',
    description: 'Wood-fired pizza and indulgent desserts from multiple Adelaide locations. DoughBalls brings the authentic taste of Italian street food with a mobile wood-fired oven that cranks out perfectly blistered pizzas at events and private functions.',
    phone: '0499 777 454',
    websiteUrl: 'https://doughballspizza.com.au',
    address: 'Glenelg, South Australia',
    tags: ['pizza', 'italian', 'woodfire', 'desserts', 'catering'],
    events: ['Food Truck Carnivale', 'Tasting Australia'],
  },

  // ─── Burgers ────────────────────────────────────────────────
  {
    name: 'Daisy Burger',
    cuisine: 'Burgers',
    description: 'Juicy, no-nonsense smash burgers built for maximum flavour. Daisy Burger is Adelaide\'s go-to mobile burger truck for festivals, weddings, and corporate events. Simple ingredients, perfect execution.',
    phone: '0415 179 139',
    websiteUrl: 'https://daisyburger.com.au',
    instagramHandle: 'daisyburgercatering',
    address: 'Adelaide, South Australia',
    tags: ['burgers', 'smash-burgers', 'catering', 'weddings', 'events'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Jaffles & Comfort Food ──────────────────────────────────
  {
    name: "Jarrod's Jaffles",
    cuisine: 'Australian',
    description: 'Gourmet jaffles and toasties elevated to an art form. From classic cheese and ham to wild creations with brioche bread desserts, Jarrod\'s Jaffles is a uniquely Australian food truck experience loved at festivals across SA.',
    phone: '0400 921 861',
    websiteUrl: 'https://jarrodsjaffles.com.au',
    address: 'Adelaide, South Australia',
    tags: ['jaffles', 'toasties', 'australian', 'comfort-food', 'catering'],
    events: ['Food Truck Carnivale', 'Tasting Australia', 'Fork on the Road'],
  },

  // ─── Grilled Cheese ──────────────────────────────────────────
  {
    name: 'Cheesy Street',
    cuisine: 'American',
    description: 'Epic loaded grilled cheese sandwiches that have earned a spot among Australia\'s top 50 best sandwiches. From The Notorious P.I.G. with slow-cooked BBQ pulled pork to The Mac Attack, Cheesy Street is pure comfort.',
    websiteUrl: 'https://cheesystreet.com.au',
    instagramHandle: 'cheesystreetadl',
    address: 'Adelaide, South Australia',
    tags: ['grilled-cheese', 'sandwiches', 'comfort-food', 'american', 'festival'],
    events: ['Gluttony', 'Adelaide Fringe', 'Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── German ──────────────────────────────────────────────────
  {
    name: 'Frites & Giggles',
    cuisine: 'European',
    description: 'Belgian-style frites (fries) served with an array of gourmet sauces and loaded toppings. Frites & Giggles brings the fun of European street food to Adelaide\'s biggest festivals with crispy, golden perfection.',
    address: 'Adelaide, South Australia',
    tags: ['fries', 'frites', 'belgian', 'european', 'festival', 'sauces'],
    events: ['Gluttony', 'Adelaide Fringe', 'Garden of Unearthly Delights'],
  },

  // ─── Gelato ──────────────────────────────────────────────────
  {
    name: 'Gelato Messina',
    cuisine: 'Desserts',
    description: 'Australia\'s most famous gelato brand, known for wildly creative flavours and limited-edition specials. Gelato Messina brings their cult-favourite scoops to Adelaide\'s biggest events and festivals.',
    websiteUrl: 'https://gelatomessina.com',
    instagramHandle: 'gelatomessina',
    address: 'Adelaide, South Australia',
    tags: ['gelato', 'desserts', 'premium', 'creative-flavours'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },
];

// ─── Adelaide Events ──────────────────────────────────────────
const ADELAIDE_EVENTS = [
  { name: 'Gluttony', location: 'Rymill Park / Murlawirrapurka', description: 'Adelaide Fringe\'s premier food precinct with 25+ vendors, pop-up restaurants, and bars.' },
  { name: 'Adelaide Fringe', location: 'Various venues across Adelaide', description: 'The world\'s second-largest annual arts festival, running Feb–Mar with food trucks throughout.' },
  { name: 'Food Truck Carnivale', location: 'Various parks across Adelaide', description: 'Free-entry family events featuring ~20 food trucks, live music, and carnival rides at locations across SA.' },
  { name: 'Fork on the Road', location: 'Various locations', description: 'South Australia\'s premier mobile food truck event series bringing together the best trucks.' },
  { name: 'Lucky Dumpling Market', location: 'Elder Park, Adelaide', description: 'Asian-inspired food festival with 25+ vendors, live music, and entertainment. Oct–Nov each year.' },
  { name: 'Tasting Australia', location: 'Various Adelaide venues', description: 'Major food and drink festival celebrating the best of Australian cuisine. May each year.' },
  { name: 'Garden of Unearthly Delights', location: 'Rundle Park, Adelaide', description: 'Fringe festival hub with carnival rides, live shows, and diverse food stalls. Feb–Mar.' },
  { name: 'Asia Oasis Street Food Festival', location: 'Glenelg Foreshore', description: '100+ authentic Asian dishes from 20+ vendors, with cultural performances and sunset beach bar.' },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set. Add it to .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n🚚 Seeding Adelaide food trucks...\n');

  // Step 1: Find or create a system user to own directory-listed trucks
  let [systemUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'directory@foodtrucknext2me.com'))
    .limit(1);

  if (!systemUser) {
    console.log('  📋 Creating system directory user...');
    [systemUser] = await db
      .insert(schema.users)
      .values({
        email: 'directory@foodtrucknext2me.com',
        name: 'FindATruck Directory',
        passwordHash: 'DIRECTORY_LISTING_NO_LOGIN',
        role: 'owner' as const,
      })
      .returning();
  }
  console.log(`  👤 System user: ${systemUser.email} (${systemUser.id})\n`);

  // Step 2: Check existing trucks to avoid duplicates
  const existingTrucks = await db.select().from(schema.trucks);
  const existingNames = new Set(existingTrucks.map(t => t.name.toLowerCase()));

  let created = 0;
  let skipped = 0;
  const createdTruckMap: Record<string, string> = {}; // name -> id

  for (const truckData of TRUCKS) {
    if (existingNames.has(truckData.name.toLowerCase())) {
      console.log(`  ⏭️  "${truckData.name}" already exists — skipping`);
      // Still track existing trucks for sighting linking
      const existing = existingTrucks.find(t => t.name.toLowerCase() === truckData.name.toLowerCase());
      if (existing) createdTruckMap[truckData.name] = existing.id;
      skipped++;
      continue;
    }

    const [newTruck] = await db
      .insert(schema.trucks)
      .values({
        ownerUid: systemUser.id,
        name: truckData.name,
        cuisine: truckData.cuisine,
        description: truckData.description,
        phone: truckData.phone || null,
        websiteUrl: truckData.websiteUrl || null,
        instagramHandle: truckData.instagramHandle || null,
        facebookHandle: truckData.facebookHandle || null,
        tiktokHandle: truckData.tiktokHandle || null,
        address: truckData.address || null,
        imageUrl: truckData.imageUrl || null,
        tags: truckData.tags || [],
        isVisible: true,
        isOpen: false,
      })
      .returning();

    createdTruckMap[truckData.name] = newTruck.id;
    console.log(`  ✅ Created "${truckData.name}" (${truckData.cuisine})`);
    created++;
  }

  console.log(`\n📊 TRUCKS: ${created} created, ${skipped} skipped`);
  console.log(`📊 Total trucks now: ${existingTrucks.length + created}\n`);

  // Step 3: Seed festival events
  console.log('🎪 Seeding festival events...\n');
  const eventMap: Record<string, string> = {}; // name -> id

  for (const eventData of ADELAIDE_EVENTS) {
    const slug = eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if already exists
    const [existing] = await db
      .select()
      .from(schema.festivalEvents)
      .where(eq(schema.festivalEvents.slug, slug))
      .limit(1);

    if (existing) {
      eventMap[eventData.name] = existing.id;
      console.log(`  ⏭️  "${eventData.name}" already exists`);
      continue;
    }

    const [newEvent] = await db
      .insert(schema.festivalEvents)
      .values({
        name: eventData.name,
        slug,
        location: eventData.location,
        description: eventData.description,
        isRecurring: true,
      })
      .returning();

    eventMap[eventData.name] = newEvent.id;
    console.log(`  ✅ Created event "${eventData.name}"`);
  }

  // Step 4: Create sightings (link trucks to events)
  console.log('\n🔗 Linking trucks to events...\n');
  let sightings = 0;

  for (const truckData of TRUCKS) {
    const truckId = createdTruckMap[truckData.name];
    if (!truckId || !truckData.events) continue;

    for (const eventName of truckData.events) {
      const eventId = eventMap[eventName];
      if (!eventId) continue;

      // Check if sighting already exists
      const existing = await db
        .select()
        .from(schema.festivalSightings)
        .where(eq(schema.festivalSightings.truckId, truckId))
        .limit(50);

      const alreadyLinked = existing.some(s => s.eventId === eventId && s.year === 2026);
      if (alreadyLinked) continue;

      await db.insert(schema.festivalSightings).values({
        truckId,
        eventId,
        year: 2026,
        confirmed: true,
      });
      sightings++;
    }
  }

  console.log(`  ✅ Created ${sightings} event sightings\n`);

  // Summary
  console.log('─'.repeat(60));
  console.log('📊 FINAL SUMMARY:');
  console.log(`   Trucks: ${created} new + ${skipped} existing = ${created + skipped} total`);
  console.log(`   Events: ${Object.keys(eventMap).length}`);
  console.log(`   Sightings: ${sightings}`);
  console.log('─'.repeat(60));
  console.log('');
}

main().catch(console.error);
