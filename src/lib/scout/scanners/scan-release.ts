/**
 * Release scanner.
 * Checks for new releases on watched repos and creates discoveries.
 */

import { db } from '@/lib/db';
import { scoutSources, scoutDiscoveries, type ScoutSource } from '@/lib/db/schema/scout';
import { getLatestRelease } from '@/lib/github/client';
import { eq, and } from 'drizzle-orm';

export interface ScanReleaseResult {
  sourceId: string;
  sourceKey: string;
  discoveryId: string | null;
  skipped: boolean;
  reason?: string;
  tagName?: string;
}

/**
 * Check for new releases on a repo source.
 */
export async function scanRelease(source: ScoutSource): Promise<ScanReleaseResult> {
  const [owner, repo] = source.sourceKey.split('/');

  if (!owner || !repo) {
    return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: null, skipped: true, reason: 'invalid source_key format' };
  }

  const release = await getLatestRelease(owner, repo);

  if (!release) {
    return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: null, skipped: true, reason: 'no releases found' };
  }

  if (release.draft || release.prerelease) {
    return { sourceId: source.id, sourceKey: source.sourceKey, discoveryId: null, skipped: true, reason: 'latest release is draft/prerelease' };
  }

  // Check if we already tracked this release
  const releaseExternalId = `release:${source.sourceKey}:${release.id}`;
  const existing = await db
    .select({ id: scoutDiscoveries.id })
    .from(scoutDiscoveries)
    .where(
      and(
        eq(scoutDiscoveries.externalId, releaseExternalId),
        eq(scoutDiscoveries.discoveryType, 'release')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      sourceId: source.id,
      sourceKey: source.sourceKey,
      discoveryId: existing[0].id,
      skipped: true,
      reason: 'release already tracked',
      tagName: release.tag_name,
    };
  }

  // Create new release discovery
  const releasedAt = release.published_at ? new Date(release.published_at) : new Date(release.created_at);

  const [inserted] = await db
    .insert(scoutDiscoveries)
    .values({
      sourceId: source.id,
      discoveryType: 'release',
      externalId: releaseExternalId,
      repoFullName: source.sourceKey,
      title: `${source.sourceKey} ${release.tag_name}${release.name ? ` — ${release.name}` : ''}`,
      url: release.html_url,
      summaryRaw: release.body ? release.body.slice(0, 5000) : null, // Cap release notes
      releasedAt,
      payload: {
        tag_name: release.tag_name,
        release_name: release.name,
        author: release.author.login,
      },
      status: 'new',
    })
    .returning({ id: scoutDiscoveries.id });

  return {
    sourceId: source.id,
    sourceKey: source.sourceKey,
    discoveryId: inserted.id,
    skipped: false,
    tagName: release.tag_name,
  };
}
