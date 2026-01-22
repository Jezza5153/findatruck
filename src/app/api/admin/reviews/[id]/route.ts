import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Admin check helper
async function isAdmin(userId: string): Promise<boolean> {
    const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.role === 'admin';
}

// PATCH: Update review moderation state
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { moderationState } = body;

        if (!['pending', 'approved', 'rejected', 'flagged'].includes(moderationState)) {
            return NextResponse.json({ error: 'Invalid moderation state' }, { status: 400 });
        }

        await db
            .update(reviews)
            .set({
                moderationState,
                updatedAt: new Date(),
            })
            .where(eq(reviews.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin update review error:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// DELETE: Delete a review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await db
            .delete(reviews)
            .where(eq(reviews.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete review error:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
