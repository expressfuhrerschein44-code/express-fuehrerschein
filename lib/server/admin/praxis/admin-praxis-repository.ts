import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  AdminPraxisAppointmentDetailView,
  AdminPraxisAppointmentView,
  AdminPraxisClientOption,
  AdminPraxisCreateInput,
  AdminPraxisLicenseClassView,
  AdminPraxisManagerView,
  AdminPraxisStatusView,
  AdminPraxisUpdateInput,
} from "@/types/admin-praxis";

/**
 * This marker lets the Praxis module identify rows created by this module
 * without adding a new Prisma column or relying on an unverified
 * appointment_type CHECK value.
 *
 * It is stored only inside admin_notes and stripped before admin notes are
 * displayed. The client never needs to see it.
 */
const PRAXIS_MARKER =
  "[EXPRESS_PRAXIS]";

const appointmentSelect = {
  id: true,
  user_id: true,
  user_license_class_id:
    true,
  appointment_type:
    true,
  title: true,
  location: true,
  starts_at: true,
  ends_at: true,
  status: true,
  notes: true,
  admin_notes: true,
  managed_by_admin_id:
    true,
  confirmed_at: true,
  cancelled_at: true,
  created_at: true,
  updated_at: true,

  users: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_e164: true,
      country_code: true,
    },
  },

  user_license_classes: {
    select: {
      id: true,
      license_class_code:
        true,
      status: true,
      is_primary: true,
    },
  },

  managed_by_admin: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
    },
  },
} satisfies Prisma.user_appointmentsSelect;

type AppointmentRow =
  Prisma.user_appointmentsGetPayload<{
    select:
      typeof appointmentSelect;
  }>;

type CheckConstraintRow = {
  definition:
    string;
};

function normalizeText(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim() ?? "";
}

function fullName(
  firstName: string,
  lastName: string,
): string {
  return [
    firstName.trim(),
    lastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function stripPraxisMarker(
  value:
    | string
    | null,
): string | null {
  if (!value) {
    return null;
  }

  const stripped = value
    .replace(
      PRAXIS_MARKER,
      "",
    )
    .trim();

  return stripped || null;
}

function withPraxisMarker(
  value:
    | string
    | null,
): string {
  const normalized =
    normalizeText(value);

  return normalized
    ? `${PRAXIS_MARKER}\n${normalized}`
    : PRAXIS_MARKER;
}

function toIso(
  value:
    | Date
    | null,
): string | null {
  return value
    ? value.toISOString()
    : null;
}

function mapStatus(
  row: Pick<
    AppointmentRow,
    | "status"
    | "cancelled_at"
  >,
): AdminPraxisStatusView {
  if (
    row.cancelled_at
  ) {
    return "cancelled";
  }

  switch (
    row.status
      .trim()
      .toLowerCase()
  ) {
    case "scheduled":
      return "scheduled";

    case "confirmed":
      return "confirmed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "completed":
    case "done":
      return "completed";

    default:
      return "other";
  }
}

function mapLicenseClass(
  row:
    AppointmentRow["user_license_classes"],
): AdminPraxisLicenseClassView | null {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,
    code:
      row.license_class_code,
    status:
      row.status,
    isPrimary:
      row.is_primary,
  };
}

function mapManager(
  row:
    AppointmentRow["managed_by_admin"],
): AdminPraxisManagerView | null {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,
    firstName:
      row.first_name,
    lastName:
      row.last_name,
    fullName:
      fullName(
        row.first_name,
        row.last_name,
      ),
    email:
      row.email,
  };
}

function mapAppointment(
  row:
    AppointmentRow,
): AdminPraxisAppointmentView {
  return {
    id:
      row.id,
    appointmentType:
      row.appointment_type,
    title:
      row.title,
    location:
      row.location,
    startsAt:
      row.starts_at.toISOString(),
    endsAt:
      toIso(
        row.ends_at,
      ),
    status:
      mapStatus(
        row,
      ),
    rawStatus:
      row.status,
    notes:
      row.notes,
    adminNotes:
      stripPraxisMarker(
        row.admin_notes,
      ),
    confirmedAt:
      toIso(
        row.confirmed_at,
      ),
    cancelledAt:
      toIso(
        row.cancelled_at,
      ),
    createdAt:
      row.created_at.toISOString(),
    updatedAt:
      row.updated_at.toISOString(),

    customer: {
      id:
        row.users.id,
      firstName:
        row.users.first_name,
      lastName:
        row.users.last_name,
      fullName:
        fullName(
          row.users.first_name,
          row.users.last_name,
        ),
      email:
        row.users.email,
      phone:
        row.users.phone_e164,
      countryCode:
        row.users.country_code,
    },

    licenseClass:
      mapLicenseClass(
        row.user_license_classes,
      ),

    managedBy:
      mapManager(
        row.managed_by_admin,
      ),
  };
}

function praxisWhere():
  Prisma.user_appointmentsWhereInput {
  return {
    OR: [
      {
        admin_notes: {
          startsWith:
            PRAXIS_MARKER,
        },
      },
      {
        appointment_type: {
          contains:
            "praxis",
          mode:
            "insensitive",
        },
      },
      {
        appointment_type: {
          contains:
            "fahr",
          mode:
            "insensitive",
        },
      },
      {
        appointment_type: {
          contains:
            "driv",
          mode:
            "insensitive",
        },
      },
      {
        appointment_type: {
          contains:
            "lesson",
          mode:
            "insensitive",
        },
      },
      {
        title: {
          contains:
            "fahr",
          mode:
            "insensitive",
        },
      },
      {
        title: {
          contains:
            "praxis",
          mode:
            "insensitive",
        },
      },
      {
        title: {
          contains:
            "prakt",
          mode:
            "insensitive",
        },
      },
    ],
  };
}

export async function listAdminPraxisAppointmentsRepository():
  Promise<AdminPraxisAppointmentView[]> {
  const rows =
    await prisma.user_appointments.findMany({
      where:
        praxisWhere(),

      orderBy: [
        {
          starts_at:
            "desc",
        },
        {
          created_at:
            "desc",
        },
      ],

      take:
        500,

      select:
        appointmentSelect,
    });

  return rows.map(
    mapAppointment,
  );
}

export async function listAdminPraxisClientsRepository():
  Promise<AdminPraxisClientOption[]> {
  const rows =
    await prisma.users.findMany({
      where: {
        user_license_classes: {
          some: {},
        },
      },

      orderBy: [
        {
          first_name:
            "asc",
        },
        {
          last_name:
            "asc",
        },
      ],

      take:
        500,

      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_e164: true,
        country_code: true,

        user_license_classes: {
          orderBy: [
            {
              is_primary:
                "desc",
            },
            {
              started_at:
                "desc",
            },
          ],

          select: {
            id: true,
            license_class_code:
              true,
            status: true,
            is_primary: true,
          },
        },
      },
    });

  return rows.map(
    (
      row,
    ) => ({
      userId:
        row.id,
      firstName:
        row.first_name,
      lastName:
        row.last_name,
      fullName:
        fullName(
          row.first_name,
          row.last_name,
        ),
      email:
        row.email,
      phone:
        row.phone_e164,
      countryCode:
        row.country_code,
      licenseClasses:
        row.user_license_classes.map(
          (
            licenseClass,
          ) => ({
            id:
              licenseClass.id,
            code:
              licenseClass.license_class_code,
            status:
              licenseClass.status,
            isPrimary:
              licenseClass.is_primary,
          }),
        ),
    }),
  );
}

export async function findAdminPraxisAppointmentRepository(
  appointmentId:
    string,
): Promise<AdminPraxisAppointmentDetailView | null> {
  const row =
    await prisma.user_appointments.findFirst({
      where: {
        AND: [
          {
            id:
              appointmentId,
          },
          praxisWhere(),
        ],
      },

      select:
        appointmentSelect,
    });

  if (!row) {
    return null;
  }

  const appointment =
    mapAppointment(
      row,
    );

  const timeline:
    AdminPraxisAppointmentDetailView["timeline"] =
      [
        {
          id:
            `${row.id}-created`,
          type:
            "created",
          title:
            "Fahrstunde angelegt",
          description:
            "Der Praxistermin wurde im System angelegt.",
          occurredAt:
            row.created_at.toISOString(),
        },
      ];

  if (
    row.confirmed_at
  ) {
    timeline.push({
      id:
        `${row.id}-confirmed`,
      type:
        "confirmed",
      title:
        "Termin bestätigt",
      description:
        "Die Fahrstunde wurde administrativ bestätigt.",
      occurredAt:
        row.confirmed_at.toISOString(),
    });
  }

  if (
    row.cancelled_at
  ) {
    timeline.push({
      id:
        `${row.id}-cancelled`,
      type:
        "cancelled",
      title:
        "Termin abgesagt",
      description:
        "Die Fahrstunde wurde administrativ abgesagt.",
      occurredAt:
        row.cancelled_at.toISOString(),
    });
  }

  if (
    row.updated_at.getTime() >
      row.created_at.getTime() +
        1000 &&
    (
      !row.confirmed_at ||
      Math.abs(
        row.updated_at.getTime() -
          row.confirmed_at.getTime(),
      ) >
        1000
    ) &&
    (
      !row.cancelled_at ||
      Math.abs(
        row.updated_at.getTime() -
          row.cancelled_at.getTime(),
      ) >
        1000
    )
  ) {
    timeline.push({
      id:
        `${row.id}-updated`,
      type:
        "updated",
      title:
        "Termin aktualisiert",
      description:
        "Die Termindaten wurden geändert.",
      occurredAt:
        row.updated_at.toISOString(),
    });
  }

  timeline.sort(
    (
      left,
      right,
    ) =>
      new Date(
        left.occurredAt,
      ).getTime() -
      new Date(
        right.occurredAt,
      ).getTime(),
  );

  const cancelled =
    appointment.status ===
    "cancelled";

  return {
    ...appointment,

    timeline,

    capabilities: {
      canEdit:
        !cancelled,
      canConfirm:
        !cancelled &&
        appointment.status !==
          "confirmed",
      canCancel:
        !cancelled,
    },
  };
}

export async function verifyAdminPraxisCustomerRepository(
  userId:
    string,
  userLicenseClassId:
    | string
    | null,
): Promise<{
  exists: boolean;
  licenseClassValid: boolean;
}> {
  const user =
    await prisma.users.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id: true,
      },
    });

  if (!user) {
    return {
      exists:
        false,
      licenseClassValid:
        false,
    };
  }

  if (
    !userLicenseClassId
  ) {
    return {
      exists:
        true,
      licenseClassValid:
        true,
    };
  }

  const licenseClass =
    await prisma.user_license_classes.findFirst({
      where: {
        id:
          userLicenseClassId,
        user_id:
          userId,
      },

      select: {
        id: true,
      },
    });

  return {
    exists:
      true,
    licenseClassValid:
      Boolean(
        licenseClass,
      ),
  };
}

async function notificationDataForAppointment(
  tx:
    Prisma.TransactionClient,
  appointmentId:
    string,
): Promise<{
  userId: string;
  title: string;
  startsAt: Date;
} | null> {
  const row =
    await tx.user_appointments.findUnique({
      where: {
        id:
          appointmentId,
      },

      select: {
        user_id: true,
        title: true,
        starts_at: true,
      },
    });

  return row
    ? {
        userId:
          row.user_id,
        title:
          row.title,
        startsAt:
          row.starts_at,
      }
    : null;
}

function notificationDate(
  value:
    Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
      timeZone:
        "Europe/Berlin",
    },
  ).format(
    value,
  );
}

async function resolvePraxisAppointmentType():
  Promise<string> {
  const constraints =
    await prisma.$queryRaw<
      CheckConstraintRow[]
    >`
      SELECT
        pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'public.user_appointments'::regclass
        AND contype = 'c'
    `;

  const typeDefinitions =
    constraints
      .map(
        (
          row,
        ) =>
          row.definition,
      )
      .filter(
        (
          definition,
        ) =>
          /\bappointment_type\b/i.test(
            definition,
          ),
      );

  /*
   * Without a CHECK constraint, use the semantically correct value suggested
   * by the Prisma model comment ("driving lessons").
   */
  if (
    typeDefinitions.length ===
    0
  ) {
    return "driving_lesson";
  }

  const allowed =
    new Set(
      typeDefinitions.flatMap(
        extractQuotedValues,
      ),
    );

  const preferred = [
    "driving_lesson",
    "driving-lesson",
    "praxis",
    "practice",
    "practical_lesson",
    "lesson",
    "other",
  ];

  for (
    const candidate
    of preferred
  ) {
    if (
      allowed.has(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  /*
   * Prisma defines "other" as the model default. This fallback is deliberately
   * conservative; the stable internal marker still identifies the Praxis row.
   */
  return "other";
}

export async function createAdminPraxisAppointmentRepository(
  input:
    AdminPraxisCreateInput,
  adminId:
    string,
): Promise<AdminPraxisAppointmentDetailView> {
  const appointmentType =
    await resolvePraxisAppointmentType();

  const created =
    await prisma.$transaction(
      async (
        tx,
      ) => {
        const row =
          await tx.user_appointments.create({
            data: {
              user_id:
                input.userId,
              user_license_class_id:
                input.userLicenseClassId,
              /*
               * appointment_type is resolved against the live PostgreSQL
               * CHECK constraint before writing. PRAXIS_MARKER remains the
               * stable module identifier even when only the legacy "other"
               * type is allowed.
               */
              appointment_type:
                appointmentType,
              title:
                input.title,
              location:
                input.location,
              starts_at:
                new Date(
                  input.startsAt,
                ),
              ends_at:
                input.endsAt
                  ? new Date(
                      input.endsAt,
                    )
                  : null,
              status:
                "scheduled",
              notes:
                input.notes,
              admin_notes:
                withPraxisMarker(
                  input.adminNotes,
                ),
              managed_by_admin_id:
                adminId,
            },

            select:
              appointmentSelect,
          });

        await tx.admin_audit_logs.create({
          data: {
            admin_id:
              adminId,
            target_user_id:
              input.userId,
            action:
              "praxis_appointment_created",
            entity_type:
              "user_appointment",
            entity_id:
              row.id,
            metadata: {
              startsAt:
                row.starts_at.toISOString(),
              endsAt:
                row.ends_at?.toISOString() ??
                null,
              licenseClassId:
                row.user_license_class_id,
              status:
                row.status,
            },
          },
        });

        await tx.user_notifications.create({
          data: {
            user_id:
              input.userId,
            type:
              "reminder",
            title:
              "Neue Fahrstunde",
            message:
              `${row.title} wurde für ${notificationDate(
                row.starts_at,
              )} geplant.`,
            href:
              "/praxis",
          },
        });

        return row;
      },
    );

  const detail =
    await findAdminPraxisAppointmentRepository(
      created.id,
    );

  if (!detail) {
    throw new Error(
      "[Express-Führerschein] Created Praxis appointment could not be reloaded.",
    );
  }

  return detail;
}

export async function updateAdminPraxisAppointmentRepository(
  appointmentId:
    string,
  input:
    AdminPraxisUpdateInput,
  adminId:
    string,
): Promise<AdminPraxisAppointmentDetailView | null> {
  const current =
    await prisma.user_appointments.findFirst({
      where: {
        AND: [
          {
            id:
              appointmentId,
          },
          praxisWhere(),
        ],
      },

      select: {
        id: true,
        user_id: true,
        cancelled_at: true,
      },
    });

  if (
    !current ||
    current.cancelled_at
  ) {
    return null;
  }

  await prisma.$transaction(
    async (
      tx,
    ) => {
      await tx.user_appointments.update({
        where: {
          id:
            appointmentId,
        },

        data: {
          user_license_class_id:
            input.userLicenseClassId,
          title:
            input.title,
          location:
            input.location,
          starts_at:
            new Date(
              input.startsAt,
            ),
          ends_at:
            input.endsAt
              ? new Date(
                  input.endsAt,
                )
              : null,
          notes:
            input.notes,
          admin_notes:
            withPraxisMarker(
              input.adminNotes,
            ),
          managed_by_admin_id:
            adminId,
        },
      });

      await tx.admin_audit_logs.create({
        data: {
          admin_id:
            adminId,
          target_user_id:
            current.user_id,
          action:
            "praxis_appointment_updated",
          entity_type:
            "user_appointment",
          entity_id:
            appointmentId,
          metadata: {
            startsAt:
              input.startsAt,
            endsAt:
              input.endsAt,
            licenseClassId:
              input.userLicenseClassId,
          },
        },
      });
    },
  );

  return findAdminPraxisAppointmentRepository(
    appointmentId,
  );
}

export async function confirmAdminPraxisAppointmentRepository(
  appointmentId:
    string,
  adminId:
    string,
): Promise<AdminPraxisAppointmentDetailView | null> {
  const current =
    await prisma.user_appointments.findFirst({
      where: {
        AND: [
          {
            id:
              appointmentId,
          },
          praxisWhere(),
        ],
      },

      select: {
        id: true,
        user_id: true,
        cancelled_at: true,
      },
    });

  if (
    !current ||
    current.cancelled_at
  ) {
    return null;
  }

  const now =
    new Date();

  await prisma.$transaction(
    async (
      tx,
    ) => {
      await tx.user_appointments.update({
        where: {
          id:
            appointmentId,
        },

        data: {
          status:
            "confirmed",
          confirmed_at:
            now,
          cancelled_at:
            null,
          managed_by_admin_id:
            adminId,
        },
      });

      const info =
        await notificationDataForAppointment(
          tx,
          appointmentId,
        );

      await tx.admin_audit_logs.create({
        data: {
          admin_id:
            adminId,
          target_user_id:
            current.user_id,
          action:
            "praxis_appointment_confirmed",
          entity_type:
            "user_appointment",
          entity_id:
            appointmentId,
          metadata: {
            status:
              "confirmed",
          },
        },
      });

      if (info) {
        await tx.user_notifications.create({
          data: {
            user_id:
              info.userId,
            type:
              "reminder",
            title:
              "Fahrstunde bestätigt",
            message:
              `${info.title} am ${notificationDate(
                info.startsAt,
              )} wurde bestätigt.`,
            href:
              "/praxis",
          },
        });
      }
    },
  );

  return findAdminPraxisAppointmentRepository(
    appointmentId,
  );
}

function extractQuotedValues(
  definition:
    string,
): string[] {
  const values:
    string[] = [];

  const regex =
    /'([^']+)'/g;

  let match:
    RegExpExecArray | null;

  while (
    (
      match =
        regex.exec(
          definition,
        )
    ) !== null
  ) {
    if (
      match[1]
    ) {
      values.push(
        match[1],
      );
    }
  }

  return values;
}

/**
 * We do not guess a CHECK-constrained cancellation status.
 * If PostgreSQL has a status CHECK, inspect its allowed literals and choose
 * "cancelled" or legacy "canceled" only when it is actually allowed.
 * If there is no status CHECK, "cancelled" is used.
 */
async function resolveCancellationStatus():
  Promise<
    "cancelled" | "canceled" | null
  > {
  const constraints =
    await prisma.$queryRaw<
      CheckConstraintRow[]
    >`
      SELECT
        pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'public.user_appointments'::regclass
        AND contype = 'c'
    `;

  const statusDefinitions =
    constraints
      .map(
        (
          row,
        ) =>
          row.definition,
      )
      .filter(
        (
          definition,
        ) =>
          /\bstatus\b/i.test(
            definition,
          ),
      );

  if (
    statusDefinitions.length ===
    0
  ) {
    return "cancelled";
  }

  const allowed =
    new Set(
      statusDefinitions.flatMap(
        extractQuotedValues,
      ),
    );

  if (
    allowed.has(
      "cancelled",
    )
  ) {
    return "cancelled";
  }

  if (
    allowed.has(
      "canceled",
    )
  ) {
    return "canceled";
  }

  return null;
}

export async function cancelAdminPraxisAppointmentRepository(
  appointmentId:
    string,
  adminId:
    string,
  reason:
    | string
    | null,
): Promise<
  | AdminPraxisAppointmentDetailView
  | "STATUS_UNSUPPORTED"
  | null
> {
  const current =
    await prisma.user_appointments.findFirst({
      where: {
        AND: [
          {
            id:
              appointmentId,
          },
          praxisWhere(),
        ],
      },

      select: {
        id: true,
        user_id: true,
        cancelled_at: true,
      },
    });

  if (!current) {
    return null;
  }

  if (
    current.cancelled_at
  ) {
    return findAdminPraxisAppointmentRepository(
      appointmentId,
    );
  }

  const cancellationStatus =
    await resolveCancellationStatus();

  if (
    !cancellationStatus
  ) {
    return "STATUS_UNSUPPORTED";
  }

  const now =
    new Date();

  await prisma.$transaction(
    async (
      tx,
    ) => {
      await tx.user_appointments.update({
        where: {
          id:
            appointmentId,
        },

        data: {
          status:
            cancellationStatus,
          cancelled_at:
            now,
          managed_by_admin_id:
            adminId,
        },
      });

      const info =
        await notificationDataForAppointment(
          tx,
          appointmentId,
        );

      await tx.admin_audit_logs.create({
        data: {
          admin_id:
            adminId,
          target_user_id:
            current.user_id,
          action:
            "praxis_appointment_cancelled",
          entity_type:
            "user_appointment",
          entity_id:
            appointmentId,
          metadata: {
            status:
              cancellationStatus,
            reason:
              reason,
          },
        },
      });

      if (info) {
        await tx.user_notifications.create({
          data: {
            user_id:
              info.userId,
            type:
              "warning",
            title:
              "Fahrstunde abgesagt",
            message:
              reason
                ? `${info.title} wurde abgesagt. ${reason}`
                : `${info.title} am ${notificationDate(
                    info.startsAt,
                  )} wurde abgesagt.`,
            href:
              "/praxis",
          },
        });
      }
    },
  );

  return findAdminPraxisAppointmentRepository(
    appointmentId,
  );
}
