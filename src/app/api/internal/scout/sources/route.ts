/**
 * GET/POST /api/internal/scout/sources
 * CRUD for managing scout sources. Admin only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scoutSources } from '@/lib/db/schema/scout';
import { eq, desc } from 'drizzle-orm';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return null;
  }
  return session;
}

/**
 * GET — List all sources
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sources = await db
    .select()
    .from(scoutSources)
    .orderBy(desc(scoutSources.priority), desc(scoutSources.createdAt));

  return NextResponse.json({ sources });
}

/**
 * POST — Create a new source
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    const { sourceType, sourceKey, url, label, category, priority, pollMode, metadata } = body;

    if (!sourceType || !sourceKey || !label || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceType, sourceKey, label, category' },
        { status: 400 }
      );
    }

    const [source] = await db
      .insert(scoutSources)
      .values({
        sourceType,
        sourceKey,
        url: url || null,
        label,
        category,
        priority: priority ?? 50,
        pollMode: pollMode ?? 'poll',
        metadata: metadata ?? {},
      })
      .returning();

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error('[scout/sources] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Update a source
 */
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing source id' }, { status: 400 });
    }

    const [source] = await db
      .update(scoutSources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scoutSources.id, id))
      .returning();

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ source });
  } catch (error) {
    console.error('[scout/sources] Update error:', error);
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

/**
 * DELETE — Remove a source
 */
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing source id' }, { status: 400 });
    }

    await db.delete(scoutSources).where(eq(scoutSources.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[scout/sources] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
