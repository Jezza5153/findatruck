-- Migration: Add performance indexes
-- Run after npm run db:push

-- Geo index for fast location queries (bounding box)
CREATE INDEX IF NOT EXISTS idx_trucks_location ON trucks(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Open trucks query optimization
CREATE INDEX IF NOT EXISTS idx_trucks_open ON trucks(is_open, is_visible) WHERE is_visible = true;

-- Featured trucks query
CREATE INDEX IF NOT EXISTS idx_trucks_featured ON trucks(is_featured, is_visible) WHERE is_visible = true;

-- Check-in dedupe (critical for concurrency)
CREATE UNIQUE INDEX IF NOT EXISTS check_in_keys_dedupe ON check_in_keys(user_id, truck_id, window_bucket);

-- Stripe event lookup
-- Already has PK on event_id

-- User truck lookup for owner dashboard
CREATE INDEX IF NOT EXISTS idx_users_truck ON users(truck_id) WHERE truck_id IS NOT NULL;

-- Check-ins by user (loyalty queries)
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id, created_at DESC);

-- Specials by truck with date filtering
CREATE INDEX IF NOT EXISTS idx_specials_truck_active ON specials(truck_id, end_date) WHERE end_date > NOW();
