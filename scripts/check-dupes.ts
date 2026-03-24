import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { trucks } from './src/lib/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const all = await db.select({ id: trucks.id, name: trucks.name, cuisine: trucks.cuisine }).from(trucks);

// Check for similar names (first 10 alphanumeric chars)
const groups = new Map<string, typeof all>();
for (const t of all) {
  const norm = t.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  if (!groups.has(norm)) groups.set(norm, []);
  groups.get(norm)!.push(t);
}

let found = false;
for (const [, g] of groups) {
  if (g.length > 1) {
    found = true;
    console.log('Similar names:');
    g.forEach(t => console.log('  ' + t.name + ' | ' + t.cuisine + ' | ' + t.id));
    console.log('');
  }
}

if (!found) console.log('No similar names found.');

// Also print all truck names sorted for manual review
console.log('\n--- All trucks (sorted) ---');
all.sort((a, b) => a.name.localeCompare(b.name));
all.forEach(t => console.log(t.name + ' | ' + t.cuisine));
console.log('\nTotal:', all.length);

process.exit(0);
