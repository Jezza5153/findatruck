/**
 * Cleanup test/junk trucks from the database.
 * 
 * Usage: npx tsx scripts/cleanup-test-trucks.ts
 * 
 * This script:
 * 1. Finds trucks with test-like names (test, trucktest, testruck, etc.)
 * 2. Prints them for review
 * 3. Deletes them (cascading to related records)
 * 4. Cleans up orphaned user records
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, ilike, or } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

const TEST_PATTERNS = [
  '%test%',
  '%demo%',
  '%sample%',
  '%example%',
  '%fake%',
  '%placeholder%',
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set. Add it to .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n🔍 Scanning for test/junk trucks...\n');

  // Find all trucks
  const allTrucks = await db.select().from(schema.trucks);

  console.log(`📊 Total trucks in database: ${allTrucks.length}\n`);

  // Identify test trucks by name pattern
  const testTrucks = allTrucks.filter(truck => {
    const name = truck.name.toLowerCase();
    return (
      name.includes('test') ||
      name.includes('demo') ||
      name.includes('sample') ||
      name.includes('example') ||
      name.includes('fake') ||
      name.includes('placeholder') ||
      name.length <= 3 // Very short names are likely test entries
    );
  });

  // Also flag trucks with zero useful data (no image, no description, no address)
  const emptyTrucks = allTrucks.filter(truck => {
    const isTestName = testTrucks.some(t => t.id === truck.id);
    if (isTestName) return false; // Already flagged

    const hasNoImage = !truck.imageUrl;
    const hasNoDescription = !truck.description || truck.description.length < 10;
    const hasNoAddress = !truck.address;
    const hasNoPhone = !truck.phone && !truck.ctaPhoneNumber;

    return hasNoImage && hasNoDescription && hasNoAddress && hasNoPhone;
  });

  // Print test trucks
  if (testTrucks.length > 0) {
    console.log('🗑️  TEST/JUNK TRUCKS (will be deleted):');
    console.log('─'.repeat(60));
    for (const truck of testTrucks) {
      console.log(`  ❌ "${truck.name}" (${truck.cuisine})`);
      console.log(`     ID: ${truck.id}`);
      console.log(`     Image: ${truck.imageUrl || 'NONE'}`);
      console.log(`     Description: ${truck.description?.substring(0, 50) || 'NONE'}`);
      console.log('');
    }
  } else {
    console.log('✅ No test trucks found!\n');
  }

  // Print empty trucks 
  if (emptyTrucks.length > 0) {
    console.log('\n⚠️  VERY INCOMPLETE TRUCKS (keeping but flagging):');
    console.log('─'.repeat(60));
    for (const truck of emptyTrucks) {
      console.log(`  ⚠️  "${truck.name}" (${truck.cuisine})`);
      console.log(`     ID: ${truck.id}`);
      console.log(`     Missing: image, description, address, phone`);
      console.log('');
    }
  }

  // Print real trucks
  const realTrucks = allTrucks.filter(
    t => !testTrucks.some(tt => tt.id === t.id)
  );
  if (realTrucks.length > 0) {
    console.log('\n✅ KEEPING THESE TRUCKS:');
    console.log('─'.repeat(60));
    for (const truck of realTrucks) {
      const completeness = calculateCompleteness(truck);
      console.log(`  ✅ "${truck.name}" (${truck.cuisine}) — ${completeness}% complete`);
      console.log(`     Image: ${truck.imageUrl ? '✅' : '❌'} | Address: ${truck.address ? '✅' : '❌'} | Description: ${truck.description ? '✅' : '❌'}`);
      console.log('');
    }
  }

  // Delete test trucks
  if (testTrucks.length > 0) {
    console.log(`\n🔥 Deleting ${testTrucks.length} test truck(s)...\n`);

    for (const truck of testTrucks) {
      // Delete the truck (cascades to menu items, orders, etc.)
      await db.delete(schema.trucks).where(eq(schema.trucks.id, truck.id));
      console.log(`  🗑️  Deleted "${truck.name}"`);

      // Clean up the owner's truckId reference
      await db
        .update(schema.users)
        .set({ truckId: null })
        .where(eq(schema.users.truckId, truck.id));
    }

    console.log('\n✅ Cleanup complete!');
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Before: ${allTrucks.length} trucks`);
  console.log(`   Deleted: ${testTrucks.length} test trucks`);
  console.log(`   Remaining: ${allTrucks.length - testTrucks.length} trucks`);
  console.log(`   Incomplete: ${emptyTrucks.length} trucks need attention\n`);
}

function calculateCompleteness(truck: any): number {
  let score = 0;
  if (truck.imageUrl) score += 20;
  if (truck.description && truck.description.length >= 50) score += 15;
  if (truck.address) score += 20;
  if (truck.phone || truck.ctaPhoneNumber) score += 10;
  if (truck.instagramHandle || truck.facebookHandle || truck.tiktokHandle) score += 5;
  if (truck.regularHours || truck.operatingHoursSummary) score += 10;
  // Menu items need a separate query, so we skip here (20 pts)
  // Give partial credit for existing description even if short
  if (truck.description && truck.description.length > 0 && truck.description.length < 50) score += 5;
  return score;
}

main().catch(console.error);
