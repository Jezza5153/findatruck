import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const updates = [
    { name: 'TaChs Stroopwafels', data: { facebookHandle: 'TaCHsStroopwafels', instagramHandle: 'tachsstroopwafels' } },
    { name: 'Sybill The Caravan', data: { instagramHandle: 'threeofcupsteahouse' } },
    { name: 'Yo-Gee Bar', data: { websiteUrl: 'https://www.yobar.com.au' } },
    { name: 'Bao+', data: { instagramHandle: 'baoplusadelaide' } },
    { name: 'Chocolate & Co', data: { instagramHandle: 'chocolateandcoadelaide' } },
  ];

  for (const u of updates) {
    const [truck] = await db.select().from(schema.trucks).where(eq(schema.trucks.name, u.name)).limit(1);
    if (!truck) { console.log('Not found:', u.name); continue; }
    await db.update(schema.trucks).set(u.data).where(eq(schema.trucks.id, truck.id));
    console.log('Updated:', u.name, Object.keys(u.data).join(', '));
  }
  console.log('Done!');
}

main().catch(console.error);
