/**
 * POST /api/internal/scout/webhooks/github
 * GitHub webhook receiver.
 * Verifies HMAC signature, stores raw event, converts to discoveries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoutWebhookEvents, scoutDiscoveries, scoutSources } from '@/lib/db/schema/scout';
import { verifyWebhookSignature } from '@/lib/github/webhooks';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const eventName = request.headers.get('x-github-event') ?? 'unknown';
  const deliveryId = request.headers.get('x-github-delivery');

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const actionName = payload.action ?? null;
  const repoFullName = payload.repository?.full_name ?? null;

  // Store raw event
  const [event] = await db
    .insert(scoutWebhookEvents)
    .values({
      deliveryId,
      eventName,
      actionName,
      repoFullName,
      payload,
      processed: false,
    })
    .returning({ id: scoutWebhookEvents.id });

  // Process relevant events into discoveries
  try {
    if (eventName === 'release' && actionName === 'published' && repoFullName) {
      const release = payload.release;
      if (release && !release.draft && !release.prerelease) {
        const externalId = `webhook:release:${repoFullName}:${release.id}`;

        // Check for duplicate
        const existing = await db
          .select({ id: scoutDiscoveries.id })
          .from(scoutDiscoveries)
          .where(eq(scoutDiscoveries.externalId, externalId))
          .limit(1);

        if (existing.length === 0) {
          // Find matching source
          const [source] = await db
            .select({ id: scoutSources.id })
            .from(scoutSources)
            .where(eq(scoutSources.sourceKey, repoFullName))
            .limit(1);

          await db.insert(scoutDiscoveries).values({
            sourceId: source?.id ?? null,
            discoveryType: 'release',
            externalId,
            repoFullName,
            title: `${repoFullName} ${release.tag_name}${release.name ? ` — ${release.name}` : ''}`,
            url: release.html_url,
            summaryRaw: release.body?.slice(0, 5000) ?? null,
            releasedAt: release.published_at ? new Date(release.published_at) : new Date(),
            payload: {
              tag_name: release.tag_name,
              release_name: release.name,
              author: release.author?.login,
              via: 'webhook',
            },
            status: 'new',
          });
        }
      }
    }

    if (eventName === 'push' && repoFullName) {
      // For push events, we note the activity but don't create a full discovery
      // unless it's a significant push (many commits)
      const commitCount = payload.commits?.length ?? 0;
      if (commitCount >= 5) {
        const externalId = `webhook:push:${repoFullName}:${payload.after?.slice(0, 8)}`;

        const existing = await db
          .select({ id: scoutDiscoveries.id })
          .from(scoutDiscoveries)
          .where(eq(scoutDiscoveries.externalId, externalId))
          .limit(1);

        if (existing.length === 0) {
          const [source] = await db
            .select({ id: scoutSources.id })
            .from(scoutSources)
            .where(eq(scoutSources.sourceKey, repoFullName))
            .limit(1);

          await db.insert(scoutDiscoveries).values({
            sourceId: source?.id ?? null,
            discoveryType: 'commit_cluster',
            externalId,
            repoFullName,
            title: `${repoFullName}: ${commitCount} commits pushed`,
            url: payload.compare ?? `https://github.com/${repoFullName}`,
            summaryRaw: payload.commits
              ?.slice(0, 10)
              .map((c: any) => `- ${c.message?.split('\n')[0]}`)
              .join('\n') ?? null,
            payload: {
              ref: payload.ref,
              commit_count: commitCount,
              pusher: payload.pusher?.name,
              via: 'webhook',
            },
            status: 'new',
          });
        }
      }
    }

    // Mark as processed
    await db
      .update(scoutWebhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(scoutWebhookEvents.id, event.id));

  } catch (error) {
    console.error('[webhook] Processing error:', error);
    // Don't fail the response — we already stored the raw event
  }

  return NextResponse.json({ ok: true, eventId: event.id });
}
