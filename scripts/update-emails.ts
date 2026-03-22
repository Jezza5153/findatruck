import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const EMAILS_ROUND2: Record<string, string> = {
  'Baltic Fine Food': 'balticfinefood@gmail.com',
  'Bellachino Coffee Van': 'george@bellachinocoffee.com',
  'Spuds & More Mobile Catering': 'spudsandmoresa@gmail.com',
  'Moorish Bites': 'moorishbites@gmail.com',
};

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  
  let updated = 0;
  for (const [name, email] of Object.entries(EMAILS_ROUND2)) {
    const result = await sql(
      'UPDATE trucks SET contact_email = $1 WHERE name = $2 AND (contact_email IS NULL OR contact_email = $3) RETURNING name',
      [email, name, '']
    );
    if (result.length > 0) {
      console.log('✅ ' + name + ' → ' + email);
      updated++;
    } else {
      console.log('⏭️  ' + name + ' — already has email or not found');
    }
  }
  
  console.log('\nUpdated ' + updated + ' trucks');
  
  // Final status
  const all = await sql('SELECT name, contact_email, phone, instagram_handle, facebook_handle FROM trucks ORDER BY name');
  const withEmail = all.filter((t: any) => t.contact_email);
  const noEmail = all.filter((t: any) => !t.contact_email);
  
  console.log('\n=== FINAL STATUS ===');
  console.log('Total: ' + all.length);
  console.log('With email: ' + withEmail.length);
  console.log('Missing email: ' + noEmail.length);
  
  if (noEmail.length > 0) {
    console.log('\n--- STILL MISSING ---');
    noEmail.forEach((t: any) => {
      const contacts: string[] = [];
      if (t.phone) contacts.push('ph: ' + t.phone);
      if (t.instagram_handle) contacts.push('ig: ' + t.instagram_handle);
      if (t.facebook_handle) contacts.push('fb: ' + t.facebook_handle);
      console.log('  ' + t.name + ' | ' + (contacts.length ? contacts.join(' | ') : 'NO CONTACT'));
    });
  }
}

main().catch(e => { console.error(e); process.exit(1); });
