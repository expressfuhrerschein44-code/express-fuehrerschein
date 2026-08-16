/**
 * Express-Führerschein
 * User repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * IMPORTANT:
 * The public UserRepository contract is intentionally kept stable so:
 *
 * - registration-service.ts;
 * - login-service.ts;
 * - OAuth services;
 * - session services;
 * - password-reset-service.ts;
 * - client-space services;
 *
 * continue using this repository without depending directly on Prisma.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  SupportedCountryCode,
} from "@/types/country";

/* ==========================================================================
   USER STATUS
   ========================================================================== */

export type UserStatus =
  | "pending_verification"
  | "active"
  | "disabled";

/* ==========================================================================
   USER RECORD
   ========================================================================== */

export interface UserRecord {
  /**
   * Internal user identifier.
   */
  id:
    string;

  /**
   * Public profile information.
   */
  firstName:
    string;

  lastName:
    string;

  /**
   * Normalized lowercase e-mail.
   */
  email:
    string;

  /**
   * International E.164 telephone number.
   */
  phoneE164:
    string;

  /**
   * Express-Führerschein market associated
   * with the user's registration.
   *
   * Country and interface language remain independent.
   */
  countryCode:
    SupportedCountryCode;

  /**
   * Secure password hash.
   *
   * Plaintext passwords must never be stored here.
   */
  passwordHash:
    string;

  /**
   * Timestamp at which AGB + Datenschutz
   * were accepted.
   */
  acceptedTermsAt:
    string;

  /**
   * Timestamp at which the e-mail address
   * was successfully verified.
   */
  emailVerifiedAt:
    string | null;

  /**
   * Current account state.
   */
  status:
    UserStatus;

  createdAt:
    string;

  updatedAt:
    string;
}

/* ==========================================================================
   CREATE USER INPUT
   ========================================================================== */

export interface CreatePendingUserInput {
  firstName:
    string;

  lastName:
    string;

  email:
    string;

  /**
   * Must already be normalized to E.164
   * by the registration service.
   */
  phoneE164:
    string;

  countryCode:
    SupportedCountryCode;

  /**
   * Password already hashed by:
   *
   * lib/server/password.ts
   */
  passwordHash:
    string;
}

/* ==========================================================================
   REPOSITORY CONTRACT
   ========================================================================== */

export interface UserRepository {
  /**
   * Find one user by internal ID.
   */
  findById(
    id:
      string,
  ): Promise<UserRecord | null>;

  /**
   * Find one user by e-mail.
   *
   * Lookup is case-insensitive.
   */
  findByEmail(
    email:
      string,
  ): Promise<UserRecord | null>;

  /**
   * Find one user by normalized E.164
   * telephone number.
   */
  findByPhoneE164(
    phoneE164:
      string,
  ): Promise<UserRecord | null>;

  /**
   * Create a user waiting for
   * e-mail verification.
   */
  createPending(
    input:
      CreatePendingUserInput,
  ): Promise<UserRecord>;

  /**
   * Activate a verified user.
   *
   * Activation is idempotent.
   */
  activate(
    id:
      string,
  ): Promise<UserRecord | null>;

  /**
   * Replace the secure password hash
   * for an existing user.
   *
   * Used by the password-reset flow.
   *
   * IMPORTANT:
   * This repository expects an already-hashed password.
   * Plaintext passwords must never reach this method.
   */
  updatePasswordHash(
    id:
      string,

    passwordHash:
      string,
  ): Promise<UserRecord | null>;

  /**
   * Remove one user.
   *
   * Used mainly when an incomplete registration
   * needs to be cleaned up.
   */
  deleteById(
    id:
      string,
  ): Promise<void>;
}

/* ==========================================================================
   PRISMA SHAPE
   ========================================================================== */

interface PrismaUserShape {
  id:
    string;

  first_name:
    string;

  last_name:
    string;

  email:
    string;

  phone_e164:
    string;

  country_code:
    string;

  password_hash:
    string;

  accepted_terms_at:
    Date;

  email_verified_at:
    Date | null;

  status:
    string;

  created_at:
    Date;

  updated_at:
    Date;
}

/* ==========================================================================
   NORMALIZATION HELPERS
   ========================================================================== */

function normalizeId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeEmail(
  email:
    string,
): string {
  return email
    .trim()
    .toLowerCase();
}

/**
 * Normalize an already international telephone number.
 *
 * The real national -> E.164 conversion is handled by:
 *
 * lib/server/phone-country.ts
 */
function normalizePhoneE164(
  phoneE164:
    string,
): string {
  const value =
    phoneE164.trim();

  if (!value) {
    return "";
  }

  if (
    !value.startsWith(
      "+",
    )
  ) {
    return value.replace(
      /\D/g,
      "",
    );
  }

  const digits =
    value
      .slice(
        1,
      )
      .replace(
        /\D/g,
        "",
      );

  if (!digits) {
    return "";
  }

  return `+${digits}`;
}

/**
 * Normalize a password hash.
 *
 * Plaintext password validation/hashing is handled elsewhere.
 */
function normalizePasswordHash(
  passwordHash:
    string,
): string {
  return passwordHash.trim();
}

/* ==========================================================================
   DATABASE MAPPING
   ========================================================================== */

function normalizeUserStatus(
  value:
    string,
): UserStatus {
  switch (
    value
  ) {
    case "pending_verification":
    case "active":
    case "disabled":
      return value;

    default:
      throw new Error(
        `[Express-Führerschein] Unbekannter Benutzerstatus in PostgreSQL: ${value}`,
      );
  }
}

function mapUser(
  user:
    PrismaUserShape,
): UserRecord {
  return {
    id:
      user.id,

    firstName:
      user.first_name,

    lastName:
      user.last_name,

    email:
      user.email,

    phoneE164:
      user.phone_e164,

    countryCode:
      user.country_code as
        SupportedCountryCode,

    passwordHash:
      user.password_hash,

    acceptedTermsAt:
      user
        .accepted_terms_at
        .toISOString(),

    emailVerifiedAt:
      user
        .email_verified_at
        ?.toISOString() ??
      null,

    status:
      normalizeUserStatus(
        user.status,
      ),

    createdAt:
      user
        .created_at
        .toISOString(),

    updatedAt:
      user
        .updated_at
        .toISOString(),
  };
}

/* ==========================================================================
   DATABASE HELPERS
   ========================================================================== */

/**
 * The PostgreSQL schema contains a case-insensitive expression unique index
 * for e-mail addresses. Prisma cannot expose that expression index as a
 * normal @unique field after introspection, therefore e-mail lookups use
 * findFirst() with the normalized value.
 *
 * Registration always persists normalized lowercase e-mail addresses.
 */
async function findPrismaUserByEmail(
  normalizedEmail:
    string,
): Promise<PrismaUserShape | null> {
  return prisma
    .users
    .findFirst({
      where: {
        email:
          normalizedEmail,
      },
    });
}

async function findPrismaUserByPhone(
  normalizedPhone:
    string,
): Promise<PrismaUserShape | null> {
  return prisma
    .users
    .findUnique({
      where: {
        phone_e164:
          normalizedPhone,
      },
    });
}

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
   USER REPOSITORY
   ========================================================================== */

export const userRepository:
  UserRepository = {
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

    const user =
      await prisma
        .users
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return user
      ? mapUser(
          user,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     FIND BY EMAIL
     ------------------------------------------------------------------------ */

  async findByEmail(
    email,
  ) {
    const normalizedEmail =
      normalizeEmail(
        email,
      );

    if (
      !normalizedEmail
    ) {
      return null;
    }

    const user =
      await findPrismaUserByEmail(
        normalizedEmail,
      );

    return user
      ? mapUser(
          user,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     FIND BY PHONE
     ------------------------------------------------------------------------ */

  async findByPhoneE164(
    phoneE164,
  ) {
    const normalizedPhone =
      normalizePhoneE164(
        phoneE164,
      );

    if (
      !normalizedPhone
    ) {
      return null;
    }

    const user =
      await findPrismaUserByPhone(
        normalizedPhone,
      );

    return user
      ? mapUser(
          user,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     CREATE PENDING USER
     ------------------------------------------------------------------------ */

  async createPending(
    input,
  ) {
    const firstName =
      input
        .firstName
        .trim();

    const lastName =
      input
        .lastName
        .trim();

    const email =
      normalizeEmail(
        input.email,
      );

    const phoneE164 =
      normalizePhoneE164(
        input.phoneE164,
      );

    const passwordHash =
      normalizePasswordHash(
        input.passwordHash,
      );

    /* ----------------------------------------------------------------------
       Defensive validation
       ---------------------------------------------------------------------- */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneE164 ||
      !passwordHash
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültige Benutzerdaten für createPending().",
      );
    }

    /* ----------------------------------------------------------------------
       Friendly uniqueness checks
       ---------------------------------------------------------------------- */

    const existingEmailUser =
      await findPrismaUserByEmail(
        email,
      );

    if (
      existingEmailUser
    ) {
      throw new Error(
        "[Express-Führerschein] Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
      );
    }

    const existingPhoneUser =
      await findPrismaUserByPhone(
        phoneE164,
      );

    if (
      existingPhoneUser
    ) {
      throw new Error(
        "[Express-Führerschein] Ein Benutzer mit dieser Telefonnummer existiert bereits.",
      );
    }

    /* ----------------------------------------------------------------------
       Create PostgreSQL record
       ---------------------------------------------------------------------- */

    const now =
      new Date();

    try {
      const record =
        await prisma
          .users
          .create({
            data: {
              id:
                randomUUID(),

              first_name:
                firstName,

              last_name:
                lastName,

              email,

              phone_e164:
                phoneE164,

              country_code:
                input.countryCode,

              password_hash:
                passwordHash,

              accepted_terms_at:
                now,

              email_verified_at:
                null,

              status:
                "pending_verification",

              created_at:
                now,

              updated_at:
                now,
            },
          });

      return mapUser(
        record,
      );
    } catch (
      error:
        unknown
    ) {
      /**
       * Pre-checks provide user-friendly errors, but only PostgreSQL can
       * guarantee uniqueness under concurrent requests.
       */
      if (
        isUniqueConstraintError(
          error,
        )
      ) {
        const emailOwner =
          await findPrismaUserByEmail(
            email,
          );

        if (
          emailOwner
        ) {
          throw new Error(
            "[Express-Führerschein] Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.",
          );
        }

        const phoneOwner =
          await findPrismaUserByPhone(
            phoneE164,
          );

        if (
          phoneOwner
        ) {
          throw new Error(
            "[Express-Führerschein] Ein Benutzer mit dieser Telefonnummer existiert bereits.",
          );
        }

        throw new Error(
          "[Express-Führerschein] Ein Benutzer mit diesen Kontodaten existiert bereits.",
        );
      }

      throw error;
    }
  },

  /* ------------------------------------------------------------------------
     ACTIVATE USER
     ------------------------------------------------------------------------ */

  async activate(
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
        .users
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
     * Already-active accounts remain active.
     */
    if (
      current.status ===
        "active" &&
      current
        .email_verified_at
    ) {
      return mapUser(
        current,
      );
    }

    /**
     * A disabled account must never be reactivated
     * by the verification flow.
     */
    if (
      current.status ===
      "disabled"
    ) {
      return mapUser(
        current,
      );
    }

    const now =
      new Date();

    const updated =
      await prisma
        .users
        .update({
          where: {
            id:
              normalizedId,
          },

          data: {
            email_verified_at:
              current
                .email_verified_at ??
              now,

            status:
              "active",

            updated_at:
              now,
          },
        });

    return mapUser(
      updated,
    );
  },

  /* ------------------------------------------------------------------------
     UPDATE PASSWORD HASH
     ------------------------------------------------------------------------ */

  async updatePasswordHash(
    id,
    passwordHash,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    const normalizedPasswordHash =
      normalizePasswordHash(
        passwordHash,
      );

    if (
      !normalizedId ||
      !normalizedPasswordHash
    ) {
      return null;
    }

    const current =
      await prisma
        .users
        .findUnique({
          where: {
            id:
              normalizedId,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !current
    ) {
      return null;
    }

    const updated =
      await prisma
        .users
        .update({
          where: {
            id:
              normalizedId,
          },

          data: {
            password_hash:
              normalizedPasswordHash,

            updated_at:
              new Date(),
          },
        });

    return mapUser(
      updated,
    );
  },

  /* ------------------------------------------------------------------------
     DELETE USER
     ------------------------------------------------------------------------ */

  async deleteById(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return;
    }

    /**
     * deleteMany keeps deleteById() idempotent:
     * deleting an already absent user remains a no-op.
     *
     * PostgreSQL ON DELETE CASCADE handles dependent registration/auth
     * records according to the existing schema.
     */
    await prisma
      .users
      .deleteMany({
        where: {
          id:
            normalizedId,
        },
      });
  },
};
