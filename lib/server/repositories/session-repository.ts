/**
 * Express-Führerschein
 * Auth-session repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * This repository replaces the former in-memory Map implementation while
 * keeping the public AuthSessionRepository contract stable for:
 *
 * - auth-session.ts;
 * - login routes;
 * - logout routes;
 * - session routes;
 * - password reset;
 * - protected client-space shell.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

/* ==========================================================================
   PUBLIC RECORDS
   ========================================================================== */

export interface AuthSessionRecord {
  id:
    string;

  userId:
    string;

  tokenHash:
    string;

  expiresAt:
    string;

  revokedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface CreateAuthSessionInput {
  userId:
    string;

  tokenHash:
    string;

  expiresAt:
    string;
}

/* ==========================================================================
   REPOSITORY CONTRACT
   ========================================================================== */

export interface AuthSessionRepository {
  create(
    input:
      CreateAuthSessionInput,
  ): Promise<AuthSessionRecord>;

  findActiveByTokenHash(
    tokenHash:
      string,
  ): Promise<AuthSessionRecord | null>;

  revokeById(
    id:
      string,
  ): Promise<AuthSessionRecord | null>;

  revokeAllForUser(
    userId:
      string,
  ): Promise<number>;

  deleteExpired(
    now?:
      Date,
  ): Promise<number>;
}

/* ==========================================================================
   NORMALIZATION / VALIDATION
   ========================================================================== */

const SHA256_HEX_PATTERN =
  /^[0-9a-f]{64}$/i;

function normalizeId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeTokenHash(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function parseIsoDate(
  value:
    string,
): Date | null {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

/* ==========================================================================
   DATABASE MAPPING
   ========================================================================== */

interface PrismaAuthSessionShape {
  id:
    string;

  user_id:
    string;

  token_hash:
    string;

  expires_at:
    Date;

  revoked_at:
    Date | null;

  created_at:
    Date;

  updated_at:
    Date;
}

function mapAuthSession(
  record:
    PrismaAuthSessionShape,
): AuthSessionRecord {
  return {
    id:
      record.id,

    userId:
      record.user_id,

    tokenHash:
      record.token_hash,

    expiresAt:
      record
        .expires_at
        .toISOString(),

    revokedAt:
      record
        .revoked_at
        ?.toISOString() ??
      null,

    createdAt:
      record
        .created_at
        .toISOString(),

    updatedAt:
      record
        .updated_at
        .toISOString(),
  };
}

/* ==========================================================================
   REPOSITORY
   ========================================================================== */

export const sessionRepository:
  AuthSessionRepository = {
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

    const tokenHash =
      normalizeTokenHash(
        input.tokenHash,
      );

    const expiresAt =
      parseIsoDate(
        input.expiresAt,
      );

    if (!userId) {
      throw new Error(
        "[Express-Führerschein] Ungültige Benutzer-ID für Auth-Session.",
      );
    }

    if (
      !SHA256_HEX_PATTERN.test(
        tokenHash,
      )
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültiger Auth-Session-Token-Hash.",
      );
    }

    if (
      !expiresAt ||
      expiresAt.getTime() <=
        Date.now()
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültiges Ablaufdatum für Auth-Session.",
      );
    }

    const record =
      await prisma
        .auth_sessions
        .create({
          data: {
            id:
              randomUUID(),

            user_id:
              userId,

            token_hash:
              tokenHash,

            expires_at:
              expiresAt,

            revoked_at:
              null,
          },
        });

    return mapAuthSession(
      record,
    );
  },

  /* ------------------------------------------------------------------------
     FIND ACTIVE BY TOKEN HASH
     ------------------------------------------------------------------------ */

  async findActiveByTokenHash(
    tokenHash,
  ) {
    const normalizedTokenHash =
      normalizeTokenHash(
        tokenHash,
      );

    if (
      !SHA256_HEX_PATTERN.test(
        normalizedTokenHash,
      )
    ) {
      return null;
    }

    const now =
      new Date();

    /**
     * token_hash is unique in PostgreSQL, therefore findFirst is sufficient
     * while still allowing active-state predicates in the same query.
     */
    const record =
      await prisma
        .auth_sessions
        .findFirst({
          where: {
            token_hash:
              normalizedTokenHash,

            revoked_at:
              null,

            expires_at: {
              gt:
                now,
            },
          },
        });

    return record
      ? mapAuthSession(
          record,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     REVOKE ONE SESSION
     ------------------------------------------------------------------------ */

  async revokeById(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (!normalizedId) {
      return null;
    }

    const current =
      await prisma
        .auth_sessions
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    if (!current) {
      return null;
    }

    /**
     * Revocation is idempotent.
     */
    if (
      current.revoked_at
    ) {
      return mapAuthSession(
        current,
      );
    }

    const updated =
      await prisma
        .auth_sessions
        .update({
          where: {
            id:
              normalizedId,
          },

          data: {
            revoked_at:
              new Date(),
          },
        });

    return mapAuthSession(
      updated,
    );
  },

  /* ------------------------------------------------------------------------
     REVOKE ALL USER SESSIONS
     ------------------------------------------------------------------------ */

  async revokeAllForUser(
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

    const result =
      await prisma
        .auth_sessions
        .updateMany({
          where: {
            user_id:
              normalizedUserId,

            revoked_at:
              null,
          },

          data: {
            revoked_at:
              new Date(),
          },
        });

    return result.count;
  },

  /* ------------------------------------------------------------------------
     DELETE EXPIRED SESSIONS
     ------------------------------------------------------------------------ */

  async deleteExpired(
    now =
      new Date(),
  ) {
    const effectiveNow =
      Number.isNaN(
        now.getTime(),
      )
        ? new Date()
        : now;

    const result =
      await prisma
        .auth_sessions
        .deleteMany({
          where: {
            expires_at: {
              lte:
                effectiveNow,
            },
          },
        });

    return result.count;
  },
};
