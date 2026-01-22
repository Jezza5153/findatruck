-- Migration: Add idempotency tables and unique constraints
-- Run after npm run db:push or add to migrations

-- Stripe webhook idempotency (already has PK constraint via eventId)
-- Table created by schema push

-- Check-in idempotency: unique constraint to prevent double stamps under concurrency
CREATE UNIQUE INDEX IF NOT EXISTS check_in_keys_dedupe 
ON check_in_keys(user_id, truck_id, window_bucket);

-- Note on the pattern:
-- 1. Before check-in: INSERT INTO check_in_keys (user_id, truck_id, window_bucket)
-- 2. If unique violation (23505): return 409 "Already checked in this window"
-- 3. If success: proceed with check-in, then UPDATE check_in_keys SET check_in_id = ?
