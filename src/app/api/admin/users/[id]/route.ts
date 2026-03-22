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

// PATCH: Update user role (admin can change customer <-> owner only)
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
            // Only allow customer <-> owner. Nobody can be made admin via the UI.
            if (!['customer', 'owner'].includes(body.role)) {
                return NextResponse.json({ error: 'Can only set role to customer or owner' }, { status: 400 });
            }
            updates.role = body.role;
        }

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

// DELETE: Remove a user (admin only, cannot delete self or other admins)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Cannot delete yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete own account' }, { status: 400 });
        }

        // Cannot delete other admins
        const [target] = await db
            .select({ role: users.role, email: users.email })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!target) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (target.role === 'admin') {
            return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 400 });
        }

        await db.delete(users).where(eq(users.id, id));

        return NextResponse.json({ success: true, message: `Deleted user ${target.email}` });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
