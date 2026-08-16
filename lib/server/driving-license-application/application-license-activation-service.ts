import "server-only";

import {
  activateGermanLicenseClassesForUser,
  normalizeGermanLicenseClassCodes,
} from "@/lib/server/license-classes/user-license-class-service";

const MAX_ACTIVATION_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 500;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

function isTransientDatabaseError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("server has closed the connection") ||
    message.includes("connection terminated") ||
    message.includes("connection closed") ||
    message.includes("connection reset") ||
    message.includes("socket hang up") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("p1001") ||
    message.includes("p1017")
  );
}

async function activateWithRetry(
  input: {
    userId: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
) {
  let lastError: unknown = null;

  for (
    let attempt = 1;
    attempt <= MAX_ACTIVATION_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await activateGermanLicenseClassesForUser({
        userId: input.userId,
        licenseClassCodes: input.licenseClassCodes,
        primaryLicenseClassCode:
          input.primaryLicenseClassCode ?? null,
      });
    } catch (error) {
      lastError = error;

      if (
        !isTransientDatabaseError(error) ||
        attempt === MAX_ACTIVATION_ATTEMPTS
      ) {
        throw error;
      }

      await sleep(
        BASE_RETRY_DELAY_MS * attempt,
      );
    }
  }

  throw lastError;
}

async function activateApplicationLicenseClasses(
  input: {
    applicationId: string;
    applicationStatus: string;
    userId: string;
    countryCode: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
  allowedStatuses: readonly string[],
) {
  const status = input.applicationStatus
    .trim()
    .toLowerCase();

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `[Express-Führerschein] Führerscheinklassen dürfen für den Status "${status || "(leer)"}" nicht aktiviert werden.`,
    );
  }

  if (input.countryCode.trim().toUpperCase() !== "DE") {
    throw new Error(
      "[Express-Führerschein] Die automatische Theorie-Aktivierung ist aktuell nur für Deutschland freigeschaltet.",
    );
  }

  const licenseClassCodes =
    normalizeGermanLicenseClassCodes(
      input.licenseClassCodes,
    );

  if (licenseClassCodes.length === 0) {
    throw new Error(
      "[Express-Führerschein] Die Anwendung enthält keine unterstützte deutsche Führerscheinklasse.",
    );
  }

  const requestedPrimary =
    input.primaryLicenseClassCode
      ? input.primaryLicenseClassCode
      : licenseClassCodes[0] ?? null;

  const classes =
    await activateWithRetry({
      userId: input.userId,
      licenseClassCodes,
      primaryLicenseClassCode:
        requestedPrimary,
    });

  return {
    applicationId:
      input.applicationId,

    applicationStatus:
      status,

    activatedAt:
      new Date().toISOString(),

    classes,
  };
}

/**
 * Used by the current client workflow.
 *
 * The existing application workflow persists "submitted" when the client has
 * completed and sent the application. At that point the selected class(es) are
 * stable enough to create the user's learning enrollment.
 *
 * This does NOT mark the application as approved. Administrative review stays
 * independent from Theorie access.
 */
export async function activateSubmittedApplicationLicenseClasses(
  input: {
    applicationId: string;
    applicationStatus: string;
    userId: string;
    countryCode: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
) {
  return activateApplicationLicenseClasses(
    input,
    ["submitted", "approved"],
  );
}

/**
 * Kept for the future/admin approval workflow.
 *
 * Existing callers that explicitly activate only after APPROVED continue to
 * work without any breaking change.
 */
export async function activateApprovedApplicationLicenseClasses(
  input: {
    applicationId: string;
    applicationStatus: string;
    userId: string;
    countryCode: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
) {
  return activateApplicationLicenseClasses(
    input,
    ["approved"],
  );
}
