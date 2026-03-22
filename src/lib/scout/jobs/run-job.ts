/**
 * Job runner / dispatcher.
 * Maps job types to scanner functions and executes them.
 */

import { db } from '@/lib/db';
import { scoutSources, type ScoutSource } from '@/lib/db/schema/scout';
import { eq, and, lte } from 'drizzle-orm';
import { enqueueJob, claimJob, completeJob, failJob } from './enqueue-job';
import { scanRepo } from '../scanners/scan-repo';
import { scanRelease } from '../scanners/scan-release';
import { scanSearch } from '../scanners/scan-search';

export interface RunScanResult {
  jobId: string;
  mode: 'priority' | 'all';
  sourcesProcessed: number;
  repoResults: number;
  releaseResults: number;
  searchResults: number;
  errors: string[];
}

/**
 * Run the full scan pipeline for all enabled sources.
 * mode=priority: only sources with priority >= 70
 * mode=all: all enabled sources
 */
export async function runScanJob(mode: 'priority' | 'all' = 'all'): Promise<RunScanResult> {
  const jobId = await enqueueJob('scan_sources', { mode });
  await claimJob(jobId);

  const errors: string[] = [];
  let repoResults = 0;
  let releaseResults = 0;
  let searchResults = 0;

  try {
    // Load enabled sources
    let sources: ScoutSource[];

    if (mode === 'priority') {
      sources = await db
        .select()
        .from(scoutSources)
        .where(
          and(
            eq(scoutSources.enabled, true),
          )
        );
      // Filter to high-priority in code to avoid drizzle operator complexity
      sources = sources.filter((s) => s.priority >= 70);
    } else {
      sources = await db
        .select()
        .from(scoutSources)
        .where(eq(scoutSources.enabled, true));
    }

    // Group sources by type
    const repoSources = sources.filter((s) => s.sourceType === 'repo');
    const searchSources = sources.filter((s) => s.sourceType === 'search');

    // Scan repos
    for (const source of repoSources) {
      try {
        const result = await scanRepo(source);
        if (!result.skipped) repoResults++;
      } catch (err) {
        const msg = `repo scan failed for ${source.sourceKey}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[scout]`, msg);
        errors.push(msg);
      }
    }

    // Scan releases (for repoSources too)
    for (const source of repoSources) {
      try {
        const result = await scanRelease(source);
        if (!result.skipped) releaseResults++;
      } catch (err) {
        const msg = `release scan failed for ${source.sourceKey}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[scout]`, msg);
        errors.push(msg);
      }
    }

    // Scan search queries
    for (const source of searchSources) {
      try {
        const result = await scanSearch(source);
        if (!result.skipped) searchResults++;
      } catch (err) {
        const msg = `search scan failed for ${source.sourceKey}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[scout]`, msg);
        errors.push(msg);
      }
    }

    await completeJob(jobId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await failJob(jobId, msg);
    errors.push(msg);
  }

  return {
    jobId,
    mode,
    sourcesProcessed: repoResults + releaseResults + searchResults,
    repoResults,
    releaseResults,
    searchResults,
    errors,
  };
}
