import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  writeAdminAuditLog,
} from "@/lib/server/admin/admin-audit";

import {
  createAdminSessionRecord,
  findAdminLoginRecordByEmail,
  markAdminLoginSuccess,
} from "@/lib/server/admin/admin-repository";

import {
  createAdminSessionExpiry,
  createAdminSessionToken,
  hashAdminSessionToken,
} from "@/lib/server/admin/admin-session";

import type {
  AdminLoginInput,
  AdminLoginResult,
} from "@/types/admin";

type PasswordModule =
  {
    verifyPassword?:
      (
        password: string,
        passwordHash: string,
      ) =>
        boolean |
        Promise<boolean>;

    comparePassword?:
      (
        password: string,
        passwordHash: string,
      ) =>
        boolean |
        Promise<boolean>;

    verifyPasswordHash?:
      (
        password: string,
        passwordHash: string,
      ) =>
        boolean |
        Promise<boolean>;
  };

export class AdminAuthError
  extends Error {
  readonly code:
    string;

  readonly status:
    number;

  constructor(
    code:
      string,
    message:
      string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "AdminAuthError";

    this.code =
      code;

    this.status =
      status;
  }
}

export function normalizeAdminEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

export function hashAdminIp(
  ip:
    string |
    null |
    undefined,
): string | null {
  const value =
    ip?.trim();

  if (!value) {
    return null;
  }

  return createHash(
    "sha256",
  )
    .update(
      value,
      "utf8",
    )
    .digest(
      "hex",
    );
}

async function verifyPasswordWithExistingProjectHelper(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const passwordModule =
    (
      await import(
        "@/lib/server/password"
      )
    ) as unknown as
      PasswordModule;

  const verifier =
    passwordModule
      .verifyPassword ??
    passwordModule
      .comparePassword ??
    passwordModule
      .verifyPasswordHash;

  if (!verifier) {
    throw new Error(
      "[Express-Führerschein] lib/server/password.ts muss verifyPassword(), comparePassword() oder verifyPasswordHash() exportieren.",
    );
  }

  return Boolean(
    await verifier(
      password,
      passwordHash,
    ),
  );
}

export async function loginAdmin(
  input:
    AdminLoginInput,
): Promise<AdminLoginResult> {
  const email =
    normalizeAdminEmail(
      input.email,
    );

  const password =
    input.password;

  if (
    !email ||
    email.length >
      254 ||
    !password ||
    password.length >
      512
  ) {
    throw new AdminAuthError(
      "ADMIN_INVALID_CREDENTIALS",
      "E-Mail-Adresse oder Passwort ist nicht korrekt.",
      401,
    );
  }

  const record =
    await findAdminLoginRecordByEmail(
      email,
    );

  if (
    !record ||
    !record.is_active
  ) {
    throw new AdminAuthError(
      "ADMIN_INVALID_CREDENTIALS",
      "E-Mail-Adresse oder Passwort ist nicht korrekt.",
      401,
    );
  }

  const validPassword =
    await verifyPasswordWithExistingProjectHelper(
      password,
      record.password_hash,
    );

  if (!validPassword) {
    throw new AdminAuthError(
      "ADMIN_INVALID_CREDENTIALS",
      "E-Mail-Adresse oder Passwort ist nicht korrekt.",
      401,
    );
  }

  const token =
    createAdminSessionToken();

  const tokenHash =
    hashAdminSessionToken(
      token,
    );

  const expiresAt =
    createAdminSessionExpiry(
      input.rememberMe,
    );

  const session =
    await createAdminSessionRecord({
      adminId:
        record.id,
      tokenHash,
      expiresAt,
      ipHash:
        input.ipHash ??
        null,
      userAgent:
        input.userAgent ??
        null,
    });

  await markAdminLoginSuccess(
    record.id,
  );

  await writeAdminAuditLog({
    adminId:
      record.id,
    action:
      "ADMIN_LOGIN",
    entityType:
      "admin_session",
    entityId:
      session.id,
    ipHash:
      input.ipHash ??
      null,
    userAgent:
      input.userAgent ??
      null,
  });

  return {
    token,
    expiresAt:
      session.expires_at,
    admin: {
      id:
        record.id,
      role:
        record.role,
      firstName:
        record.first_name,
      lastName:
        record.last_name,
      email:
        record.email,
    },
  };
}
