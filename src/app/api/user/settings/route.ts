import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET: Get user settings
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [user] = await db
            .select({
                notificationRadius: users.notificationRadius,
                cuisinePreferences: users.cuisinePreferences,
                dietaryTags: users.dietaryTags,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        // Return with defaults for settings not in DB
        return NextResponse.json({
            notificationRadius: user?.notificationRadius || 5,
            cuisinePreferences: user?.cuisinePreferences || [],
            dietaryTags: user?.dietaryTags || [],
            // Client-side settings (not stored in DB)
            truckNearbyAlerts: true,
            favoriteUpdates: true,
            specialsAlerts: true,
            orderUpdates: true,
            emailNotifications: false,
            pushNotifications: true,
        });
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PATCH: Update user settings
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const allowedFields = ['notificationRadius', 'cuisinePreferences', 'dietaryTags'];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
