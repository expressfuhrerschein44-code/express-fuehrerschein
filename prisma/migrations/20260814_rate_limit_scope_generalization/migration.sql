-- ============================================================================
-- Express-Führerschein
-- Rate-limit scope generalization
--
-- Why:
-- The original registration_rate_limits constraint only allowed:
--   start, verify, resend
--
-- The shared PostgreSQL-backed limiter is now also used by:
--   auth:login
--   password-reset:start
--   registration:start
--   registration:verify
--   registration:resend
--
-- This migration does NOT drop/recreate the table and does NOT delete data.
-- Existing values start/verify/resend remain valid.
-- ============================================================================

ALTER TABLE "registration_rate_limits"
DROP CONSTRAINT IF EXISTS "chk_registration_rate_limits_scope";

ALTER TABLE "registration_rate_limits"
ADD CONSTRAINT "chk_registration_rate_limits_scope"
CHECK (
  "scope" ~ '^[a-z0-9][a-z0-9:_-]{0,31}$'
);
