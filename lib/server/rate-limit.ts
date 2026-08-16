/**
 * Express-Führerschein
 * PostgreSQL-backed fixed-window rate limiter.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * This replaces the former in-process Map implementation.
 *
 * IMPORTANT:
 * Database I/O is asynchronous, therefore callers must use:
 *
 *   const result = await consumeRateLimit(...);
 *   await resetRateLimit(...);
 *
 * The public option/result shapes remain unchanged.
 *
 * Security:
 * - raw rate-limit keys are never persisted;
 * - SHA-256(key) is stored as identifier_hash;
 * - fixed-window decisions are shared across server instances;
 * - increments are performed atomically in PostgreSQL.
 */

import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface RateLimitOptions {
  /**
   * Unique identifier for this limit.
   *
   * Examples:
   * registration:start:IP:EMAIL
   * registration:verify:IP:USER_ID
   * registration:resend:IP:USER_ID
   *
   * The raw value is hashed before persistence.
   */
  key:
    string;

  /**
   * Maximum number of accepted requests
   * during the current window.
   */
  limit:
    number;

  /**
   * Window duration in milliseconds.
   */
  windowMs:
    number;
}

export interface RateLimitResult {
  /**
   * Whether the current request is allowed.
   */
  allowed:
    boolean;

  /**
   * Configured maximum number of requests.
   */
  limit:
    number;

  /**
   * Number of requests still available.
   */
  remaining:
    number;

  /**
   * Absolute reset timestamp in milliseconds.
   */
  resetAt:
    number;

  /**
   * Number of seconds before the window resets.
   */
  retryAfterSeconds:
    number;
}

/* ==========================================================================
   DATABASE ROW
   ========================================================================== */

interface RateLimitDatabaseRow {
  request_count:
    number;
}

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

/**
 * registration_rate_limits.scope is VARCHAR(32).
 */
const MAX_SCOPE_LENGTH =
  32;

/**
 * Global expired-row cleanup does not need to run on every request.
 *
 * Rate-limit decisions themselves are always PostgreSQL-backed.
 * This timer throttles housekeeping only.
 */
const CLEANUP_INTERVAL_MS =
  5 *
  60 *
  1000;

/* ==========================================================================
   HOUSEKEEPING STATE
   ========================================================================== */

declare global {
  var __efRateLimitLastCleanupAt:
    | number
    | undefined;
}

/* ==========================================================================
   VALIDATION
   ========================================================================== */

function validateRateLimitOptions({
  key,
  limit,
  windowMs,
}: RateLimitOptions): void {
  if (
    typeof key !==
      "string" ||
    key.trim().length ===
      0
  ) {
    throw new Error(
      "Ungültiger Rate-Limit-Schlüssel.",
    );
  }

  if (
    !Number.isInteger(
      limit,
    ) ||
    limit <=
      0
  ) {
    throw new Error(
      "Ungültiges Rate-Limit.",
    );
  }

  if (
    !Number.isFinite(
      windowMs,
    ) ||
    windowMs <=
      0
  ) {
    throw new Error(
      "Ungültiges Rate-Limit-Zeitfenster.",
    );
  }
}

/* ==========================================================================
   KEY / SCOPE
   ========================================================================== */

function normalizeKey(
  key:
    string,
): string {
  return key.trim();
}

/**
 * Keys may contain IP addresses, e-mail addresses or user IDs.
 * Persist only an irreversible fixed-length digest.
 */
function hashRateLimitKey(
  key:
    string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      key,
      "utf8",
    )
    .digest(
      "hex",
    );
}

/**
 * Keep a short operational scope without retaining sensitive identifiers.
 *
 * Example:
 *   registration:start:IP:EMAIL
 * ->
 *   registration:start
 */
function deriveScope(
  key:
    string,
): string {
  const segments =
    key
      .split(
        ":",
      )
      .map(
        (segment) =>
          segment
            .trim()
            .toLowerCase()
            .replace(
              /[^a-z0-9_-]/g,
              "-",
            ),
      )
      .filter(
        Boolean,
      );

  const scope =
    segments
      .slice(
        0,
        2,
      )
      .join(
        ":",
      )
      .slice(
        0,
        MAX_SCOPE_LENGTH,
      );

  return (
    scope ||
    "general"
  );
}

/* ==========================================================================
   TIME HELPERS
   ========================================================================== */

/**
 * Deterministic fixed-window boundaries.
 *
 * All server instances calculate the same window for the same timestamp
 * and window duration.
 */
function getWindowBounds(
  nowMs:
    number,

  windowMs:
    number,
) {
  const windowStartedAtMs =
    Math.floor(
      nowMs /
        windowMs,
    ) *
    windowMs;

  const expiresAtMs =
    windowStartedAtMs +
    windowMs;

  return {
    windowStartedAt:
      new Date(
        windowStartedAtMs,
      ),

    expiresAt:
      new Date(
        expiresAtMs,
      ),

    resetAt:
      expiresAtMs,
  };
}

function getRetryAfterSeconds(
  resetAt:
    number,

  now:
    number,
): number {
  return Math.max(
    1,
    Math.ceil(
      (
        resetAt -
        now
      ) /
        1000,
    ),
  );
}

/* ==========================================================================
   CLEANUP
   ========================================================================== */

async function cleanupExpiredEntries(
  now:
    Date,
): Promise<void> {
  const nowMs =
    now.getTime();

  const lastCleanupAt =
    globalThis
      .__efRateLimitLastCleanupAt ??
    0;

  if (
    nowMs -
      lastCleanupAt <
    CLEANUP_INTERVAL_MS
  ) {
    return;
  }

  /**
   * Mark cleanup as attempted before hitting PostgreSQL.
   * A cleanup failure must not cause repeated cleanup queries on every request.
   */
  globalThis
    .__efRateLimitLastCleanupAt =
    nowMs;

  try {
    await prisma
      .registration_rate_limits
      .deleteMany({
        where: {
          expires_at: {
            lte:
              now,
          },
        },
      });
  } catch (
    error:
      unknown
  ) {
    /**
     * Cleanup is best-effort. The rate-limit decision still uses PostgreSQL
     * and must not fail solely because old-row housekeeping failed.
     */
    console.error(
      "[RATE_LIMIT_CLEANUP_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );
  }
}

/* ==========================================================================
   CONSUME RATE LIMIT
   ========================================================================== */

/**
 * Consume one fixed-window slot.
 *
 * Atomic PostgreSQL behavior:
 *
 * - no row -> insert request_count = 1 and allow;
 * - existing row below limit -> increment and allow;
 * - existing row at limit -> ON CONFLICT ... WHERE condition is false,
 *   PostgreSQL returns no row, therefore deny.
 *
 * The unique database key is:
 * identifier_hash + scope + window_started_at
 */
export async function consumeRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  validateRateLimitOptions({
    key,
    limit,
    windowMs,
  });

  const normalizedKey =
    normalizeKey(
      key,
    );

  const identifierHash =
    hashRateLimitKey(
      normalizedKey,
    );

  const scope =
    deriveScope(
      normalizedKey,
    );

  const now =
    new Date();

  const nowMs =
    now.getTime();

  const {
    windowStartedAt,
    expiresAt,
    resetAt,
  } =
    getWindowBounds(
      nowMs,
      windowMs,
    );

  await cleanupExpiredEntries(
    now,
  );

  const rows =
    await prisma
      .$queryRaw<RateLimitDatabaseRow[]>`
        INSERT INTO "registration_rate_limits" (
          "identifier_hash",
          "scope",
          "request_count",
          "window_started_at",
          "expires_at",
          "created_at",
          "updated_at"
        )
        VALUES (
          ${identifierHash},
          ${scope},
          1,
          ${windowStartedAt},
          ${expiresAt},
          ${now},
          ${now}
        )
        ON CONFLICT (
          "identifier_hash",
          "scope",
          "window_started_at"
        )
        DO UPDATE
        SET
          "request_count" =
            "registration_rate_limits"."request_count" + 1,
          "expires_at" =
            EXCLUDED."expires_at",
          "updated_at" =
            EXCLUDED."updated_at"
        WHERE
          "registration_rate_limits"."request_count" < ${limit}
        RETURNING
          "request_count"
      `;

  /**
   * PostgreSQL returns no row when the conflict UPDATE's WHERE predicate is
   * false, which means the bucket had already reached the configured limit.
   */
  const row =
    rows[0];

  const retryAfterSeconds =
    getRetryAfterSeconds(
      resetAt,
      nowMs,
    );

  if (!row) {
    return {
      allowed:
        false,

      limit,

      remaining:
        0,

      resetAt,

      retryAfterSeconds,
    };
  }

  const requestCount =
    Math.max(
      0,
      Number(
        row.request_count,
      ),
    );

  return {
    allowed:
      true,

    limit,

    remaining:
      Math.max(
        0,
        limit -
          requestCount,
      ),

    resetAt,

    retryAfterSeconds,
  };
}

/* ==========================================================================
   RESET
   ========================================================================== */

/**
 * Removes every fixed-window bucket associated with one logical key.
 *
 * Useful after a successful flow or during tests.
 */
export async function resetRateLimit(
  key:
    string,
): Promise<void> {
  const normalizedKey =
    normalizeKey(
      key,
    );

  if (
    !normalizedKey
  ) {
    return;
  }

  const identifierHash =
    hashRateLimitKey(
      normalizedKey,
    );

  const scope =
    deriveScope(
      normalizedKey,
    );

  await prisma
    .registration_rate_limits
    .deleteMany({
      where: {
        identifier_hash:
          identifierHash,

        scope,
      },
    });
}
