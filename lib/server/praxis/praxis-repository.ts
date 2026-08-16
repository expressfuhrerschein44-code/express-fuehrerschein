import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export const PRAXIS_APPOINTMENT_TYPE =
  "driving_lesson";

export interface PraxisUserContextRecord {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  timezone: string;
  userLicenseClassId: string | null;
  licenseClassCode: string | null;
}

export interface PraxisAppointmentRecord {
  id: string;
  user_id: string;
  user_license_class_id: string | null;
  appointment_type: string;
  title: string;
  location: string | null;
  starts_at: Date;
  ends_at: Date | null;
  status: string;
  notes: string | null;
  created_at: Date;
  user_license_classes: {
    license_class_code: string;
  } | null;
}

export interface PraxisAdminAppointmentRecord
  extends PraxisAppointmentRecord {
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_profile: {
      timezone: string;
    } | null;
  };
}

export interface PraxisRepositorySnapshot {
  context: PraxisUserContextRecord;
  appointments: PraxisAppointmentRecord[];
  totalLessons: number;
  completedLessons: number;
  openRequests: number;
  nextAppointment: PraxisAppointmentRecord | null;
}

const appointmentSelect = {
  id: true,
  user_id: true,
  user_license_class_id: true,
  appointment_type: true,
  title: true,
  location: true,
  starts_at: true,
  ends_at: true,
  status: true,
  notes: true,
  created_at: true,
  user_license_classes: {
    select: {
      license_class_code: true,
    },
  },
} as const;

const adminAppointmentSelect = {
  ...appointmentSelect,
  users: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      user_profile: {
        select: {
          timezone: true,
        },
      },
    },
  },
} as const;

export async function getPraxisUserContext(
  userId: string,
): Promise<PraxisUserContextRecord | null> {
  const user =
    await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        country_code: true,
        user_profile: {
          select: {
            timezone: true,
          },
        },
        user_license_classes: {
          where: {
            status: "active",
          },
          orderBy: [
            {
              is_primary: "desc",
            },
            {
              started_at: "asc",
            },
          ],
          take: 1,
          select: {
            id: true,
            license_class_code: true,
          },
        },
      },
    });

  if (!user) {
    return null;
  }

  const activeClass =
    user.user_license_classes[0] ??
    null;

  return {
    userId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    countryCode:
      user.country_code,
    timezone:
      user.user_profile?.timezone?.trim() ||
      "Europe/Berlin",
    userLicenseClassId:
      activeClass?.id ??
      null,
    licenseClassCode:
      activeClass?.license_class_code ??
      null,
  };
}

export async function getPraxisRepositorySnapshot(
  userId: string,
): Promise<PraxisRepositorySnapshot> {
  const context =
    await getPraxisUserContext(
      userId,
    );

  if (!context) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  if (
    !context.userLicenseClassId
  ) {
    return {
      context,
      appointments: [],
      totalLessons: 0,
      completedLessons: 0,
      openRequests: 0,
      nextAppointment: null,
    };
  }

  const baseWhere = {
    user_id:
      context.userId,
    user_license_class_id:
      context.userLicenseClassId,
    appointment_type:
      PRAXIS_APPOINTMENT_TYPE,
  } as const;

  const now =
    new Date();

  const [
    appointments,
    totalLessons,
    completedLessons,
    openRequests,
    nextAppointment,
  ] =
    await Promise.all([
      prisma.user_appointments.findMany({
        where:
          baseWhere,
        select:
          appointmentSelect,
        orderBy: {
          starts_at:
            "desc",
        },
        take: 50,
      }),

      prisma.user_appointments.count({
        where: {
          ...baseWhere,
          status: {
            not:
              "cancelled",
          },
        },
      }),

      prisma.user_appointments.count({
        where: {
          ...baseWhere,
          status:
            "completed",
        },
      }),

      prisma.user_appointments.count({
        where: {
          ...baseWhere,
          status:
            "requested",
        },
      }),

      prisma.user_appointments.findFirst({
        where: {
          ...baseWhere,
          starts_at: {
            gte:
              now,
          },
          status: {
            in: [
              "requested",
              "scheduled",
              "confirmed",
            ],
          },
        },
        select:
          appointmentSelect,
        orderBy: {
          starts_at:
            "asc",
        },
      }),
    ]);

  return {
    context,
    appointments,
    totalLessons,
    completedLessons,
    openRequests,
    nextAppointment,
  };
}

export async function findConflictingPraxisAppointment(
  input: {
    userId: string;
    userLicenseClassId: string;
    startsAt: Date;
  },
): Promise<{
  id: string;
} | null> {
  return prisma.user_appointments.findFirst({
    where: {
      user_id:
        input.userId,
      user_license_class_id:
        input.userLicenseClassId,
      appointment_type:
        PRAXIS_APPOINTMENT_TYPE,
      starts_at:
        input.startsAt,
      status: {
        not:
          "cancelled",
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createPraxisAppointment(
  input: {
    userId: string;
    userLicenseClassId: string;
    licenseClassCode: string;
    startsAt: Date;
    location: string | null;
    notes: string | null;
  },
): Promise<PraxisAppointmentRecord> {
  return prisma.user_appointments.create({
    data: {
      user_id:
        input.userId,
      user_license_class_id:
        input.userLicenseClassId,
      appointment_type:
        PRAXIS_APPOINTMENT_TYPE,
      title:
        `Fahrstunde Klasse ${input.licenseClassCode}`,
      location:
        input.location,
      starts_at:
        input.startsAt,
      ends_at:
        null,
      status:
        "requested",
      notes:
        input.notes,
    },
    select:
      appointmentSelect,
  });
}

export async function createPraxisUserNotification(
  input: {
    userId: string;
    type?: string;
    title: string;
    message: string;
  },
): Promise<void> {
  await prisma.user_notifications.create({
    data: {
      user_id:
        input.userId,
      type:
        input.type ??
        "appointment",
      title:
        input.title,
      message:
        input.message,
      href:
        "/praxis",
    },
  });
}

export async function listPraxisAdminAppointments(
  take = 100,
): Promise<PraxisAdminAppointmentRecord[]> {
  return prisma.user_appointments.findMany({
    where: {
      appointment_type:
        PRAXIS_APPOINTMENT_TYPE,
    },
    select:
      adminAppointmentSelect,
    orderBy: [
      {
        created_at:
          "desc",
      },
      {
        starts_at:
          "asc",
      },
    ],
    take:
      Math.max(
        1,
        Math.min(
          200,
          Math.round(
            take,
          ),
        ),
      ),
  });
}



export async function getPraxisAdminStatusCounts():
  Promise<Record<string, number>> {
  const rows =
    await prisma.user_appointments.groupBy({
      by: [
        "status",
      ],
      where: {
        appointment_type:
          PRAXIS_APPOINTMENT_TYPE,
      },
      _count: {
        _all: true,
      },
    });

  const counts:
    Record<string, number> =
    {};

  for (
    const row of rows
  ) {
    counts[
      row.status
    ] =
      row._count._all;
  }

  return counts;
}

export async function updatePraxisAppointmentStatus(
  input: {
    appointmentId: string;
    nextStatus:
      "confirmed" |
      "cancelled";
    allowedCurrentStatuses:
      readonly string[];
  },
): Promise<PraxisAdminAppointmentRecord | null> {
  const result =
    await prisma.user_appointments.updateMany({
      where: {
        id:
          input.appointmentId,
        appointment_type:
          PRAXIS_APPOINTMENT_TYPE,
        status: {
          in: [
            ...input.allowedCurrentStatuses,
          ],
        },
      },
      data: {
        status:
          input.nextStatus,
      },
    });

  if (
    result.count !==
    1
  ) {
    return null;
  }

  return prisma.user_appointments.findUnique({
    where: {
      id:
        input.appointmentId,
    },
    select:
      adminAppointmentSelect,
  });
}
