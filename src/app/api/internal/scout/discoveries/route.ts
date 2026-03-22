/**
 * GET /api/internal/scout/discoveries
 * Returns all discoveries, most recent first.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scoutDiscoveries, scoutSources } from '@/lib/db/schema/scout';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const discoveries = await db
      .select({
        id: scoutDiscoveries.id,
        discoveryType: scoutDiscoveries.discoveryType,
        repoFullName: scoutDiscoveries.repoFullName,
        title: scoutDiscoveries.title,
        url: scoutDiscoveries.url,
        stars: scoutDiscoveries.stars,
        forks: scoutDiscoveries.forks,
        language: scoutDiscoveries.language,
        licenseSpdx: scoutDiscoveries.licenseSpdx,
        status: scoutDiscoveries.status,
        pushedAt: scoutDiscoveries.pushedAt,
        releasedAt: scoutDiscoveries.releasedAt,
        createdAt: scoutDiscoveries.createdAt,
      })
      .from(scoutDiscoveries)
      .orderBy(desc(scoutDiscoveries.createdAt))
      .limit(200);

    return NextResponse.json({ discoveries });
  } catch (error) {
    console.error('[scout/discoveries] Error:', error);
    return NextResponse.json({ error: 'Failed to load discoveries' }, { status: 500 });
  }
}
