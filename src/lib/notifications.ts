import { db } from '@/lib/db';
import { notifications, users, trucks } from '@/lib/db/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';

/**
 * Notification trigger functions for various platform events.
 * These can be called from API routes, webhooks, or scheduled jobs.
 */

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

/**
 * Trigger notification when a truck goes live.
 * Notifies customers who have favorited this truck.
 */
export async function notifyTruckGoesLive(truckId: string) {
    try {
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) return { sent: 0 };

        // Find users who have favorited this truck
        const favoriteUsers = await db
            .select({ id: users.id, favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(sql`${users.favoriteTrucks}::jsonb @> ${JSON.stringify([truckId])}::jsonb`);

        // Create notifications
        const notificationPromises = favoriteUsers.map(user =>
            db.insert(notifications).values({
                userId: user.id,
                type: 'favorite_live',
                title: `${truck.name} is now open!`,
                message: truck.address || 'Check the map for their location',
                truckId: truck.id,
            })
        );

        await Promise.all(notificationPromises);

        return { sent: favoriteUsers.length };
    } catch (error) {
        console.error('notifyTruckGoesLive error:', error);
        return { sent: 0, error };
    }
}

/**
 * Trigger notification when a truck posts a new special/promotion.
 * Notifies customers who have favorited this truck.
 */
export async function notifyNewSpecial(truckId: string, specialTitle: string) {
    try {
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) return { sent: 0 };

        // Find users who have favorited this truck
        const favoriteUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(sql`${users.favoriteTrucks}::jsonb @> ${JSON.stringify([truckId])}::jsonb`);

        // Create notifications
        const notificationPromises = favoriteUsers.map(user =>
            db.insert(notifications).values({
                userId: user.id,
                type: 'special',
                title: `New special at ${truck.name}!`,
                message: specialTitle,
                truckId: truck.id,
            })
        );

        await Promise.all(notificationPromises);

        return { sent: favoriteUsers.length };
    } catch (error) {
        console.error('notifyNewSpecial error:', error);
        return { sent: 0, error };
    }
}

/**
 * Trigger proximity-based notifications.
 * Notifies users when a truck they've favorited is within their notification radius.
 * Typically called when a truck updates its location.
 */
export async function notifyNearbyFavorites(truckId: string, truckLat: number, truckLng: number) {
    try {
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) return { sent: 0 };

        // Get users who favorited this truck AND have location-based notifications enabled
        // Note: This requires user location to be stored (for now we skip this complexity)
        // In production, you'd use a push notification service with device location

        return { sent: 0, reason: 'Location-based notifications require push service integration' };
    } catch (error) {
        console.error('notifyNearbyFavorites error:', error);
        return { sent: 0, error };
    }
}

/**
 * Trigger notification when a customer unlocks a reward.
 */
export async function notifyRewardUnlocked(userId: string, truckId: string) {
    try {
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, truckId))
            .limit(1);

        if (!truck) return { sent: false };

        await db.insert(notifications).values({
            userId,
            type: 'reward_unlocked',
            title: 'Reward Unlocked! 🎉',
            message: `You've earned a free reward at ${truck.name}!`,
            truckId,
        });

        return { sent: true };
    } catch (error) {
        console.error('notifyRewardUnlocked error:', error);
        return { sent: false, error };
    }
}

/**
 * Trigger notification when an owner replies to a review.
 */
export async function notifyReviewReply(userId: string, truckId: string, truckName: string) {
    try {
        await db.insert(notifications).values({
            userId,
            type: 'order_update', // reusing type for now
            title: `${truckName} replied to your review`,
            message: 'Tap to see their response',
            truckId,
        });

        return { sent: true };
    } catch (error) {
        console.error('notifyReviewReply error:', error);
        return { sent: false, error };
    }
}

/**
 * Clean up old read notifications (older than 30 days).
 * Called by a scheduled job.
 */
export async function cleanupOldNotifications() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await db
            .delete(notifications)
            .where(
                and(
                    eq(notifications.isRead, true),
                    lte(notifications.createdAt, thirtyDaysAgo)
                )
            );

        return { deleted: result.rowCount };
    } catch (error) {
        console.error('cleanupOldNotifications error:', error);
        return { deleted: 0, error };
    }
}
