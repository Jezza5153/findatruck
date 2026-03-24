/**
 * Find and remove duplicate trucks from the database.
 * Keeps the truck with the most data (description, image, etc.)
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { trucks } from '../src/lib/db/schema';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const allTrucks = await db
    .select({
      id: trucks.id,
      name: trucks.name,
      cuisine: trucks.cuisine,
      contactEmail: trucks.contactEmail,
      imageUrl: trucks.imageUrl,
      description: trucks.description,
      createdAt: trucks.createdAt,
    })
    .from(trucks);

  // Group by normalized name
  const groups = new Map<string, typeof allTrucks>();
  for (const truck of allTrucks) {
    const key = truck.name.toLowerCase().trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(truck);
  }

  let dupeCount = 0;
  const toDelete: string[] = [];

  for (const [name, group] of groups) {
    if (group.length <= 1) continue;
    dupeCount++;
    
    // Sort: prefer truck with image > description > earlier creation
    group.sort((a, b) => {
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      if (a.description && !b.description) return -1;
      if (!a.description && b.description) return 1;
      return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
    });

    const keep = group[0];
    const remove = group.slice(1);

    console.log(`\n🔍 Duplicate: "${keep.name}" (${group.length} copies)`);
    console.log(`   ✅ Keep: ${keep.id} (image: ${!!keep.imageUrl}, email: ${keep.contactEmail})`);
    for (const r of remove) {
      console.log(`   🗑️  Remove: ${r.id} (image: ${!!r.imageUrl}, email: ${r.contactEmail})`);
      toDelete.push(r.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('\n✅ No duplicates found!');
  } else {
    console.log(`\n📊 Found ${dupeCount} duplicate groups, ${toDelete.length} trucks to remove.`);
    
    // Delete duplicates
    const { eq } = await import('drizzle-orm');
    for (const id of toDelete) {
      await db.delete(trucks).where(eq(trucks.id, id));
    }
    console.log(`\n✅ Removed ${toDelete.length} duplicate trucks.`);
  }

  const remaining = await db.select({ id: trucks.id }).from(trucks);
  console.log(`📊 Total trucks remaining: ${remaining.length}`);
  
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
