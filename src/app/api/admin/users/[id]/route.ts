import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
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

// PATCH: Update user (role, ban)
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

        // Prevent self-modification
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot modify own account' }, { status: 400 });
        }

        const body = await request.json();
        const updates: Record<string, unknown> = {};

        if (body.role !== undefined) {
            if (!['customer', 'owner', 'admin'].includes(body.role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }
            updates.role = body.role;
        }

        // For ban, we'd typically set a 'banned' field or delete
        // For now, just update role
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        updates.updatedAt = new Date();

        await db
            .update(users)
            .set(updates)
            .where(eq(users.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
