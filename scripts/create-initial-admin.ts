/**
 * Express-Führerschein
 * Initial autonomous Super Admin bootstrap.
 *
 * This script respects the existing Prisma architecture:
 *
 * - Admin identities live exclusively in `admin_users`.
 * - No client `users` row is created or required.
 * - No phone number is required.
 * - `legacy_user_id` is intentionally left untouched.
 * - Running the script again updates the same admin account.
 *
 * Required environment variables:
 *   INITIAL_ADMIN_EMAIL
 *   INITIAL_ADMIN_PASSWORD
 *
 * Optional environment variables:
 *   INITIAL_ADMIN_FIRST_NAME
 *   INITIAL_ADMIN_LAST_NAME
 */

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/server/password";

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 12;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;

function requiredEnv(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `[Express-Führerschein] ${name} fehlt.`,
    );
  }

  return value;
}

function optionalEnv(
  name: string,
  fallback: string,
): string {
  return (
    process.env[name]?.trim() ||
    fallback
  );
}

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function validateEmail(
  email: string,
): void {
  if (
    !email.includes("@") ||
    email.startsWith("@") ||
    email.endsWith("@")
  ) {
    throw new Error(
      "[Express-Führerschein] Die Admin-E-Mail-Adresse ist ungültig.",
    );
  }

  if (
    email.length >
    MAX_EMAIL_LENGTH
  ) {
    throw new Error(
      `[Express-Führerschein] Die Admin-E-Mail-Adresse darf maximal ${MAX_EMAIL_LENGTH} Zeichen enthalten.`,
    );
  }
}

function validatePassword(
  password: string,
): void {
  if (
    password.length <
    MIN_PASSWORD_LENGTH
  ) {
    throw new Error(
      `[Express-Führerschein] Das Admin-Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen enthalten.`,
    );
  }
}

function validateName(
  value: string,
  label: string,
): void {
  if (!value.trim()) {
    throw new Error(
      `[Express-Führerschein] ${label} darf nicht leer sein.`,
    );
  }

  if (
    value.length >
    MAX_NAME_LENGTH
  ) {
    throw new Error(
      `[Express-Führerschein] ${label} darf maximal ${MAX_NAME_LENGTH} Zeichen enthalten.`,
    );
  }
}

/**
 * Find an existing administrator case-insensitively.
 *
 * The database has a unique constraint on `email`, but PostgreSQL
 * string uniqueness is normally case-sensitive.
 *
 * Using an insensitive lookup also protects against historical rows
 * such as:
 *
 *   Admin@example.com
 *   admin@example.com
 *
 * If more than one matching row exists, the script stops instead of
 * modifying an ambiguous administrator account.
 */
async function findExistingAdmin(
  email: string,
) {
  const matches =
    await prisma.admin_users.findMany({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },

      take: 2,

      select: {
        id: true,
        email: true,
      },
    });

  if (
    matches.length >
    1
  ) {
    throw new Error(
      "[Express-Führerschein] Mehrere Administratoren mit derselben E-Mail-Adresse wurden gefunden. Bitte die Datenbank zuerst bereinigen.",
    );
  }

  return matches[0] ?? null;
}

/**
 * Create or refresh the initial Super Admin.
 *
 * This operation only touches the `admin_users` table.
 *
 * `legacy_user_id` is deliberately omitted:
 * it exists only for backward compatibility and is nullable.
 */
async function main(): Promise<void> {
  const email =
    normalizeEmail(
      requiredEnv(
        "INITIAL_ADMIN_EMAIL",
      ),
    );

  const password =
    requiredEnv(
      "INITIAL_ADMIN_PASSWORD",
    );

  const firstName =
    optionalEnv(
      "INITIAL_ADMIN_FIRST_NAME",
      "Express",
    );

  const lastName =
    optionalEnv(
      "INITIAL_ADMIN_LAST_NAME",
      "Administrator",
    );

  validateEmail(email);
  validatePassword(password);

  validateName(
    firstName,
    "INITIAL_ADMIN_FIRST_NAME",
  );

  validateName(
    lastName,
    "INITIAL_ADMIN_LAST_NAME",
  );

  const passwordHash =
    await hashPassword(
      password,
    );

  const existingAdmin =
    await findExistingAdmin(
      email,
    );

  const admin =
    existingAdmin
      ? await prisma.admin_users.update({
          where: {
            id: existingAdmin.id,
          },

          data: {
            email,
            password_hash:
              passwordHash,
            first_name:
              firstName,
            last_name:
              lastName,
            role:
              "super_admin",
            is_active:
              true,
          },

          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
          },
        })
      : await prisma.admin_users.create({
          data: {
            email,
            password_hash:
              passwordHash,
            first_name:
              firstName,
            last_name:
              lastName,
            role:
              "super_admin",
            is_active:
              true,
          },

          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
          },
        });

  console.log("");
  console.log(
    "================================================",
  );
  console.log(
    " Express-Führerschein – Super Admin bereit",
  );
  console.log(
    "================================================",
  );

  console.log(
    `E-Mail   : ${admin.email}`,
  );

  console.log(
    `Name     : ${admin.first_name} ${admin.last_name}`,
  );

  console.log(
    `Rolle    : ${admin.role}`,
  );

  console.log(
    `Aktiv    : ${
      admin.is_active
        ? "ja"
        : "nein"
    }`,
  );

  console.log(
    `Admin ID : ${admin.id}`,
  );

  console.log(
    "================================================",
  );
  console.log("");
}

main()
  .catch(
    (
      error: unknown,
    ) => {
      console.error("");
      console.error(
        "================================================",
      );

      console.error(
        "[Express-Führerschein] Initial Admin konnte nicht erstellt werden.",
      );

      console.error(
        "================================================",
      );

      console.error(
        error,
      );

      process.exitCode = 1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );