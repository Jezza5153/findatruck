/**
 * Repo metadata scanner.
 * Fetches repo metadata from GitHub and upserts discoveries.
 */

import { db } from '@/lib/db';
import { scoutSources, scoutDiscoveries, type ScoutSource } from '@/lib/db/schema/scout';
import { getRepo } from '@/lib/github/client';
import { eq } from 'drizzle-orm';

export interface ScanRepoResult {
  sourceId: string;
  sourceKey: string;
  discoveryId: string | null;
  skipped: boolean;
  reason?: string;
}

/**
 * Scan a single repo source: fetch metadata and upsert a discovery record.
 */
export async function scanRepo(source: ScoutSource): Promise<ScanRepoResult> {
  const [owner, repo] = source.sourceKey.split('/');

  if (!owner || !repo) {
    return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: null, skipped: true, reason: 'invalid source_key format' };
  }

  const repoData = await getRepo(owner, repo);

  if (!repoData) {
    return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: null, skipped: true, reason: 'repo not found or API error' };
  }

  // Check if we already have a discovery for this repo
  const existing = await db
    .select({ id: scoutDiscoveries.id, pushedAt: scoutDiscoveries.pushedAt })
    .from(scoutDiscoveries)
    .where(eq(scoutDiscoveries.externalId, String(repoData.id)))
    .limit(1);

  const pushedAt = repoData.pushed_at ? new Date(repoData.pushed_at) : null;

  // Skip if nothing changed since last check
  if (existing.length > 0 && existing[0].pushedAt && pushedAt) {
    if (existing[0].pushedAt.getTime() >= pushedAt.getTime()) {
      // Update last_checked_at even if skipped
      await db
        .update(scoutSources)
        .set({ lastCheckedAt: new Date(), updatedAt: new Date() })
        .where(eq(scoutSources.id, source.id));

      return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: existing[0].id, skipped: true, reason: 'no changes since last check' };
    }
  }

  // Upsert discovery
  let discoveryId: string;

  if (existing.length > 0) {
    // Update existing discovery
    await db
      .update(scoutDiscoveries)
      .set({
        title: repoData.description || repoData.full_name,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        openIssues: repoData.open_issues_count,
        pushedAt,
        licenseSpdx: repoData.license?.spdx_id ?? null,
        language: repoData.language,
        payload: {
          topics: repoData.topics,
          archived: repoData.archived,
          default_branch: repoData.default_branch,
          owner_avatar: repoData.owner.avatar_url,
        },
        updatedAt: new Date(),
      })
      .where(eq(scoutDiscoveries.id, existing[0].id));
    discoveryId = existing[0].id;
  } else {
    // Insert new discovery
    const [inserted] = await db
      .insert(scoutDiscoveries)
      .values({
        sourceId: source.id,
        discoveryType: 'repo',
        externalId: String(repoData.id),
        repoFullName: repoData.full_name,
        title: repoData.description || repoData.full_name,
        url: repoData.html_url,
        summaryRaw: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        openIssues: repoData.open_issues_count,
        pushedAt,
        licenseSpdx: repoData.license?.spdx_id ?? null,
        language: repoData.language,
        payload: {
          topics: repoData.topics,
          archived: repoData.archived,
          default_branch: repoData.default_branch,
          owner_avatar: repoData.owner.avatar_url,
        },
        status: 'new',
      })
      .returning({ id: scoutDiscoveries.id });
    discoveryId = inserted.id;
  }

  // Update source last_checked_at
  await db
    .update(scoutSources)
    .set({ lastCheckedAt: new Date(), updatedAt: new Date() })
    .where(eq(scoutSources.id, source.id));

  return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId, skipped: false };
}
