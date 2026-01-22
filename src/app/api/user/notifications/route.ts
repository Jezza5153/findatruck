import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET: List user's notifications
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, session.user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        const unreadCount = userNotifications.filter(n => !n.isRead).length;

        return NextResponse.json({
            notifications: userNotifications,
            unreadCount,
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH: Mark all as read or update specific notification
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { markAllRead, notificationId, isRead } = body;

        if (markAllRead) {
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(
                    and(
                        eq(notifications.userId, session.user.id),
                        eq(notifications.isRead, false)
                    )
                );
            return NextResponse.json({ success: true, message: 'All marked as read' });
        }

        if (notificationId) {
            await db
                .update(notifications)
                .set({ isRead: isRead ?? true })
                .where(
                    and(
                        eq(notifications.id, notificationId),
                        eq(notifications.userId, session.user.id)
                    )
                );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE: Delete a notification
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        await db
            .delete(notifications)
            .where(
                and(
                    eq(notifications.id, notificationId),
                    eq(notifications.userId, session.user.id)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
