/**
 * Express-Führerschein
 * OAuth-account repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * Provider access/refresh tokens are intentionally NOT stored here.
 *
 * IMPORTANT:
 * The public OAuthAccountRepository contract is intentionally kept stable so
 * the existing OAuth services and callback routes do not need to change.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  OAuthProviderName,
} from "@/lib/server/auth-origin";

/* ==========================================================================
   RECORD
   ========================================================================== */

export interface OAuthAccountRecord {
  id:
    string;

  userId:
    string;

  provider:
    OAuthProviderName;

  providerAccountId:
    string;

  email:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

/* ==========================================================================
   CREATE INPUT
   ========================================================================== */

export interface CreateOAuthAccountInput {
  userId:
    string;

  provider:
    OAuthProviderName;

  providerAccountId:
    string;

  email:
    string;
}

/* ==========================================================================
   CONTRACT
   ========================================================================== */

export interface OAuthAccountRepository {
  findByProviderAccount(
    provider:
      OAuthProviderName,

    providerAccountId:
      string,
  ): Promise<OAuthAccountRecord | null>;

  findByUserAndProvider(
    userId:
      string,

    provider:
      OAuthProviderName,
  ): Promise<OAuthAccountRecord | null>;

  create(
    input:
      CreateOAuthAccountInput,
  ): Promise<OAuthAccountRecord>;

  deleteByUserId(
    userId:
      string,
  ): Promise<void>;
}

/* ==========================================================================
   PRISMA SHAPE
   ========================================================================== */

interface PrismaOAuthAccountShape {
  id:
    string;

  user_id:
    string;

  provider:
    string;

  provider_account_id:
    string;

  email:
    string;

  created_at:
    Date;

  updated_at:
    Date;
}

/* ==========================================================================
   NORMALIZATION
   ========================================================================== */

function normalizeId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeProviderAccountId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeEmail(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}

/* ==========================================================================
   DATABASE MAPPING
   ========================================================================== */

function normalizeProvider(
  value:
    string,
): OAuthProviderName {
  /**
   * OAuthProviderName remains the source of truth at compile time.
   *
   * Values reaching PostgreSQL are written only from that typed contract.
   * This cast is therefore limited to the database mapping boundary.
   */
  return value as
    OAuthProviderName;
}

function mapOAuthAccount(
  record:
    PrismaOAuthAccountShape,
): OAuthAccountRecord {
  return {
    id:
      record.id,

    userId:
      record.user_id,

    provider:
      normalizeProvider(
        record.provider,
      ),

    providerAccountId:
      record
        .provider_account_id,

    email:
      record.email,

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
   PRISMA ERROR HELPERS
   ========================================================================== */

interface PrismaErrorWithCode {
  code:
    string;
}

function hasPrismaErrorCode(
  error:
    unknown,
): error is PrismaErrorWithCode {
  if (
    typeof error !==
      "object" ||
    error ===
      null
  ) {
    return false;
  }

  if (
    !(
      "code" in
      error
    )
  ) {
    return false;
  }

  return (
    typeof (
      error as {
        code?:
          unknown;
      }
    ).code ===
    "string"
  );
}

function isUniqueConstraintError(
  error:
    unknown,
): boolean {
  return (
    hasPrismaErrorCode(
      error,
    ) &&
    error.code ===
      "P2002"
  );
}

/* ==========================================================================
   INTERNAL LOOKUPS
   ========================================================================== */

async function findPrismaByProviderAccount(
  provider:
    OAuthProviderName,

  providerAccountId:
    string,
): Promise<PrismaOAuthAccountShape | null> {
  return prisma
    .oauth_accounts
    .findUnique({
      where: {
        provider_provider_account_id: {
          provider,

          provider_account_id:
            providerAccountId,
        },
      },
    });
}

async function findPrismaByUserAndProvider(
  userId:
    string,

  provider:
    OAuthProviderName,
): Promise<PrismaOAuthAccountShape | null> {
  return prisma
    .oauth_accounts
    .findUnique({
      where: {
        user_id_provider: {
          user_id:
            userId,

          provider,
        },
      },
    });
}

/* ==========================================================================
   IMPLEMENTATION
   ========================================================================== */

export const oauthAccountRepository:
  OAuthAccountRepository = {
  /* ------------------------------------------------------------------------
     FIND BY PROVIDER ACCOUNT
     ------------------------------------------------------------------------ */

  async findByProviderAccount(
    provider,
    providerAccountId,
  ) {
    const accountId =
      normalizeProviderAccountId(
        providerAccountId,
      );

    if (
      !accountId
    ) {
      return null;
    }

    const record =
      await findPrismaByProviderAccount(
        provider,
        accountId,
      );

    return record
      ? mapOAuthAccount(
          record,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     FIND BY USER + PROVIDER
     ------------------------------------------------------------------------ */

  async findByUserAndProvider(
    userId,
    provider,
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

    const record =
      await findPrismaByUserAndProvider(
        normalizedUserId,
        provider,
      );

    return record
      ? mapOAuthAccount(
          record,
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

    const providerAccountId =
      normalizeProviderAccountId(
        input.providerAccountId,
      );

    const email =
      normalizeEmail(
        input.email,
      );

    if (
      !userId ||
      !providerAccountId ||
      !email
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültige Daten für oauthAccountRepository.create().",
      );
    }

    /**
     * Preserve the previous idempotent behaviour:
     * if the exact provider identity already exists for this user,
     * return it instead of creating a duplicate.
     */
    const existingProviderAccount =
      await findPrismaByProviderAccount(
        input.provider,
        providerAccountId,
      );

    if (
      existingProviderAccount
    ) {
      if (
        existingProviderAccount.user_id !==
        userId
      ) {
        throw new Error(
          "Dieses OAuth-Konto ist bereits mit einem anderen Benutzer verknüpft.",
        );
      }

      return mapOAuthAccount(
        existingProviderAccount,
      );
    }

    /**
     * PostgreSQL also enforces one account per provider for a user:
     *
     * UNIQUE(user_id, provider)
     *
     * Surface that rule explicitly before create() for a predictable error.
     */
    const existingUserProvider =
      await findPrismaByUserAndProvider(
        userId,
        input.provider,
      );

    if (
      existingUserProvider
    ) {
      if (
        existingUserProvider.provider_account_id ===
        providerAccountId
      ) {
        return mapOAuthAccount(
          existingUserProvider,
        );
      }

      throw new Error(
        "Dieser Benutzer ist bereits mit einem anderen Konto dieses OAuth-Anbieters verknüpft.",
      );
    }

    const now =
      new Date();

    try {
      const record =
        await prisma
          .oauth_accounts
          .create({
            data: {
              id:
                randomUUID(),

              user_id:
                userId,

              provider:
                input.provider,

              provider_account_id:
                providerAccountId,

              email,

              created_at:
                now,

              updated_at:
                now,
            },
          });

      return mapOAuthAccount(
        record,
      );
    } catch (
      error:
        unknown
    ) {
      /**
       * Friendly handling of concurrent requests.
       *
       * PostgreSQL remains the final source of truth for both unique
       * constraints:
       * - provider + provider_account_id
       * - user_id + provider
       */
      if (
        isUniqueConstraintError(
          error,
        )
      ) {
        const providerOwner =
          await findPrismaByProviderAccount(
            input.provider,
            providerAccountId,
          );

        if (
          providerOwner
        ) {
          if (
            providerOwner.user_id ===
            userId
          ) {
            return mapOAuthAccount(
              providerOwner,
            );
          }

          throw new Error(
            "Dieses OAuth-Konto ist bereits mit einem anderen Benutzer verknüpft.",
          );
        }

        const userProvider =
          await findPrismaByUserAndProvider(
            userId,
            input.provider,
          );

        if (
          userProvider
        ) {
          if (
            userProvider.provider_account_id ===
            providerAccountId
          ) {
            return mapOAuthAccount(
              userProvider,
            );
          }

          throw new Error(
            "Dieser Benutzer ist bereits mit einem anderen Konto dieses OAuth-Anbieters verknüpft.",
          );
        }

        throw new Error(
          "[Express-Führerschein] Dieses OAuth-Konto konnte wegen einer bestehenden Verknüpfung nicht gespeichert werden.",
        );
      }

      throw error;
    }
  },

  /* ------------------------------------------------------------------------
     DELETE BY USER
     ------------------------------------------------------------------------ */

  async deleteByUserId(
    userId,
  ) {
    const normalizedUserId =
      normalizeId(
        userId,
      );

    if (
      !normalizedUserId
    ) {
      return;
    }

    /**
     * Idempotent:
     * deleting OAuth links for a user without links remains a no-op.
     */
    await prisma
      .oauth_accounts
      .deleteMany({
        where: {
          user_id:
            normalizedUserId,
        },
      });
  },
};
