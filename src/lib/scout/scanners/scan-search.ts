/**
 * Search-based scanner.
 * Executes GitHub repo search queries and creates discoveries for new results.
 */

import { db } from '@/lib/db';
import { scoutSources, scoutDiscoveries, type ScoutSource } from '@/lib/db/schema/scout';
import { searchRepos } from '@/lib/github/client';
import { eq, and } from 'drizzle-orm';

export interface ScanSearchResult {
  sourceId: string;
  sourceKey: string;
  newDiscoveries: number;
  totalResults: number;
  skipped: boolean;
  reason?: string;
}

/**
 * Run a GitHub repo search and create discoveries for new results.
 */
export async function scanSearch(source: ScoutSource): Promise<ScanSearchResult> {
  if (source.sourceType !== 'search') {
    return { sourceId: source.id, sourceKey: source.sourceKey, newDiscoveries: 0, totalResults: 0, skipped: true, reason: 'not a search source' };
  }

  const query = source.sourceKey; // For search sources, sourceKey IS the search query
  const perPage = (source.metadata as any)?.perPage ?? 10;

  const results = await searchRepos(query, perPage);

  if (results.total_count === 0) {
    // Update last_checked_at
    await db
      .update(scoutSources)
      .set({ lastCheckedAt: new Date(), updatedAt: new Date() })
      .where(eq(scoutSources.id, source.id));

    return { sourceId: source.id, sourceKey: source.sourceKey, newDiscoveries: 0, totalResults: 0, skipped: false };
  }

  let newCount = 0;

  for (const repo of results.items) {
    const externalId = `search:${String(repo.id)}`;

    // Check if already exists (from any source)
    const existing = await db
      .select({ id: scoutDiscoveries.id })
      .from(scoutDiscoveries)
      .where(eq(scoutDiscoveries.externalId, externalId))
      .limit(1);

    if (existing.length > 0) continue;

    // Skip archived repos
    if (repo.archived) continue;

    await db.insert(scoutDiscoveries).values({
      sourceId: source.id,
      discoveryType: 'repo',
      externalId,
      repoFullName: repo.full_name,
      title: repo.description || repo.full_name,
      url: repo.html_url,
      summaryRaw: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      licenseSpdx: repo.license?.spdx_id ?? null,
      language: repo.language,
      payload: {
        topics: repo.topics,
        archived: repo.archived,
        default_branch: repo.default_branch,
        owner_avatar: repo.owner.avatar_url,
        search_query: query,
      },
      status: 'new',
    });

    newCount++;
  }

  // Update source last_checked_at
  await db
    .update(scoutSources)
    .set({ lastCheckedAt: new Date(), updatedAt: new Date() })
    .where(eq(scoutSources.id, source.id));

  return {
    sourceId: source.id,
    sourceKey: source.sourceKey,
    newDiscoveries: newCount,
    totalResults: results.total_count,
    skipped: false,
  };
}
