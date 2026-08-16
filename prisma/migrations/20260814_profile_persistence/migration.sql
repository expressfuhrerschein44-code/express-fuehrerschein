-- ============================================================================
-- Express-Führerschein
-- Profile persistence fields
--
-- Additive only:
-- - no table is dropped;
-- - no existing column is modified;
-- - no user data is deleted.
--
-- These columns are required by:
-- lib/server/profile/profile-repository.ts
-- ============================================================================

ALTER TABLE IF EXISTS "user_profiles"
  ADD COLUMN IF NOT EXISTS "city" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "postal_code" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "address_line1" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "birth_date" DATE,
  ADD COLUMN IF NOT EXISTS "birth_place" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "driving_license_number" VARCHAR(64);
