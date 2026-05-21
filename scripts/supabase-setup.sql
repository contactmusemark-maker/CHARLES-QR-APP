-- ═══════════════════════════════════════════════════════════════
--  Charles — Office Mood Check-In
--  Supabase Production Setup Script
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── 1. CREATE TABLE ─────────────────────────────────────────────
-- If you ran `pnpm --filter @workspace/db run push` this already
-- exists. Running CREATE TABLE IF NOT EXISTS is safe either way.

CREATE TABLE IF NOT EXISTS checkins (
  id              SERIAL PRIMARY KEY,
  employee_id     TEXT NOT NULL,
  employee_name   TEXT NOT NULL,
  department      TEXT,
  mood            TEXT NOT NULL,
  energy_level    INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_level     INTEGER CHECK (focus_level  BETWEEN 1 AND 10),
  stress_level    INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  tags            TEXT[]  NOT NULL DEFAULT '{}',
  note            TEXT,
  checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. INDEXES ──────────────────────────────────────────────────
-- Speeds up the daily/date-range queries used by the admin dashboard.

CREATE INDEX IF NOT EXISTS checkins_checked_in_at_idx
  ON checkins (checked_in_at DESC);

CREATE INDEX IF NOT EXISTS checkins_employee_id_idx
  ON checkins (LOWER(employee_id));

CREATE INDEX IF NOT EXISTS checkins_department_idx
  ON checkins (department)
  WHERE department IS NOT NULL;

-- ── 3. ENABLE ROW LEVEL SECURITY ────────────────────────────────
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS POLICIES ─────────────────────────────────────────────
-- The API server connects using the SERVICE ROLE key (bypasses RLS).
-- These policies govern direct Supabase client access (e.g. future
-- mobile app, Supabase JS SDK, or dashboard queries with anon key).

-- Drop existing policies to allow re-running this script cleanly
DROP POLICY IF EXISTS "service_role_full_access"  ON checkins;
DROP POLICY IF EXISTS "anon_insert_own_checkin"   ON checkins;
DROP POLICY IF EXISTS "anon_read_own_checkins"    ON checkins;
DROP POLICY IF EXISTS "no_anon_delete"            ON checkins;
DROP POLICY IF EXISTS "no_anon_update"            ON checkins;

-- Policy A: Service role (your API server) has full unrestricted access.
-- Your Express server uses SUPABASE_SERVICE_ROLE_KEY — this policy
-- ensures it can read/write everything without restriction.
CREATE POLICY "service_role_full_access" ON checkins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy B: Anonymous users (employees via QR scan, no login) can
-- INSERT their own check-in only. They cannot read any rows.
CREATE POLICY "anon_insert_own_checkin" ON checkins
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy C: Authenticated users can read only their own check-ins.
-- (Extend this when you add Supabase Auth to the employee flow.)
CREATE POLICY "anon_read_own_checkins" ON checkins
  FOR SELECT
  TO authenticated
  USING (LOWER(employee_id) = LOWER(current_setting('request.jwt.claims', true)::json->>'sub'));

-- Policy D: Nobody (except service_role) can DELETE or UPDATE rows.
-- This protects the audit trail of mood data.
CREATE POLICY "no_anon_delete" ON checkins
  FOR DELETE
  TO anon, authenticated
  USING (false);

CREATE POLICY "no_anon_update" ON checkins
  FOR UPDATE
  TO anon, authenticated
  USING (false);

-- ── 5. AUDIT COLUMN (OPTIONAL) ──────────────────────────────────
-- Tracks which IP submitted each check-in. Useful for kiosk abuse detection.
-- Comment this out if you don't need it.

-- ALTER TABLE checkins ADD COLUMN IF NOT EXISTS submitted_from INET;

-- ── 6. AUTO-ARCHIVE OLD DATA (OPTIONAL) ─────────────────────────
-- Keeps the table lean by archiving check-ins older than 1 year.
-- Uncomment to enable. Requires pg_cron extension (enabled in Supabase
-- Dashboard → Database → Extensions → pg_cron).

-- SELECT cron.schedule(
--   'archive-old-checkins',
--   '0 3 * * 0',   -- every Sunday at 3 AM UTC
--   $$
--     DELETE FROM checkins
--     WHERE checked_in_at < NOW() - INTERVAL '1 year';
--   $$
-- );

-- ── 7. VERIFY ────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'checkins';

SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'checkins'
ORDER BY policyname;
