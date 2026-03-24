/**
 * Clean up bad entries from the food truck scout.
 * Removes wineries, chain stores, markets, and entries with junk emails.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { trucks } from '../src/lib/db/schema';
import { eq, or, inArray, ilike } from 'drizzle-orm';

const JUNK_EMAILS = [
  'hi@mystore.com',
  'example@example.com',
  'example@mysite.com',
  'John@example.com',
  'user@domain.com',
];

// Not food trucks — wineries, cellar doors, visitor centres, chain franchise HQs, markets, restaurants
const BAD_NAMES = [
  'Adelaide Central Market',
  'Central Market Gourmet',
  'McLaren Vale and Fleurieu Coast Visitor Centre',
  'Mollydooker Wines',
  'Hastwell & Lightfoot | Cellar Door & Winery',
  'Vine Shed Venue & Cellar Door',
  'CLINK at Tintara',
  'Penny Red Beer Co',
  'Shifty Lizard Brewing Co.',
  'Gelatissimo Rundle St',
  'Koko Black - Rundle Mall (Adelaide)',
  'San Churro Rundle St',
  'EAT Pulteney Street',
  'The Big Grill / Adelaide Convenience',
  'Oakberry Acai Glenelg',
  'Le Souk',
  'Daebak Brothers',
  'The Honest Cook',
  'Kebab Canteen',
  'Dumpling Deli',
  'Mouthfuls---Cold Pressed Juice, Acai Bowl, Organic coffee, Healthy Food',
  'SeaWave Bistro',
  'Waffle King',
  'Sit Lo',
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  let removed = 0;

  // Remove entries with junk emails
  for (const email of JUNK_EMAILS) {
    const result = await db.delete(trucks).where(eq(trucks.contactEmail, email)).returning({ id: trucks.id, name: trucks.name });
    for (const r of result) {
      console.log(`🗑️  Removed (junk email): ${r.name}`);
      removed++;
    }
  }

  // Remove bad names
  for (const name of BAD_NAMES) {
    const result = await db.delete(trucks).where(eq(trucks.name, name)).returning({ id: trucks.id, name: trucks.name });
    for (const r of result) {
      console.log(`🗑️  Removed (not a truck): ${r.name}`);
      removed++;
    }
  }

  // Remove any with .png in email (scraped image filenames)
  const pngEmails = await db.delete(trucks).where(ilike(trucks.contactEmail, '%.png')).returning({ id: trucks.id, name: trucks.name });
  for (const r of pngEmails) {
    console.log(`🗑️  Removed (.png email): ${r.name}`);
    removed++;
  }

  console.log(`\n✅ Cleaned up ${removed} bad entries.`);

  // Count remaining
  const remaining = await db.select({ id: trucks.id }).from(trucks);
  console.log(`📊 Total trucks on platform: ${remaining.length}`);
  
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
