/**
 * GET /api/internal/scout/stats
 * Returns overview statistics for the Scout dashboard.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scoutSources, scoutDiscoveries, scoutJobs } from '@/lib/db/schema/scout';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Total and enabled sources
    const allSources = await db.select({ id: scoutSources.id, enabled: scoutSources.enabled }).from(scoutSources);
    const totalSources = allSources.length;
    const enabledSources = allSources.filter((s) => s.enabled).length;

    // Total and new discoveries
    const allDiscoveries = await db
      .select({ id: scoutDiscoveries.id, status: scoutDiscoveries.status })
      .from(scoutDiscoveries);
    const totalDiscoveries = allDiscoveries.length;
    const newDiscoveries = allDiscoveries.filter((d) => d.status === 'new').length;

    // Recent jobs (last 10)
    const recentJobs = await db
      .select({
        id: scoutJobs.id,
        jobType: scoutJobs.jobType,
        status: scoutJobs.status,
        createdAt: scoutJobs.createdAt,
      })
      .from(scoutJobs)
      .orderBy(desc(scoutJobs.createdAt))
      .limit(10);

    return NextResponse.json({
      totalSources,
      enabledSources,
      totalDiscoveries,
      newDiscoveries,
      recentJobs,
    });
  } catch (error) {
    console.error('[scout/stats] Error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
