import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const all = await sql('SELECT name, contact_email, phone, website_url, instagram_handle, facebook_handle FROM trucks ORDER BY name');
  
  console.log('=== ALL TRUCKS (' + all.length + ') ===\n');
  
  console.log('--- WITH EMAIL ---');
  const withEmail = all.filter((t: any) => t.contact_email);
  withEmail.forEach((t: any) => console.log(t.name + ' | ' + t.contact_email));
  console.log('Count: ' + withEmail.length + '\n');
  
  console.log('--- MISSING EMAIL ---');
  const noEmail = all.filter((t: any) => !t.contact_email);
  noEmail.forEach((t: any) => {
    const details: string[] = [];
    if (t.phone) details.push('phone: ' + t.phone);
    if (t.website_url) details.push('web: ' + t.website_url);
    if (t.instagram_handle) details.push('ig: ' + t.instagram_handle);
    if (t.facebook_handle) details.push('fb: ' + t.facebook_handle);
    console.log(t.name + ' | ' + (details.length ? details.join(' | ') : 'NO CONTACT'));
  });
  console.log('Count: ' + noEmail.length);
}

main().catch(e => { console.error(e); process.exit(1); });
