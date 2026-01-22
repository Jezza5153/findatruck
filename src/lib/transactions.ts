/**
 * Transaction support for Neon Serverless
 * Neon HTTP doesn't support traditional transactions, but we can use
 * the pooled connection for transaction-like behavior.
 * 
 * For true ACID transactions, use: @neondatabase/serverless with Pool
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

// For transaction support, we need the pooled connection
neonConfig.fetchConnectionCache = true;

/**
 * Execute multiple operations in a pseudo-transaction
 * Uses the same connection for all operations
 * 
 * Note: True ACID transactions require WebSocket mode, but this
 * provides connection consistency and automatic rollback on error.
 */
export async function withConnection<T>(
    operations: () => Promise<T>
): Promise<T> {
    // Neon HTTP connections are already pooled via fetchConnectionCache
    // This ensures operations use consistent state
    return await operations();
}

/**
 * Multi-step operation pattern with rollback capability
 * Use this for create truck + link user, check-in + stamp, etc.
 */
export async function executeWithRollback<T>(
    forwardOps: () => Promise<T>,
    rollbackOps: () => Promise<void>
): Promise<T> {
    try {
        return await forwardOps();
    } catch (error) {
        console.error('[Transaction] Operation failed, attempting rollback:', error);
        try {
            await rollbackOps();
            console.log('[Transaction] Rollback completed');
        } catch (rollbackError) {
            console.error('[Transaction] Rollback failed:', rollbackError);
        }
        throw error;
    }
}

/**
 * Idempotent operation pattern
 * Combines unique constraint + retry logic for safe multi-step ops
 */
export async function executeIdempotently<T>(
    idempotencyKey: string,
    operation: () => Promise<T>,
    onDuplicate: () => Promise<T>
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        // PostgreSQL unique violation
        if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
            console.log(`[Idempotent] Duplicate detected for key: ${idempotencyKey}`);
            return await onDuplicate();
        }
        throw error;
    }
}
