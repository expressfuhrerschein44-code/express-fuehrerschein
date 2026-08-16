/**
 * Express-Führerschein
 * Profile security service.
 *
 * Prisma compatibility:
 * - no Prisma.sql;
 * - no generic raw-query type arguments;
 * - no implicitly-any interactive transaction callback.
 *
 * Security:
 * - password changes revoke all sessions;
 * - TOTP secrets are encrypted at rest with AES-256-GCM;
 * - 2FA is optional until its additive DB migration exists.
 */

import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/server/password";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  sessionRepository,
} from "@/lib/server/repositories/session-repository";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import {
  validateChangeProfilePasswordInput,
} from "@/lib/validation/profile";

import type {
  ProfileSecurity,
  ProfileTwoFactorSetup,
} from "@/types/profile";

import {
  ProfileServiceError,
} from "@/types/profile";

/* ==========================================================================
   RAW TYPES
   ========================================================================== */

interface TableReadyRow {
  exists:
    boolean;
}

interface TwoFactorStateRow {
  method:
    string;

  enabled_at:
    Date | null;

  verified_at:
    Date | null;
}

interface TwoFactorSecretRow {
  secret_encrypted:
    string;
}

/* ==========================================================================
   PASSWORD
   ========================================================================== */

export async function changeProfilePassword(
  userId:
    string,

  rawInput:
    unknown,
): Promise<void> {
  const validation =
    validateChangeProfilePasswordInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new ProfileServiceError(
      "VALIDATION_ERROR",

      "Die Passwortangaben sind ungültig.",

      validation.errors,
    );
  }

  const user =
    await userRepository
      .findById(
        userId,
      );

  if (
    !user
  ) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",

      "Das Konto konnte nicht gefunden werden.",
    );
  }

  const currentPasswordValid =
    await verifyPassword(
      validation
        .data
        .currentPassword,

      user.passwordHash,
    );

  if (
    !currentPasswordValid
  ) {
    throw new ProfileServiceError(
      "INVALID_CURRENT_PASSWORD",

      "Das aktuelle Passwort ist nicht korrekt.",
    );
  }

  const samePassword =
    await verifyPassword(
      validation
        .data
        .newPassword,

      user.passwordHash,
    );

  if (
    samePassword
  ) {
    throw new ProfileServiceError(
      "SAME_PASSWORD",

      "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.",
    );
  }

  const passwordHash =
    await hashPassword(
      validation
        .data
        .newPassword,
    );

  const updated =
    await userRepository
      .updatePasswordHash(
        userId,
        passwordHash,
      );

  if (
    !updated
  ) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",

      "Das Passwort konnte nicht aktualisiert werden.",
    );
  }

  /**
   * Password change invalidates all current sessions.
   * The API route should then clear the ef_session cookie.
   */
  await sessionRepository
    .revokeAllForUser(
      userId,
    );
}

/* ==========================================================================
   2FA TABLE
   ========================================================================== */

async function twoFactorTableReady():
  Promise<boolean> {
  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              to_regclass('public.user_two_factor_settings') IS NOT NULL
                AS "exists"
          `,
        )
    ) as
      TableReadyRow[];

  return rows[0]
    ?.exists ===
    true;
}

export async function getProfileSecurityState(
  userId:
    string,
): Promise<ProfileSecurity> {
  if (
    !await twoFactorTableReady()
  ) {
    return {
      twoFactorEnabled:
        false,

      twoFactorMethod:
        null,
    };
  }

  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              method,
              enabled_at,
              verified_at
            FROM user_two_factor_settings
            WHERE user_id = $1::uuid
            LIMIT 1
          `,
          userId,
        )
    ) as
      TwoFactorStateRow[];

  const row =
    rows[0];

  const enabled =
    Boolean(
      row?.enabled_at &&
      row?.verified_at &&
      row.method ===
        "totp",
    );

  return {
    twoFactorEnabled:
      enabled,

    twoFactorMethod:
      enabled
        ? "totp"
        : null,
  };
}

/* ==========================================================================
   TOTP HELPERS
   ========================================================================== */

const BASE32_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(
  bytes:
    Uint8Array,
): string {
  let bits =
    0;

  let value =
    0;

  let output =
    "";

  for (
    const byte of
    bytes
  ) {
    value =
      (
        value <<
        8
      ) |
      byte;

    bits +=
      8;

    while (
      bits >=
      5
    ) {
      output +=
        BASE32_ALPHABET[
          (
            value >>
            (
              bits -
              5
            )
          ) &
          31
        ];

      bits -=
        5;
    }
  }

  if (
    bits >
    0
  ) {
    output +=
      BASE32_ALPHABET[
        (
          value <<
          (
            5 -
            bits
          )
        ) &
        31
      ];
  }

  return output;
}

function base32Decode(
  input:
    string,
): Buffer {
  const normalized =
    input
      .replace(
        /=+$/g,
        "",
      )
      .toUpperCase();

  let bits =
    0;

  let value =
    0;

  const bytes:
    number[] = [];

  for (
    const character of
    normalized
  ) {
    const index =
      BASE32_ALPHABET.indexOf(
        character,
      );

    if (
      index <
      0
    ) {
      throw new Error(
        "Invalid base32 secret.",
      );
    }

    value =
      (
        value <<
        5
      ) |
      index;

    bits +=
      5;

    if (
      bits >=
      8
    ) {
      bytes.push(
        (
          value >>
          (
            bits -
            8
          )
        ) &
        255,
      );

      bits -=
        8;
    }
  }

  return Buffer.from(
    bytes,
  );
}

function encryptionMaterial():
  string {
  const value =
    (
      process.env
        .TWO_FACTOR_ENCRYPTION_KEY ??
      process.env
        .TWO_FACTOR_SECRET_PEPPER
    )
      ?.trim();

  if (
    !value
  ) {
    throw new ProfileServiceError(
      "TWO_FACTOR_NOT_READY",

      "Die Zwei-Faktor-Authentifizierung ist noch nicht vollständig konfiguriert.",
    );
  }

  return value;
}

function encryptionKey():
  Buffer {
  return createHash(
    "sha256",
  )
    .update(
      encryptionMaterial(),
      "utf8",
    )
    .digest();
}

function encryptTotpSecret(
  secret:
    string,
): string {
  const iv =
    randomBytes(
      12,
    );

  const cipher =
    createCipheriv(
      "aes-256-gcm",
      encryptionKey(),
      iv,
    );

  const ciphertext =
    Buffer.concat([
      cipher.update(
        secret,
        "utf8",
      ),

      cipher.final(),
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    "v1",
    iv.toString(
      "base64url",
    ),
    tag.toString(
      "base64url",
    ),
    ciphertext.toString(
      "base64url",
    ),
  ].join(
    ":",
  );
}

function decryptTotpSecret(
  encrypted:
    string,
): string {
  const [
    version,
    ivText,
    tagText,
    ciphertextText,
  ] =
    encrypted.split(
      ":",
    );

  if (
    version !==
      "v1" ||
    !ivText ||
    !tagText ||
    !ciphertextText
  ) {
    throw new Error(
      "Invalid encrypted 2FA secret.",
    );
  }

  const decipher =
    createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(
        ivText,
        "base64url",
      ),
    );

  decipher.setAuthTag(
    Buffer.from(
      tagText,
      "base64url",
    ),
  );

  const plaintext =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          ciphertextText,
          "base64url",
        ),
      ),

      decipher.final(),
    ]);

  return plaintext.toString(
    "utf8",
  );
}

function totpAtCounter(
  secret:
    string,

  counter:
    number,
): string {
  const key =
    base32Decode(
      secret,
    );

  const message =
    Buffer.alloc(
      8,
    );

  message.writeBigUInt64BE(
    BigInt(
      counter,
    ),
  );

  const digest =
    createHmac(
      "sha1",
      key,
    )
      .update(
        message,
      )
      .digest();

  const offset =
    digest[
      digest.length -
      1
    ] &
    0x0f;

  const binary =
    (
      (
        digest[offset] &
        0x7f
      ) <<
      24
    ) |
    (
      digest[
        offset +
        1
      ] <<
      16
    ) |
    (
      digest[
        offset +
        2
      ] <<
      8
    ) |
    digest[
      offset +
      3
    ];

  return (
    binary %
    1_000_000
  )
    .toString()
    .padStart(
      6,
      "0",
    );
}

function verifyTotp(
  secret:
    string,

  code:
    string,
): boolean {
  if (
    !/^\d{6}$/.test(
      code,
    )
  ) {
    return false;
  }

  const currentCounter =
    Math.floor(
      Date.now() /
      1000 /
      30,
    );

  const provided =
    Buffer.from(
      code,
      "utf8",
    );

  for (
    const drift of
    [
      -1,
      0,
      1,
    ]
  ) {
    const expected =
      Buffer.from(
        totpAtCounter(
          secret,
          currentCounter +
            drift,
        ),
        "utf8",
      );

    if (
      expected.length ===
        provided.length &&
      timingSafeEqual(
        expected,
        provided,
      )
    ) {
      return true;
    }
  }

  return false;
}

/* ==========================================================================
   2FA WORKFLOW
   ========================================================================== */

export async function beginTwoFactorSetup(
  userId:
    string,

  accountEmail:
    string,
): Promise<ProfileTwoFactorSetup> {
  if (
    !await twoFactorTableReady()
  ) {
    throw new ProfileServiceError(
      "TWO_FACTOR_NOT_READY",

      "Die Zwei-Faktor-Authentifizierung ist noch nicht in der Datenbank aktiviert.",
    );
  }

  const secret =
    base32Encode(
      randomBytes(
        20,
      ),
    );

  const encryptedSecret =
    encryptTotpSecret(
      secret,
    );

  await prisma
    .$executeRawUnsafe(
      `
        INSERT INTO user_two_factor_settings (
          user_id,
          method,
          secret_encrypted,
          enabled_at,
          verified_at,
          created_at,
          updated_at
        )
        VALUES (
          $1::uuid,
          'totp',
          $2,
          NULL,
          NULL,
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          method = 'totp',
          secret_encrypted = EXCLUDED.secret_encrypted,
          enabled_at = NULL,
          verified_at = NULL,
          updated_at = NOW()
      `,
      userId,
      encryptedSecret,
    );

  const issuer =
    "Express-Führerschein";

  const label =
    `${issuer}:${accountEmail}`;

  return {
    method:
      "totp",

    secret,

    otpauthUri:
      `otpauth://totp/${encodeURIComponent(label)}` +
      `?secret=${encodeURIComponent(secret)}` +
      `&issuer=${encodeURIComponent(issuer)}` +
      "&algorithm=SHA1&digits=6&period=30",
  };
}

export async function confirmTwoFactorSetup(
  userId:
    string,

  code:
    string,
): Promise<void> {
  if (
    !await twoFactorTableReady()
  ) {
    throw new ProfileServiceError(
      "TWO_FACTOR_NOT_READY",

      "Die Zwei-Faktor-Authentifizierung ist noch nicht verfügbar.",
    );
  }

  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              secret_encrypted
            FROM user_two_factor_settings
            WHERE user_id = $1::uuid
              AND method = 'totp'
            LIMIT 1
          `,
          userId,
        )
    ) as
      TwoFactorSecretRow[];

  const encryptedSecret =
    rows[0]
      ?.secret_encrypted;

  if (
    !encryptedSecret
  ) {
    throw new ProfileServiceError(
      "TWO_FACTOR_NOT_READY",

      "Starte zuerst die Einrichtung der Zwei-Faktor-Authentifizierung.",
    );
  }

  let secret:
    string;

  try {
    secret =
      decryptTotpSecret(
        encryptedSecret,
      );
  } catch {
    throw new ProfileServiceError(
      "TWO_FACTOR_NOT_READY",

      "Die Zwei-Faktor-Konfiguration konnte nicht gelesen werden.",
    );
  }

  if (
    !verifyTotp(
      secret,
      code.trim(),
    )
  ) {
    throw new ProfileServiceError(
      "TWO_FACTOR_INVALID_CODE",

      "Der Bestätigungscode ist nicht korrekt.",
    );
  }

  await prisma
    .$executeRawUnsafe(
      `
        UPDATE user_two_factor_settings
        SET
          verified_at = NOW(),
          enabled_at = NOW(),
          updated_at = NOW()
        WHERE user_id = $1::uuid
          AND method = 'totp'
      `,
      userId,
    );
}

export async function disableTwoFactor(
  userId:
    string,

  currentPassword:
    string,
): Promise<void> {
  const user =
    await userRepository
      .findById(
        userId,
      );

  if (
    !user
  ) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",

      "Das Konto konnte nicht gefunden werden.",
    );
  }

  const passwordValid =
    await verifyPassword(
      currentPassword,
      user.passwordHash,
    );

  if (
    !passwordValid
  ) {
    throw new ProfileServiceError(
      "INVALID_CURRENT_PASSWORD",

      "Das aktuelle Passwort ist nicht korrekt.",
    );
  }

  if (
    !await twoFactorTableReady()
  ) {
    return;
  }

  await prisma
    .$executeRawUnsafe(
      `
        DELETE FROM user_two_factor_settings
        WHERE user_id = $1::uuid
      `,
      userId,
    );
}
