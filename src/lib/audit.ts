/**
 * Admin audit logging utilities
 * Tracks all admin mutations for governance
 */

import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

interface AuditContext {
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAdminAction(
    actorUserId: string,
    actorRole: 'customer' | 'owner' | 'admin',
    action: string,
    targetType: string,
    targetId: string,
    beforeState?: Record<string, unknown>,
    afterState?: Record<string, unknown>,
    context: AuditContext = {}
): Promise<void> {
    try {
        await db.insert(auditLogs).values({
            actorUserId,
            actorRole,
            action,
            targetType,
            targetId,
            beforeState,
            afterState,
            requestId: context.requestId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
        });

        console.log(`[Audit] ${actorRole}:${actorUserId} ${action} ${targetType}:${targetId}`);
    } catch (error) {
        // Log but don't fail the request
        console.error('[Audit] Failed to log action:', error);
    }
}

/**
 * Common admin actions for type safety
 */
export const AdminActions = {
    // User management
    UPDATE_USER_ROLE: 'update_user_role',
    DELETE_USER: 'delete_user',

    // Truck management
    VERIFY_TRUCK: 'verify_truck',
    UNVERIFY_TRUCK: 'unverify_truck',
    FEATURE_TRUCK: 'feature_truck',
    UNFEATURE_TRUCK: 'unfeature_truck',
    DELETE_TRUCK: 'delete_truck',

    // Review moderation
    APPROVE_REVIEW: 'approve_review',
    REJECT_REVIEW: 'reject_review',
    DELETE_REVIEW: 'delete_review',

    // System
    MANUAL_RECONCILE: 'manual_reconcile',
} as const;

export type AdminAction = typeof AdminActions[keyof typeof AdminActions];
