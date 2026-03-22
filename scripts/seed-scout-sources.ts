/**
 * Seed script for OpenClaw Scout sources.
 * Run: npx tsx scripts/seed-scout-sources.ts
 *
 * Seeds 40+ initial sources across discovery categories
 * relevant to FoodTruckNext2Me.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { scoutSources } from '../src/lib/db/schema/scout';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface SeedSource {
  sourceType: string;
  sourceKey: string;
  label: string;
  category: string;
  priority: number;
  url?: string;
}

const SEED_SOURCES: SeedSource[] = [
  // ============================================
  // INFRA — Next.js ecosystem (high priority)
  // ============================================
  { sourceType: 'repo', sourceKey: 'vercel/next.js', label: 'Next.js', category: 'infra', priority: 90, url: 'https://github.com/vercel/next.js' },
  { sourceType: 'repo', sourceKey: 'vercel/ai', label: 'Vercel AI SDK', category: 'infra', priority: 80, url: 'https://github.com/vercel/ai' },
  { sourceType: 'repo', sourceKey: 'drizzle-team/drizzle-orm', label: 'Drizzle ORM', category: 'infra', priority: 85, url: 'https://github.com/drizzle-team/drizzle-orm' },
  { sourceType: 'repo', sourceKey: 'upstash/redis', label: 'Upstash Redis', category: 'infra', priority: 70, url: 'https://github.com/upstash/redis' },
  { sourceType: 'repo', sourceKey: 'neondatabase/neon', label: 'Neon Postgres', category: 'infra', priority: 75, url: 'https://github.com/neondatabase/neon' },

  // ============================================
  // MARKETPLACE — Directory / listing platforms
  // ============================================
  { sourceType: 'repo', sourceKey: 'directus/directus', label: 'Directus', category: 'marketplace', priority: 60, url: 'https://github.com/directus/directus' },
  { sourceType: 'repo', sourceKey: 'medusajs/medusa', label: 'Medusa Commerce', category: 'marketplace', priority: 65, url: 'https://github.com/medusajs/medusa' },
  { sourceType: 'repo', sourceKey: 'saleor/saleor', label: 'Saleor', category: 'marketplace', priority: 55, url: 'https://github.com/saleor/saleor' },

  // ============================================
  // SEO — Programmatic pages, geo, local
  // ============================================
  { sourceType: 'repo', sourceKey: 'vercel/next-sitemap', label: 'next-sitemap', category: 'seo', priority: 70 },
  { sourceType: 'repo', sourceKey: 'garmeeh/next-seo', label: 'next-seo', category: 'seo', priority: 70, url: 'https://github.com/garmeeh/next-seo' },

  // ============================================
  // TRUST — Reviews, moderation, verification
  // ============================================
  { sourceType: 'repo', sourceKey: 'discourse/discourse', label: 'Discourse (moderation patterns)', category: 'trust', priority: 55, url: 'https://github.com/discourse/discourse' },

  // ============================================
  // DATA — Geo, deduplication, address
  // ============================================
  { sourceType: 'repo', sourceKey: 'Turfjs/turf', label: 'Turf.js (geospatial)', category: 'data', priority: 65, url: 'https://github.com/Turfjs/turf' },
  { sourceType: 'repo', sourceKey: 'openlayers/openlayers', label: 'OpenLayers', category: 'data', priority: 50, url: 'https://github.com/openlayers/openlayers' },

  // ============================================
  // UX — UI patterns, form wizards, CTAs
  // ============================================
  { sourceType: 'repo', sourceKey: 'shadcn-ui/ui', label: 'shadcn/ui', category: 'ux', priority: 80, url: 'https://github.com/shadcn-ui/ui' },
  { sourceType: 'repo', sourceKey: 'react-hook-form/react-hook-form', label: 'React Hook Form', category: 'ux', priority: 65, url: 'https://github.com/react-hook-form/react-hook-form' },
  { sourceType: 'repo', sourceKey: 'pmndrs/zustand', label: 'Zustand', category: 'ux', priority: 55, url: 'https://github.com/pmndrs/zustand' },

  // ============================================
  // SECURITY — Auth, webhooks, image safety
  // ============================================
  { sourceType: 'repo', sourceKey: 'nextauthjs/next-auth', label: 'NextAuth.js', category: 'security', priority: 80, url: 'https://github.com/nextauthjs/next-auth' },
  { sourceType: 'repo', sourceKey: 'imgproxy/imgproxy', label: 'imgproxy', category: 'security', priority: 70, url: 'https://github.com/imgproxy/imgproxy' },
  { sourceType: 'repo', sourceKey: 'thumbor/thumbor', label: 'Thumbor (image proxy)', category: 'security', priority: 55, url: 'https://github.com/thumbor/thumbor' },

  // ============================================
  // CRO — Lead capture, conversion
  // ============================================
  { sourceType: 'repo', sourceKey: 'calcom/cal.com', label: 'Cal.com (booking patterns)', category: 'cro', priority: 70, url: 'https://github.com/calcom/cal.com' },
  { sourceType: 'repo', sourceKey: 'formbricks/formbricks', label: 'Formbricks (survey/lead)', category: 'cro', priority: 60, url: 'https://github.com/formbricks/formbricks' },

  // ============================================
  // SEARCH QUERIES — Targeted GitHub search
  // ============================================
  { sourceType: 'search', sourceKey: 'nextjs marketplace lead capture', label: 'Search: marketplace lead capture', category: 'cro', priority: 65 },
  { sourceType: 'search', sourceKey: 'nextjs review moderation', label: 'Search: review moderation', category: 'trust', priority: 65 },
  { sourceType: 'search', sourceKey: 'claim listing directory nextjs', label: 'Search: claim listing', category: 'marketplace', priority: 70 },
  { sourceType: 'search', sourceKey: 'image proxy nextjs cloudflare', label: 'Search: image proxy', category: 'security', priority: 65 },
  { sourceType: 'search', sourceKey: 'programmatic seo nextjs geo pages', label: 'Search: geo pages SEO', category: 'seo', priority: 75 },
  { sourceType: 'search', sourceKey: 'vendor dashboard nextjs marketplace', label: 'Search: vendor dashboard', category: 'marketplace', priority: 60 },
  { sourceType: 'search', sourceKey: 'food truck app nextjs', label: 'Search: food truck apps', category: 'marketplace', priority: 80 },
  { sourceType: 'search', sourceKey: 'service area radius geospatial nextjs', label: 'Search: service area radius', category: 'data', priority: 60 },
  { sourceType: 'search', sourceKey: 'nextjs webhook handler github', label: 'Search: webhook handlers', category: 'infra', priority: 55 },
  { sourceType: 'search', sourceKey: 'nextjs multi-step form wizard', label: 'Search: form wizards', category: 'cro', priority: 55 },
  { sourceType: 'search', sourceKey: 'nextjs cron job vercel scheduled', label: 'Search: cron patterns', category: 'infra', priority: 50 },
  { sourceType: 'search', sourceKey: 'patron review system badge trust', label: 'Search: trust badges', category: 'trust', priority: 55 },
  { sourceType: 'search', sourceKey: 'local seo directory listing nextjs', label: 'Search: local SEO directory', category: 'seo', priority: 70 },
  { sourceType: 'search', sourceKey: 'drizzle orm postgres pattern', label: 'Search: Drizzle patterns', category: 'infra', priority: 60 },
  { sourceType: 'search', sourceKey: 'nextjs marketplace stripe connect', label: 'Search: marketplace payments', category: 'marketplace', priority: 55 },
  { sourceType: 'search', sourceKey: 'review moderation ai spam detection', label: 'Search: review AI moderation', category: 'trust', priority: 60 },
  { sourceType: 'search', sourceKey: 'quote request form catering booking', label: 'Search: quote request forms', category: 'cro', priority: 65 },
  { sourceType: 'search', sourceKey: 'nextjs analytics dashboard recharts', label: 'Search: analytics dashboards', category: 'ux', priority: 50 },
  { sourceType: 'search', sourceKey: 'address normalization geocoding api', label: 'Search: address normalization', category: 'data', priority: 55 },
];

async function main() {
  console.log(`\n🐾 Seeding ${SEED_SOURCES.length} Scout sources...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const source of SEED_SOURCES) {
    try {
      await db.insert(scoutSources).values({
        sourceType: source.sourceType,
        sourceKey: source.sourceKey,
        url: source.url ?? (source.sourceType === 'repo' ? `https://github.com/${source.sourceKey}` : null),
        label: source.label,
        category: source.category,
        priority: source.priority,
        pollMode: 'poll',
        metadata: {},
      });
      console.log(`  ✅ ${source.label}`);
      inserted++;
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.message?.includes('unique')) {
        console.log(`  ⏭️  ${source.label} (already exists)`);
        skipped++;
      } else {
        console.error(`  ❌ ${source.label}:`, err?.message || err);
      }
    }
  }

  console.log(`\n✨ Done! Inserted: ${inserted}, Skipped: ${skipped}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
