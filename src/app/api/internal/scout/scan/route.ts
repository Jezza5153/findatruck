/**
 * POST /api/internal/scout/scan?mode=priority|all
 * Trigger a scan of enabled sources.
 * Authenticated via CRON_SECRET header or admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runScanJob } from '@/lib/scout/jobs/run-job';

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function POST(request: NextRequest) {
  // Auth: cron secret or admin session
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  const isValidCron = cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get('mode') as 'priority' | 'all') || 'all';

  try {
    const result = await runScanJob(mode);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error('[scout/scan] Error:', error);
    return NextResponse.json(
      { error: 'Scan failed', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (Vercel cron sends GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}
