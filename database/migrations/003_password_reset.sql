-- ============================================================================
-- Express-Führerschein
-- Migration: 003_password_reset.sql
--
-- Password reset infrastructure.
--
-- Responsibilities:
--
-- - associate a reset request with an existing user;
-- - store only a secure hash of the verification code;
-- - enforce expiration;
-- - count verification attempts;
-- - count resend operations;
-- - record successful verification;
-- - prevent completed requests from being reused;
-- - allow old requests to be invalidated;
-- - support later cleanup/monitoring.
--
-- IMPORTANT:
--
-- Plaintext verification codes MUST NEVER be stored in PostgreSQL.
-- Plaintext passwords MUST NEVER be stored in this table.
--
-- Password replacement itself happens in the users table through
-- the server-side user repository.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSWORD RESET REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_requests (
  /* --------------------------------------------------------------------------
     Identity
     -------------------------------------------------------------------------- */

  id UUID
    PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id UUID
    NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  /* --------------------------------------------------------------------------
     Verification code
     -------------------------------------------------------------------------- */

  /**
   * SHA-256 / HMAC-SHA-256 style hexadecimal digest.
   *
   * The real reset code is sent to the user by e-mail and MUST NOT
   * be stored here.
   */
  code_hash CHAR(64)
    NOT NULL,

  /* --------------------------------------------------------------------------
     Expiration
     -------------------------------------------------------------------------- */

  expires_at TIMESTAMPTZ
    NOT NULL,

  /* --------------------------------------------------------------------------
     Brute-force protection
     -------------------------------------------------------------------------- */

  attempts SMALLINT
    NOT NULL
    DEFAULT 0,

  /* --------------------------------------------------------------------------
     Resend protection
     -------------------------------------------------------------------------- */

  resend_count SMALLINT
    NOT NULL
    DEFAULT 0,

  last_sent_at TIMESTAMPTZ
    NOT NULL
    DEFAULT NOW(),

  /* --------------------------------------------------------------------------
     Lifecycle
     -------------------------------------------------------------------------- */

  /**
   * Set after the correct verification code has been supplied.
   */
  verified_at TIMESTAMPTZ
    NULL,

  /**
   * Set after the user's password was successfully replaced.
   *
   * A completed request can never be used again.
   */
  completed_at TIMESTAMPTZ
    NULL,

  /**
   * Allows a previous request to be explicitly invalidated when:
   *
   * - a newer reset request is started;
   * - security rules require cancellation;
   * - the reset flow is abandoned/invalidated.
   */
  invalidated_at TIMESTAMPTZ
    NULL,

  /* --------------------------------------------------------------------------
     Audit timestamps
     -------------------------------------------------------------------------- */

  created_at TIMESTAMPTZ
    NOT NULL
    DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL
    DEFAULT NOW(),

  /* --------------------------------------------------------------------------
     Integrity constraints
     -------------------------------------------------------------------------- */

  CONSTRAINT chk_password_reset_code_hash
    CHECK (
      code_hash ~ '^[0-9a-f]{64}$'
    ),

  CONSTRAINT chk_password_reset_attempts
    CHECK (
      attempts >= 0
    ),

  CONSTRAINT chk_password_reset_resend_count
    CHECK (
      resend_count >= 0
    ),

  CONSTRAINT chk_password_reset_expiration
    CHECK (
      expires_at > created_at
    ),

  /**
   * A request cannot be marked as completed
   * before it has successfully been verified.
   */
  CONSTRAINT chk_password_reset_completion
    CHECK (
      completed_at IS NULL
      OR verified_at IS NOT NULL
    )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

/**
 * Main lookup:
 *
 * password reset request -> user.
 */
CREATE INDEX IF NOT EXISTS
  idx_password_reset_requests_user_id
ON password_reset_requests (
  user_id
);

/**
 * Useful for expiration cleanup jobs.
 */
CREATE INDEX IF NOT EXISTS
  idx_password_reset_requests_expires_at
ON password_reset_requests (
  expires_at
);

/**
 * Useful for security/audit queries.
 */
CREATE INDEX IF NOT EXISTS
  idx_password_reset_requests_created_at
ON password_reset_requests (
  created_at DESC
);

/**
 * Optimizes lookups for requests that have not yet
 * been completed or explicitly invalidated.
 *
 * Expiration itself is still validated by the application
 * because NOW() cannot safely be used as the predicate
 * of a PostgreSQL partial index.
 */
CREATE INDEX IF NOT EXISTS
  idx_password_reset_requests_active_user
ON password_reset_requests (
  user_id,
  created_at DESC
)
WHERE
  completed_at IS NULL
  AND invalidated_at IS NULL;

/**
 * Optimizes the verification stage.
 */
CREATE INDEX IF NOT EXISTS
  idx_password_reset_requests_verified
ON password_reset_requests (
  user_id,
  verified_at
)
WHERE
  verified_at IS NOT NULL
  AND completed_at IS NULL
  AND invalidated_at IS NULL;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

/**
 * Dedicated function for this migration.
 *
 * We intentionally avoid depending on another migration's
 * updated_at trigger function name.
 */
CREATE OR REPLACE FUNCTION
  ef_password_reset_set_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS
  trg_password_reset_requests_updated_at
ON password_reset_requests;

CREATE TRIGGER
  trg_password_reset_requests_updated_at
BEFORE UPDATE
ON password_reset_requests
FOR EACH ROW
EXECUTE FUNCTION
  ef_password_reset_set_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE
  password_reset_requests
IS
  'Express-Führerschein secure password reset requests.';

COMMENT ON COLUMN
  password_reset_requests.code_hash
IS
  'Secure hash of the temporary password reset verification code. Never stores plaintext codes.';

COMMENT ON COLUMN
  password_reset_requests.verified_at
IS
  'Timestamp at which the temporary verification code was successfully validated.';

COMMENT ON COLUMN
  password_reset_requests.completed_at
IS
  'Timestamp at which the password was successfully replaced. Completed requests cannot be reused.';

COMMENT ON COLUMN
  password_reset_requests.invalidated_at
IS
  'Timestamp at which the reset request was explicitly cancelled or superseded.';

-- ============================================================================
-- END
-- ============================================================================

COMMIT;