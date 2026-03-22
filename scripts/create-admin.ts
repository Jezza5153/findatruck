/**
 * Create or update admin user for FoodTruckNext2Me.
 * Run: npx tsx scripts/create-admin.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@foodtrucknext2me.com';
const ADMIN_NAME = 'Jezza';
const ADMIN_PASSWORD = 'COOKS!';

async function createAdmin() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const db = drizzle(sql);

  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Check if user already exists
  const existing = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(users)
      .set({ role: 'admin', passwordHash, name: ADMIN_NAME })
      .where(eq(users.id, existing[0].id));
    console.log(`✅ Updated existing user (${existing[0].email}) to admin role.`);
  } else {
    await db
      .insert(users)
      .values({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash,
        role: 'admin',
      });
    console.log(`✅ Created new admin user: ${ADMIN_EMAIL}`);
  }

  console.log('\n📋 Login details:');
  console.log(`  URL:       https://foodtrucknext2me.com/login`);
  console.log(`  Email:     ${ADMIN_EMAIL}`);
  console.log(`  Password:  ${ADMIN_PASSWORD}`);
  console.log(`  Dashboard: https://foodtrucknext2me.com/admin`);

  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
