/**
 * Authorization helpers for multi-tenant isolation
 * Ensures owners can only access their own resources
 * Supports multi-user truck access via truck_members table
 */

import { db } from '@/lib/db';
import { trucks, users, truckMembers, type TruckMemberRole } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type UserRole = 'customer' | 'owner' | 'admin';

export interface AuthContext {
    userId: string;
    role: UserRole;
    truckId?: string;
}

/**
 * Check if user owns a specific truck
 */
export async function userOwnsTruck(userId: string, truckId: string): Promise<boolean> {
    const [truck] = await db
        .select({ ownerUid: trucks.ownerUid })
        .from(trucks)
        .where(eq(trucks.id, truckId))
        .limit(1);

    return truck?.ownerUid === userId;
}

/**
 * Get user's truck ID
 */
export async function getUserTruckId(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user?.truckId || null;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    // Admin can access everything
    if (userRole === 'admin') return true;
    return requiredRoles.includes(userRole);
}

/**
 * Generate idempotency key for check-ins
 * Uses userId + truckId + date window to prevent duplicates
 */
export function generateCheckInIdempotencyKey(
    userId: string,
    truckId: string,
    windowHours: number = 4
): string {
    const now = new Date();
    // Create a time window bucket
    const windowMs = windowHours * 60 * 60 * 1000;
    const windowStart = Math.floor(now.getTime() / windowMs) * windowMs;
    return `checkin:${userId}:${truckId}:${windowStart}`;
}

/**
 * Log security event for audit trail
 */
export function logSecurityEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    role: UserRole,
    success: boolean,
    details?: Record<string, unknown>
): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        resource,
        resourceId,
        role,
        success,
        ...details,
    };

    // In production, send to logging service (DataDog, CloudWatch, etc.)
    if (process.env.NODE_ENV === 'production') {
        console.log(JSON.stringify(logEntry));
    } else {
        console.log('[SECURITY]', logEntry);
    }
}

/**
 * Validate impossible movement (anti-spoof)
 * Returns false if movement suggests spoofing
 */
export function validateMovement(
    prevLat: number,
    prevLng: number,
    prevTime: Date,
    newLat: number,
    newLng: number,
    newTime: Date,
    maxSpeedKmH: number = 200 // Max reasonable speed
): { valid: boolean; speedKmH: number } {
    // Calculate distance in km
    const R = 6371; // Earth's radius in km
    const dLat = ((newLat - prevLat) * Math.PI) / 180;
    const dLng = ((newLng - prevLng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevLat * Math.PI) / 180) *
        Math.cos((newLat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Calculate time difference in hours
    const timeHours = (newTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);

    if (timeHours <= 0) {
        return { valid: false, speedKmH: Infinity };
    }

    const speedKmH = distanceKm / timeHours;

    return {
        valid: speedKmH <= maxSpeedKmH,
        speedKmH: Math.round(speedKmH),
    };
}

// =====================
// MULTI-USER TRUCK ACCESS
// =====================

export interface TruckMembership {
    truckId: string;
    role: TruckMemberRole;
    isOwner: boolean;
}

/**
 * Get user's membership for a specific truck
 * Returns null if user has no access
 */
export async function getTruckMembership(
    userId: string,
    truckId: string
): Promise<TruckMembership | null> {
    // Check if user is the owner (legacy field)
    const [truck] = await db
        .select({ ownerUid: trucks.ownerUid })
        .from(trucks)
        .where(eq(trucks.id, truckId))
        .limit(1);

    if (truck?.ownerUid === userId) {
        return { truckId, role: 'owner', isOwner: true };
    }

    // Check truck_members table
    const [membership] = await db
        .select({ role: truckMembers.role })
        .from(truckMembers)
        .where(and(
            eq(truckMembers.truckId, truckId),
            eq(truckMembers.userId, userId)
        ))
        .limit(1);

    if (membership) {
        return {
            truckId,
            role: membership.role as TruckMemberRole,
            isOwner: membership.role === 'owner',
        };
    }

    return null;
}

/**
 * Check if user can access a truck (any role)
 */
export async function canAccessTruck(userId: string, truckId: string): Promise<boolean> {
    const membership = await getTruckMembership(userId, truckId);
    return membership !== null;
}

/**
 * Get all trucks a user has access to
 */
export async function getUserTrucks(userId: string): Promise<TruckMembership[]> {
    const result: TruckMembership[] = [];

    // Get owned trucks (legacy)
    const ownedTrucks = await db
        .select({ id: trucks.id })
        .from(trucks)
        .where(eq(trucks.ownerUid, userId));

    for (const t of ownedTrucks) {
        result.push({ truckId: t.id, role: 'owner', isOwner: true });
    }

    // Get trucks via membership
    const memberships = await db
        .select({ truckId: truckMembers.truckId, role: truckMembers.role })
        .from(truckMembers)
        .where(eq(truckMembers.userId, userId));

    for (const m of memberships) {
        // Avoid duplicates if user is both owner and member
        if (!result.find(r => r.truckId === m.truckId)) {
            result.push({
                truckId: m.truckId,
                role: m.role as TruckMemberRole,
                isOwner: m.role === 'owner',
            });
        }
    }

    return result;
}

/**
 * Check if user has required permission level for a truck
 * Permission hierarchy: owner > manager > staff
 */
export function hasPermission(
    userRole: TruckMemberRole,
    requiredRole: TruckMemberRole
): boolean {
    const roleOrder: Record<TruckMemberRole, number> = {
        owner: 3,
        manager: 2,
        staff: 1,
    };
    return roleOrder[userRole] >= roleOrder[requiredRole];
}

/**
 * Add a member to a truck (only owners can do this)
 */
export async function addTruckMember(
    truckId: string,
    userId: string,
    role: TruckMemberRole,
    invitedBy: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Verify inviter is owner
        const inviterMembership = await getTruckMembership(invitedBy, truckId);
        if (!inviterMembership || inviterMembership.role !== 'owner') {
            return { success: false, error: 'Only owners can add members' };
        }

        // Check if already a member
        const existing = await getTruckMembership(userId, truckId);
        if (existing) {
            return { success: false, error: 'User is already a member' };
        }

        // Add membership
        await db.insert(truckMembers).values({
            truckId,
            userId,
            role,
            invitedBy,
        });

        return { success: true };
    } catch (error) {
        console.error('[addTruckMember] Error:', error);
        return { success: false, error: 'Failed to add member' };
    }
}
