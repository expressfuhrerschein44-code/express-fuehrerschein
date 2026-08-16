/**
 * Express-Führerschein
 * Password reset repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * IMPORTANT:
 * The public PasswordResetRepository contract is intentionally kept stable so
 * password-reset-service.ts and the existing API routes do not need to change.
 *
 * Security:
 * - only the HMAC-SHA256 code digest is persisted;
 * - plaintext reset codes are never stored;
 * - active/open-state conditions are enforced in PostgreSQL writes;
 * - attempts and resend counters are incremented atomically.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  CreatePasswordResetRequestInput,
  PasswordResetRequestRecord,
  ReplacePasswordResetCodeInput,
} from "@/types/password-reset";

/* ==========================================================================
   CONTRACT
   ========================================================================== */

export interface PasswordResetRepository {
  findById(
    id:
      string,
  ): Promise<PasswordResetRequestRecord | null>;

  findLatestActiveByUserId(
    userId:
      string,
  ): Promise<PasswordResetRequestRecord | null>;

  create(
    input:
      CreatePasswordResetRequestInput,
  ): Promise<PasswordResetRequestRecord>;

  invalidateActiveForUser(
    userId:
      string,
  ): Promise<number>;

  incrementAttempts(
    id:
      string,
  ): Promise<PasswordResetRequestRecord | null>;

  replaceCode(
    id:
      string,

    input:
      ReplacePasswordResetCodeInput,
  ): Promise<PasswordResetRequestRecord | null>;

  markVerified(
    id:
      string,
  ): Promise<PasswordResetRequestRecord | null>;

  markCompleted(
    id:
      string,
  ): Promise<PasswordResetRequestRecord | null>;

  invalidate(
    id:
      string,
  ): Promise<PasswordResetRequestRecord | null>;
}

/* ==========================================================================
   PRISMA SHAPE
   ========================================================================== */

interface PrismaPasswordResetRequestShape {
  id:
    string;

  user_id:
    string;

  code_hash:
    string;

  expires_at:
    Date;

  attempts:
    number;

  resend_count:
    number;

  last_sent_at:
    Date;

  verified_at:
    Date | null;

  completed_at:
    Date | null;

  invalidated_at:
    Date | null;

  created_at:
    Date;

  updated_at:
    Date;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function normalizeId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeHash(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function isHexSha256(
  value:
    string,
): boolean {
  return /^[0-9a-f]{64}$/.test(
    value,
  );
}

function parseIsoDate(
  value:
    string,
): Date | null {
  const date =
    new Date(
      value.trim(),
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

/* ==========================================================================
   DATABASE MAPPING
   ========================================================================== */

function mapRequest(
  request:
    PrismaPasswordResetRequestShape,
): PasswordResetRequestRecord {
  return {
    id:
      request.id,

    userId:
      request.user_id,

    codeHash:
      request.code_hash,

    expiresAt:
      request
        .expires_at
        .toISOString(),

    attempts:
      request.attempts,

    resendCount:
      request.resend_count,

    lastSentAt:
      request
        .last_sent_at
        .toISOString(),

    verifiedAt:
      request
        .verified_at
        ?.toISOString() ??
      null,

    completedAt:
      request
        .completed_at
        ?.toISOString() ??
      null,

    invalidatedAt:
      request
        .invalidated_at
        ?.toISOString() ??
      null,

    createdAt:
      request
        .created_at
        .toISOString(),

    updatedAt:
      request
        .updated_at
        .toISOString(),
  };
}

/* ==========================================================================
   IMPLEMENTATION
   ========================================================================== */

export const passwordResetRepository:
  PasswordResetRepository = {
  /* ------------------------------------------------------------------------
     FIND BY ID
     ------------------------------------------------------------------------ */

  async findById(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    const request =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return request
      ? mapRequest(
          request,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     FIND LATEST ACTIVE BY USER
     ------------------------------------------------------------------------ */

  async findLatestActiveByUserId(
    userId,
  ) {
    const normalizedUserId =
      normalizeId(
        userId,
      );

    if (
      !normalizedUserId
    ) {
      return null;
    }

    /**
     * Preserve the previous repository behaviour exactly:
     *
     * "active/open" means:
     * - completed_at IS NULL
     * - invalidated_at IS NULL
     *
     * Expiration is NOT filtered here because password-reset-service.ts owns
     * the expiry/business-rule decision.
     */
    const request =
      await prisma
        .password_reset_requests
        .findFirst({
          where: {
            user_id:
              normalizedUserId,

            completed_at:
              null,

            invalidated_at:
              null,
          },

          orderBy: {
            created_at:
              "desc",
          },
        });

    return request
      ? mapRequest(
          request,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     CREATE
     ------------------------------------------------------------------------ */

  async create(
    input,
  ) {
    const userId =
      normalizeId(
        input.userId,
      );

    const codeHash =
      normalizeHash(
        input.codeHash,
      );

    const expiresAt =
      parseIsoDate(
        input.expiresAt,
      );

    if (
      !userId ||
      !isHexSha256(
        codeHash,
      ) ||
      !expiresAt
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültige Daten für passwordResetRepository.create().",
      );
    }

    const now =
      new Date();

    if (
      expiresAt.getTime() <=
      now.getTime()
    ) {
      throw new Error(
        "[Express-Führerschein] Das Ablaufdatum der Passwort-Zurücksetzung muss in der Zukunft liegen.",
      );
    }

    const record =
      await prisma
        .password_reset_requests
        .create({
          data: {
            id:
              randomUUID(),

            user_id:
              userId,

            code_hash:
              codeHash,

            expires_at:
              expiresAt,

            attempts:
              0,

            resend_count:
              0,

            last_sent_at:
              now,

            verified_at:
              null,

            completed_at:
              null,

            invalidated_at:
              null,

            created_at:
              now,

            updated_at:
              now,
          },
        });

    return mapRequest(
      record,
    );
  },

  /* ------------------------------------------------------------------------
     INVALIDATE ALL ACTIVE REQUESTS FOR USER
     ------------------------------------------------------------------------ */

  async invalidateActiveForUser(
    userId,
  ) {
    const normalizedUserId =
      normalizeId(
        userId,
      );

    if (
      !normalizedUserId
    ) {
      return 0;
    }

    const now =
      new Date();

    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            user_id:
              normalizedUserId,

            completed_at:
              null,

            invalidated_at:
              null,
          },

          data: {
            invalidated_at:
              now,

            updated_at:
              now,
          },
        });

    return result.count;
  },

  /* ------------------------------------------------------------------------
     INCREMENT ATTEMPTS
     ------------------------------------------------------------------------ */

  async incrementAttempts(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    /**
     * Only an open request may receive another failed attempt.
     *
     * updateMany() lets us keep the active-state check and the atomic
     * counter increment in the same PostgreSQL operation.
     */
    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            id:
              normalizedId,

            completed_at:
              null,

            invalidated_at:
              null,
          },

          data: {
            attempts: {
              increment:
                1,
            },

            updated_at:
              new Date(),
          },
        });

    if (
      result.count ===
      0
    ) {
      return null;
    }

    const updated =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapRequest(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     REPLACE CODE
     ------------------------------------------------------------------------ */

  async replaceCode(
    id,
    input,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    const codeHash =
      normalizeHash(
        input.codeHash,
      );

    const expiresAt =
      parseIsoDate(
        input.expiresAt,
      );

    if (
      !normalizedId ||
      !isHexSha256(
        codeHash,
      ) ||
      !expiresAt ||
      expiresAt.getTime() <=
        Date.now()
    ) {
      return null;
    }

    const now =
      new Date();

    /**
     * Preserve the previous business rule:
     *
     * A code may be replaced only while:
     * - request is not completed;
     * - request is not invalidated;
     * - request is not already verified.
     */
    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            id:
              normalizedId,

            completed_at:
              null,

            invalidated_at:
              null,

            verified_at:
              null,
          },

          data: {
            code_hash:
              codeHash,

            expires_at:
              expiresAt,

            attempts:
              0,

            resend_count: {
              increment:
                1,
            },

            last_sent_at:
              now,

            updated_at:
              now,
          },
        });

    if (
      result.count ===
      0
    ) {
      return null;
    }

    const updated =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapRequest(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     MARK VERIFIED
     ------------------------------------------------------------------------ */

  async markVerified(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    const current =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    if (
      !current ||
      current.completed_at ||
      current.invalidated_at
    ) {
      return null;
    }

    /**
     * Preserve idempotency:
     * an already verified open request is returned unchanged.
     */
    if (
      current.verified_at
    ) {
      return mapRequest(
        current,
      );
    }

    const now =
      new Date();

    /**
     * Conditional update protects against a concurrent invalidation or
     * completion between the read above and this write.
     */
    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            id:
              normalizedId,

            completed_at:
              null,

            invalidated_at:
              null,

            verified_at:
              null,
          },

          data: {
            verified_at:
              now,

            updated_at:
              now,
          },
        });

    if (
      result.count ===
      0
    ) {
      const latest =
        await prisma
          .password_reset_requests
          .findUnique({
            where: {
              id:
                normalizedId,
            },
          });

      if (
        !latest ||
        latest.completed_at ||
        latest.invalidated_at
      ) {
        return null;
      }

      return latest.verified_at
        ? mapRequest(
            latest,
          )
        : null;
    }

    const updated =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapRequest(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     MARK COMPLETED
     ------------------------------------------------------------------------ */

  async markCompleted(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    /**
     * Preserve the observable behaviour of the previous repository:
     * only an open + verified request can be completed.
     */
    const now =
      new Date();

    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            id:
              normalizedId,

            verified_at: {
              not:
                null,
            },

            completed_at:
              null,

            invalidated_at:
              null,
          },

          data: {
            completed_at:
              now,

            updated_at:
              now,
          },
        });

    if (
      result.count ===
      0
    ) {
      return null;
    }

    const updated =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapRequest(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     INVALIDATE ONE REQUEST
     ------------------------------------------------------------------------ */

  async invalidate(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    const current =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    if (
      !current
    ) {
      return null;
    }

    /**
     * Preserve idempotency from the previous implementation.
     */
    if (
      current.invalidated_at
    ) {
      return mapRequest(
        current,
      );
    }

    const now =
      new Date();

    const result =
      await prisma
        .password_reset_requests
        .updateMany({
          where: {
            id:
              normalizedId,

            invalidated_at:
              null,
          },

          data: {
            invalidated_at:
              now,

            updated_at:
              now,
          },
        });

    if (
      result.count ===
      0
    ) {
      const latest =
        await prisma
          .password_reset_requests
          .findUnique({
            where: {
              id:
                normalizedId,
            },
          });

      return latest
        ? mapRequest(
            latest,
          )
        : null;
    }

    const updated =
      await prisma
        .password_reset_requests
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapRequest(
          updated,
        )
      : null;
  },
};
