import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  cancelAdminPraxisAppointmentRepository,
  confirmAdminPraxisAppointmentRepository,
  createAdminPraxisAppointmentRepository,
  findAdminPraxisAppointmentRepository,
  listAdminPraxisAppointmentsRepository,
  listAdminPraxisClientsRepository,
  updateAdminPraxisAppointmentRepository,
  verifyAdminPraxisCustomerRepository,
} from "@/lib/server/admin/praxis/admin-praxis-repository";

import {
  isAdminPraxisUuid,
  validateAdminPraxisCreateInput,
  validateAdminPraxisMutationInput,
} from "@/lib/server/admin/praxis/admin-praxis-validation";

import type {
  AdminPraxisAppointmentDetailView,
  AdminPraxisAppointmentView,
  AdminPraxisMutationInput,
  AdminPraxisPageData,
  AdminPraxisStatsView,
  AdminPraxisStatusView,
} from "@/types/admin-praxis";

export type AdminPraxisServiceErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CUSTOMER_NOT_FOUND"
  | "LICENSE_CLASS_INVALID"
  | "APPOINTMENT_NOT_EDITABLE"
  | "CANCELLATION_STATUS_UNSUPPORTED"
  | "DATABASE_ERROR";

export class AdminPraxisServiceError
  extends Error {
  readonly code:
    AdminPraxisServiceErrorCode;

  readonly status:
    number;

  readonly fields:
    Record<
      string,
      string
    > | undefined;

  constructor(
    code:
      AdminPraxisServiceErrorCode,
    message:
      string,
    status:
      number,
    fields?:
      Record<
        string,
        string
      >,
  ) {
    super(
      message,
    );

    this.name =
      "AdminPraxisServiceError";

    this.code =
      code;

    this.status =
      status;

    this.fields =
      fields;
  }
}

type AdminActor = {
  id:
    string;
  email:
    string;
  firstName:
    string;
  lastName:
    string;
  role:
    string;
};

function hashToken(
  value:
    string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      value,
    )
    .digest(
      "hex",
    );
}

/**
 * The existing project stores admin sessions separately from client sessions.
 *
 * To avoid coupling this module to an unverified helper filename, the service
 * validates the actual admin_sessions table directly. It checks the configured
 * ADMIN_SESSION_COOKIE_NAME first and then only cookies whose names clearly
 * identify an admin session. A cookie is never trusted by name: its SHA-256
 * token hash must resolve to a live admin_sessions row whose admin is active.
 */
async function requireAdminActor():
  Promise<AdminActor> {
  const cookieStore =
    await cookies();

  const configuredName =
    process.env
      .ADMIN_SESSION_COOKIE_NAME
      ?.trim();

  const candidateCookies =
    cookieStore
      .getAll()
      .filter(
        (
          cookie,
        ) => {
          const name =
            cookie.name.toLowerCase();

          return (
            (
              configuredName &&
              cookie.name ===
                configuredName
            ) ||
            (
              name.includes(
                "admin",
              ) &&
              name.includes(
                "session",
              )
            )
          );
        },
      );

  const tokenHashes =
    Array.from(
      new Set(
        candidateCookies
          .map(
            (
              cookie,
            ) =>
              cookie.value.trim(),
          )
          .filter(Boolean)
          .map(
            hashToken,
          ),
      ),
    );

  if (
    tokenHashes.length ===
    0
  ) {
    throw new AdminPraxisServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung wurde nicht gefunden.",
      401,
    );
  }

  const now =
    new Date();

  const session =
    await prisma.admin_sessions.findFirst({
      where: {
        token_hash: {
          in:
            tokenHashes,
        },

        revoked_at:
          null,

        expires_at: {
          gt:
            now,
        },

        admin: {
          is: {
            is_active:
              true,
          },
        },
      },

      orderBy: {
        created_at:
          "desc",
      },

      select: {
        id: true,

        admin: {
          select: {
            id: true,
            email: true,
            first_name:
              true,
            last_name:
              true,
            role: true,
            is_active:
              true,
          },
        },
      },
    });

  if (
    !session ||
    !session.admin.is_active
  ) {
    throw new AdminPraxisServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung ist ungültig oder abgelaufen.",
      401,
    );
  }

  /*
   * Presence timestamps are convenience data only. A failure here must not
   * block Praxis administration.
   */
  void Promise.allSettled([
    prisma.admin_sessions.update({
      where: {
        id:
          session.id,
      },

      data: {
        last_seen_at:
          now,
      },
    }),

    prisma.admin_users.update({
      where: {
        id:
          session.admin.id,
      },

      data: {
        last_seen_at:
          now,
      },
    }),
  ]);

  return {
    id:
      session.admin.id,
    email:
      session.admin.email,
    firstName:
      session.admin.first_name,
    lastName:
      session.admin.last_name,
    role:
      session.admin.role,
  };
}

function berlinDayKey(
  value:
    string
    | Date,
): string {
  const date =
    value instanceof
    Date
      ? value
      : new Date(
          value,
        );

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Europe/Berlin",
      year:
        "numeric",
      month:
        "2-digit",
      day:
        "2-digit",
    },
  ).format(
    date,
  );
}

function normalizeAdminPraxisStatus(
  rawStatus:
    string,
  fallbackStatus:
    AdminPraxisStatusView,
): AdminPraxisStatusView {
  const normalized =
    rawStatus
      .trim()
      .toLowerCase();

  switch (
    normalized
  ) {
    case "requested":
      return "requested";

    case "scheduled":
      return "scheduled";

    case "confirmed":
      return "confirmed";

    case "completed":
      return "completed";

    case "canceled":
    case "cancelled":
      return "cancelled";

    default:
      return fallbackStatus;
  }
}

/**
 * The repository intentionally keeps rawStatus so that database values are not
 * lost when the application introduces a new workflow state.
 *
 * `requested` was added to the PostgreSQL CHECK constraint after the initial
 * Admin Praxis module was created. Older repository mappings can therefore
 * still return `other` while rawStatus already contains `requested`.
 *
 * Normalizing here keeps the Admin UI compatible without changing Prisma or
 * duplicating database queries.
 */
function normalizeAdminPraxisAppointment<
  T extends
    AdminPraxisAppointmentView,
>(
  appointment:
    T,
): T {
  const status =
    normalizeAdminPraxisStatus(
      appointment.rawStatus,
      appointment.status,
    );

  if (
    status ===
    appointment.status
  ) {
    return appointment;
  }

  return {
    ...appointment,
    status,
  };
}

function normalizeAdminPraxisAppointments(
  appointments:
    AdminPraxisAppointmentView[],
): AdminPraxisAppointmentView[] {
  return appointments.map(
    normalizeAdminPraxisAppointment,
  );
}

function calculateStats(
  appointments:
    AdminPraxisPageData["appointments"],
): AdminPraxisStatsView {
  const todayKey =
    berlinDayKey(
      new Date(),
    );

  let today =
    0;

  let scheduled =
    0;

  let confirmed =
    0;

  let cancelled =
    0;

  for (
    const appointment
    of appointments
  ) {
    if (
      berlinDayKey(
        appointment.startsAt,
      ) ===
      todayKey
    ) {
      today +=
        1;
    }

    switch (
      appointment.status
    ) {
      case "scheduled":
        scheduled +=
          1;
        break;

      case "confirmed":
        confirmed +=
          1;
        break;

      case "cancelled":
        cancelled +=
          1;
        break;

      default:
        break;
    }
  }

  return {
    total:
      appointments.length,
    today,
    scheduled,
    confirmed,
    cancelled,
  };
}

async function verifyCustomerAndLicense(
  userId:
    string,
  userLicenseClassId:
    | string
    | null,
): Promise<void> {
  const verification =
    await verifyAdminPraxisCustomerRepository(
      userId,
      userLicenseClassId,
    );

  if (
    !verification.exists
  ) {
    throw new AdminPraxisServiceError(
      "CUSTOMER_NOT_FOUND",
      "Der ausgewählte Kunde wurde nicht gefunden.",
      404,
      {
        userId:
          "Der Kunde wurde nicht gefunden.",
      },
    );
  }

  if (
    !verification.licenseClassValid
  ) {
    throw new AdminPraxisServiceError(
      "LICENSE_CLASS_INVALID",
      "Die ausgewählte Führerscheinklasse gehört nicht zu diesem Kunden.",
      422,
      {
        userLicenseClassId:
          "Bitte wähle eine Führerscheinklasse dieses Kunden.",
      },
    );
  }
}

function wrapDatabaseError(
  error:
    unknown,
  context:
    string,
): never {
  if (
    error instanceof
    AdminPraxisServiceError
  ) {
    throw error;
  }

  console.error(
    `[Express-Führerschein] ${context}`,
    error instanceof
      Error
      ? {
          name:
            error.name,
          message:
            error.message,
          stack:
            process.env.NODE_ENV ===
            "development"
              ? error.stack
              : undefined,
        }
      : error,
  );

  throw new AdminPraxisServiceError(
    "DATABASE_ERROR",
    "Die Praxisdaten konnten gerade nicht verarbeitet werden.",
    500,
  );
}

export async function getAdminPraxisPageData():
  Promise<AdminPraxisPageData> {
  await requireAdminActor();

  try {
    const [
      appointments,
      clients,
    ] =
      await Promise.all([
        listAdminPraxisAppointmentsRepository(),
        listAdminPraxisClientsRepository(),
      ]);

    const normalizedAppointments =
      normalizeAdminPraxisAppointments(
        appointments,
      );

    return {
      appointments:
        normalizedAppointments,
      clients,
      stats:
        calculateStats(
          normalizedAppointments,
        ),
      generatedAt:
        new Date().toISOString(),
    };
  } catch (
    error
  ) {
    wrapDatabaseError(
      error,
      "admin Praxis page loading failed",
    );
  }
}

export async function getAdminPraxisAppointment(
  appointmentId:
    string,
): Promise<AdminPraxisAppointmentDetailView> {
  await requireAdminActor();

  if (
    !isAdminPraxisUuid(
      appointmentId,
    )
  ) {
    throw new AdminPraxisServiceError(
      "NOT_FOUND",
      "Der Praxistermin wurde nicht gefunden.",
      404,
    );
  }

  try {
    const appointment =
      await findAdminPraxisAppointmentRepository(
        appointmentId,
      );

    if (
      !appointment
    ) {
      throw new AdminPraxisServiceError(
        "NOT_FOUND",
        "Der Praxistermin wurde nicht gefunden.",
        404,
      );
    }

    return normalizeAdminPraxisAppointment(
      appointment,
    );
  } catch (
    error
  ) {
    wrapDatabaseError(
      error,
      "admin Praxis appointment loading failed",
    );
  }
}

export async function createAdminPraxisAppointment(
  rawInput:
    unknown,
): Promise<AdminPraxisAppointmentDetailView> {
  const admin =
    await requireAdminActor();

  const validation =
    validateAdminPraxisCreateInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new AdminPraxisServiceError(
      "VALIDATION_ERROR",
      "Bitte prüfe die Angaben zur Fahrstunde.",
      422,
      validation.errors,
    );
  }

  await verifyCustomerAndLicense(
    validation.data.userId,
    validation.data
      .userLicenseClassId,
  );

  try {
    const created =
      await createAdminPraxisAppointmentRepository(
        validation.data,
        admin.id,
      );

    return normalizeAdminPraxisAppointment(
      created,
    );
  } catch (
    error
  ) {
    wrapDatabaseError(
      error,
      "admin Praxis appointment creation failed",
    );
  }
}

async function updateAppointment(
  appointmentId:
    string,
  mutation:
    Extract<
      AdminPraxisMutationInput,
      {
        action:
          "update";
      }
    >,
  adminId:
    string,
): Promise<AdminPraxisAppointmentDetailView> {
  const current =
    await findAdminPraxisAppointmentRepository(
      appointmentId,
    );

  if (
    !current
  ) {
    throw new AdminPraxisServiceError(
      "NOT_FOUND",
      "Der Praxistermin wurde nicht gefunden.",
      404,
    );
  }

  await verifyCustomerAndLicense(
    current.customer.id,
    mutation.data
      .userLicenseClassId,
  );

  const updated =
    await updateAdminPraxisAppointmentRepository(
      appointmentId,
      mutation.data,
      adminId,
    );

  if (
    !updated
  ) {
    throw new AdminPraxisServiceError(
      "APPOINTMENT_NOT_EDITABLE",
      "Dieser Praxistermin kann nicht mehr bearbeitet werden.",
      409,
    );
  }

  return normalizeAdminPraxisAppointment(
    updated,
  );
}

export async function mutateAdminPraxisAppointment(
  appointmentId:
    string,
  rawInput:
    unknown,
): Promise<AdminPraxisAppointmentDetailView> {
  const admin =
    await requireAdminActor();

  if (
    !isAdminPraxisUuid(
      appointmentId,
    )
  ) {
    throw new AdminPraxisServiceError(
      "NOT_FOUND",
      "Der Praxistermin wurde nicht gefunden.",
      404,
    );
  }

  const validation =
    validateAdminPraxisMutationInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new AdminPraxisServiceError(
      "VALIDATION_ERROR",
      "Bitte prüfe die übermittelten Daten.",
      422,
      validation.errors,
    );
  }

  try {
    switch (
      validation.data.action
    ) {
      case "update":
        return await updateAppointment(
          appointmentId,
          validation.data,
          admin.id,
        );

      case "confirm": {
        const confirmed =
          await confirmAdminPraxisAppointmentRepository(
            appointmentId,
            admin.id,
          );

        if (
          !confirmed
        ) {
          throw new AdminPraxisServiceError(
            "APPOINTMENT_NOT_EDITABLE",
            "Dieser Praxistermin kann nicht bestätigt werden.",
            409,
          );
        }

        return normalizeAdminPraxisAppointment(
          confirmed,
        );
      }

      case "cancel": {
        const cancelled =
          await cancelAdminPraxisAppointmentRepository(
            appointmentId,
            admin.id,
            validation.data
              .reason ??
              null,
          );

        if (
          cancelled ===
          "STATUS_UNSUPPORTED"
        ) {
          throw new AdminPraxisServiceError(
            "CANCELLATION_STATUS_UNSUPPORTED",
            "Die Datenbank erlaubt aktuell keinen bekannten Stornierungsstatus für user_appointments. Der Termin wurde nicht verändert.",
            409,
          );
        }

        if (
          !cancelled
        ) {
          throw new AdminPraxisServiceError(
            "NOT_FOUND",
            "Der Praxistermin wurde nicht gefunden.",
            404,
          );
        }

        return normalizeAdminPraxisAppointment(
          cancelled,
        );
      }
    }
  } catch (
    error
  ) {
    wrapDatabaseError(
      error,
      "admin Praxis appointment mutation failed",
    );
  }
}

/**
 * Explicit export for API/page integration tests and future shared admin
 * middleware. The raw actor is never returned to the browser.
 */
export async function assertAdminPraxisSession():
  Promise<void> {
  await requireAdminActor();
}
