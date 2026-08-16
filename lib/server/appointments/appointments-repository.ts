import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export interface AppointmentRepositoryRecord {
  id: string;
  appointmentType: string;
  title: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  status: string;
  notes: string | null;
  licenseClassCode: string | null;
}

export interface AppointmentsRepositorySnapshot {
  userId: string;
  timezone: string;
  activeLicenseClassCode: string | null;
  appointments: AppointmentRepositoryRecord[];
}

export async function getAppointmentsRepositorySnapshot(
  input: {
    userId: string;
  },
): Promise<AppointmentsRepositorySnapshot> {
  const user =
    await prisma.users.findUnique({
      where: {
        id:
          input.userId,
      },
      select: {
        id:
          true,
        user_profile: {
          select: {
            timezone:
              true,
          },
        },
        user_license_classes: {
          where: {
            status:
              "active",
          },
          orderBy: [
            {
              is_primary:
                "desc",
            },
            {
              started_at:
                "asc",
            },
          ],
          take:
            1,
          select: {
            license_class_code:
              true,
          },
        },
        user_appointments: {
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
          select: {
            id:
              true,
            appointment_type:
              true,
            title:
              true,
            location:
              true,
            starts_at:
              true,
            ends_at:
              true,
            status:
              true,
            notes:
              true,
            user_license_classes: {
              select: {
                license_class_code:
                  true,
              },
            },
          },
        },
      },
    });

  if (!user) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  return {
    userId:
      user.id,
    timezone:
      user.user_profile
        ?.timezone
        ?.trim() ||
      "Europe/Berlin",
    activeLicenseClassCode:
      user.user_license_classes[0]
        ?.license_class_code ??
      null,
    appointments:
      user.user_appointments.map(
        (
          appointment,
        ) => ({
          id:
            appointment.id,
          appointmentType:
            appointment.appointment_type,
          title:
            appointment.title,
          location:
            appointment.location,
          startsAt:
            appointment.starts_at,
          endsAt:
            appointment.ends_at,
          status:
            appointment.status,
          notes:
            appointment.notes,
          licenseClassCode:
            appointment
              .user_license_classes
              ?.license_class_code ??
            null,
        }),
      ),
  };
}
