# Backup Restore Drill - FindATruck

## Prerequisites

- Neon Console access: https://console.neon.tech
- psql installed locally
- Staging environment deployed

## 1. Setup Verification

### Check Neon Branch

```bash
# List branches
neon branches list --project-id YOUR_PROJECT_ID

# Or check in Neon Console:
# - Go to your project
# - Click "Branches"
# - Verify staging branch exists
```

### Check Restore Window

In Neon Console:
1. Go to Settings > Backup
2. Note the "History retention" value (default: 7 days for free tier)

## 2. Create Drill Marker

```sql
-- Connect to staging database
psql $DATABASE_URL

-- Create a marker we can track
CREATE TABLE IF NOT EXISTS ops_drill_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a marker
INSERT INTO ops_drill_markers (marker_name) 
VALUES ('drill_' || to_char(NOW(), 'YYYYMMDD_HH24MISS'));

-- Note the exact timestamp
SELECT NOW() as drill_timestamp;

-- Verify marker exists
SELECT * FROM ops_drill_markers ORDER BY created_at DESC LIMIT 1;
```

**Save the timestamp for PITR!**

## 3. Create Snapshot (Recommended)

In Neon Console:
1. Go to Branches
2. Click on your staging branch
3. Click "Create snapshot" or use Backup & Restore
4. Name it: `drill-YYYYMMDD`

## 4. Simulate Damage

```sql
-- Delete the marker (simulating accidental deletion)
DELETE FROM ops_drill_markers 
WHERE marker_name LIKE 'drill_%';

-- Verify it's gone
SELECT COUNT(*) as markers_remaining FROM ops_drill_markers;
-- Should be 0
```

## 5. Restore

### Option A: Snapshot Restore (Easier)

1. In Neon Console, go to Branches
2. Click "Restore" on your snapshot
3. Choose "Restore to this branch" or create new branch

### Option B: Point-in-Time Restore

1. In Neon Console, go to Branches > your branch
2. Click "Restore" 
3. Select "Point in time"
4. Enter the timestamp from step 2
5. Restore

## 6. Verify Recovery

```sql
-- Check marker is back
SELECT * FROM ops_drill_markers ORDER BY created_at DESC;

-- Verify business-critical data
SELECT COUNT(*) as trucks FROM trucks;
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as check_ins FROM check_ins;
```

## 7. Test App Functionality

```bash
# Health check
curl https://your-staging.vercel.app/api/health

# Trucks endpoint
curl "https://your-staging.vercel.app/api/trucks?limit=10"
```

## 8. Collect Evidence

### Required Screenshots

1. Neon restore UI showing the restore action
2. SQL output: Before delete (marker exists)
3. SQL output: After delete (marker gone)
4. SQL output: After restore (marker back)
5. App health check response

### Evidence Template

```markdown
## Backup Drill Evidence - [DATE]

### Setup
- Branch: staging
- Restore window: 7 days
- Method: Snapshot / PITR

### Timeline
- Marker created: [TIMESTAMP]
- Snapshot created: [TIMESTAMP] (if applicable)
- Damage simulated: [TIMESTAMP]
- Restore completed: [TIMESTAMP]

### SQL Proof

Before delete:
| id | marker_name | created_at |
|----|-------------|------------|
| xxx | drill_20260119 | 2026-01-19 01:30:00 |

After delete:
| count |
|-------|
| 0 |

After restore:
| id | marker_name | created_at |
|----|-------------|------------|
| xxx | drill_20260119 | 2026-01-19 01:30:00 |

### App Verification
- Health: ✅ 200 OK
- Trucks: ✅ Returns data
- UI: ✅ Pages load

### Result: ✅ PASS
```

## Cleanup

```sql
-- Remove drill table if desired
DROP TABLE IF EXISTS ops_drill_markers;
```
