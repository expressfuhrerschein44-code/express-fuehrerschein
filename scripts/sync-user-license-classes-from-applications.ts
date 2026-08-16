import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GERMAN_LICENSE_CLASS_CODES = [
  "AM",
  "A1",
  "A2",
  "A",
  "B",
  "BE",
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
  "L",
  "T",
] as const;

const GERMAN_LICENSE_CLASS_SET =
  new Set<string>(
    GERMAN_LICENSE_CLASS_CODES,
  );

const MAX_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 1_000;

function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds,
    );
  });
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

function isTransientDatabaseError(
  error: unknown,
): boolean {
  const message =
    getErrorMessage(error)
      .toLowerCase();

  return (
    message.includes(
      "server has closed the connection",
    ) ||
    message.includes(
      "connection terminated",
    ) ||
    message.includes(
      "connection closed",
    ) ||
    message.includes(
      "connection reset",
    ) ||
    message.includes(
      "socket hang up",
    ) ||
    message.includes(
      "econnreset",
    ) ||
    message.includes(
      "econnrefused",
    ) ||
    message.includes(
      "timed out",
    ) ||
    message.includes(
      "timeout",
    ) ||
    message.includes("p1001") ||
    message.includes("p1017")
  );
}

function normalizeGermanLicenseClassCodes(
  values: readonly string[],
): string[] {
  const uniqueCodes = [
    ...new Set(
      values.map((value) =>
        value
          .trim()
          .toUpperCase(),
      ),
    ),
  ].filter(Boolean);

  for (const code of uniqueCodes) {
    if (
      !GERMAN_LICENSE_CLASS_SET.has(
        code,
      )
    ) {
      throw new Error(
        `[Express-Führerschein] Nicht unterstützte deutsche Führerscheinklasse: ${code}.`,
      );
    }
  }

  return uniqueCodes;
}

/**
 * Synchronizes exactly one submitted/approved application with
 * user_license_classes.
 *
 * This script intentionally imports PrismaClient directly instead of
 * "@/lib/server/prisma" or any "server-only" module so it can be executed by:
 *
 *   npx tsx scripts/sync-user-license-classes-from-applications.ts
 *
 * The operations are idempotent:
 * - unique key: (user_id, license_class_code)
 * - existing rows are reactivated/updated
 * - no duplicate license class is created for one user
 *
 * No long Prisma interactive transaction is used. If the remote database
 * connection is interrupted, rerunning this user is safe.
 */
async function synchronizeApplication(
  application: {
    id: string;
    user_id: string;
    selected_classes: string[];
    status: string;
    users: {
      country_code: string;
    };
  },
): Promise<void> {
  const countryCode =
    application.users.country_code
      .trim()
      .toUpperCase();

  if (countryCode !== "DE") {
    throw new Error(
      `[Express-Führerschein] Benutzer ${application.user_id} ist nicht DE.`,
    );
  }

  const status =
    application.status
      .trim()
      .toLowerCase();

  if (
    status !== "submitted" &&
    status !== "approved"
  ) {
    throw new Error(
      `[Express-Führerschein] Antrag ${application.id} ist nicht submitted/approved.`,
    );
  }

  const licenseClassCodes =
    normalizeGermanLicenseClassCodes(
      application.selected_classes,
    );

  if (
    licenseClassCodes.length === 0
  ) {
    throw new Error(
      `[Express-Führerschein] Antrag ${application.id} enthält keine Führerscheinklasse.`,
    );
  }

  /**
   * The first class selected in "Mein Führerschein" is the intended primary
   * class, matching the current application integration.
   */
  const primaryCode =
    licenseClassCodes[0];

  /**
   * Keep exactly one primary class for this user.
   * Old/inactive primary rows are also cleared.
   */
  await prisma
    .user_license_classes
    .updateMany({
      where: {
        user_id:
          application.user_id,

        is_primary:
          true,

        license_class_code: {
          not:
            primaryCode,
        },
      },

      data: {
        is_primary:
          false,
      },
    });

  for (
    const code
    of licenseClassCodes
  ) {
    await prisma
      .user_license_classes
      .upsert({
        where: {
          user_id_license_class_code: {
            user_id:
              application.user_id,

            license_class_code:
              code,
          },
        },

        create: {
          user_id:
            application.user_id,

          license_class_code:
            code,

          status:
            "active",

          is_primary:
            code === primaryCode,

          started_at:
            new Date(),

          completed_at:
            null,
        },

        update: {
          status:
            "active",

          is_primary:
            code === primaryCode,

          completed_at:
            null,
        },
      });
  }

  /**
   * Final safety normalization. This also repairs a partially completed run.
   */
  await prisma
    .user_license_classes
    .updateMany({
      where: {
        user_id:
          application.user_id,

        license_class_code: {
          not:
            primaryCode,
        },

        is_primary:
          true,
      },

      data: {
        is_primary:
          false,
      },
    });

  const primary =
    await prisma
      .user_license_classes
      .findUnique({
        where: {
          user_id_license_class_code: {
            user_id:
              application.user_id,

            license_class_code:
              primaryCode,
          },
        },

        select: {
          id:
            true,

          status:
            true,

          is_primary:
            true,
        },
      });

  if (
    !primary ||
    primary.status !== "active" ||
    !primary.is_primary
  ) {
    throw new Error(
      `[Express-Führerschein] Primäre Führerscheinklasse ${primaryCode} konnte für Benutzer ${application.user_id} nicht bestätigt werden.`,
    );
  }
}

async function synchronizeApplicationWithRetry(
  application: {
    id: string;
    user_id: string;
    selected_classes: string[];
    status: string;
    users: {
      country_code: string;
    };
  },
): Promise<void> {
  let lastError: unknown = null;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt += 1
  ) {
    try {
      await synchronizeApplication(
        application,
      );

      return;
    } catch (error) {
      lastError = error;

      if (
        !isTransientDatabaseError(
          error,
        ) ||
        attempt === MAX_ATTEMPTS
      ) {
        throw error;
      }

      const delay =
        BASE_RETRY_DELAY_MS *
        attempt;

      console.warn(
        `⚠ Verbindung unterbrochen. Neuer Versuch für Benutzer ${application.user_id} (${attempt}/${MAX_ATTEMPTS}) in ${delay} ms.`,
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

async function main(): Promise<void> {
  await prisma.$connect();

  /**
   * Only applications that have actually been submitted (or already approved)
   * are eligible. Drafts are deliberately ignored.
   */
  const applications =
    await prisma
      .driving_license_applications
      .findMany({
        where: {
          status: {
            in: [
              "submitted",
              "approved",
            ],
          },

          users: {
            country_code:
              "DE",
          },
        },

        orderBy: {
          updated_at:
            "desc",
        },

        select: {
          id:
            true,

          user_id:
            true,

          selected_classes:
            true,

          status:
            true,

          users: {
            select: {
              country_code:
                true,
            },
          },
        },
      });

  /**
   * The query is newest-first. Keep only the latest eligible application for
   * each user, so historical applications do not override the current choice.
   */
  const latestApplicationByUser =
    new Map<
      string,
      (typeof applications)[number]
    >();

  for (
    const application
    of applications
  ) {
    if (
      !latestApplicationByUser.has(
        application.user_id,
      )
    ) {
      latestApplicationByUser.set(
        application.user_id,
        application,
      );
    }
  }

  let synchronizedUsers = 0;
  let failedUsers = 0;

  for (
    const application
    of latestApplicationByUser.values()
  ) {
    try {
      await synchronizeApplicationWithRetry(
        application,
      );

      synchronizedUsers += 1;

      console.log(
        `✓ ${application.user_id}: ${application.selected_classes.join(", ")}`,
      );
    } catch (error) {
      failedUsers += 1;

      console.error(
        `✗ ${application.user_id}: ${getErrorMessage(error)}`,
      );
    }
  }

  console.log("");
  console.log(
    `Synchronisation abgeschlossen: ${synchronizedUsers} Benutzer aktualisiert, ${failedUsers} fehlgeschlagen.`,
  );

  if (failedUsers > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(
      getErrorMessage(error),
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma
      .$disconnect()
      .catch(() => undefined);
  });
