import "server-only";

import {
  getAppointmentsRepositorySnapshot,
} from "@/lib/server/appointments/appointments-repository";

import type {
  AppointmentStatusView,
  AppointmentTypeView,
  AppointmentView,
  AppointmentsPageData,
} from "@/types/appointments";

function normalizeAppointmentType(
  value:
    string,
): AppointmentTypeView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "driving_lesson":
    case "driving-lesson":
    case "fahrstunde":
      return "driving_lesson";

    case "theory_exam":
    case "theory-exam":
      return "theory_exam";

    case "practical_exam":
    case "practical-exam":
      return "practical_exam";

    case "school":
    case "driving_school":
    case "driving-school":
      return "school";

    default:
      return "other";
  }
}

function normalizeStatus(
  value:
    string,
): AppointmentStatusView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "requested":
      return "requested";

    case "scheduled":
      return "scheduled";

    case "confirmed":
      return "confirmed";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    default:
      return "other";
  }
}

function toView(
  input: {
    id: string;
    appointmentType: string;
    title: string;
    location: string | null;
    startsAt: Date;
    endsAt: Date | null;
    status: string;
    notes: string | null;
    licenseClassCode: string | null;
  },
): AppointmentView {
  return {
    id:
      input.id,
    appointmentType:
      normalizeAppointmentType(
        input.appointmentType,
      ),
    rawAppointmentType:
      input.appointmentType,
    title:
      input.title,
    location:
      input.location,
    startsAt:
      input.startsAt.toISOString(),
    endsAt:
      input.endsAt?.toISOString() ??
      null,
    status:
      normalizeStatus(
        input.status,
      ),
    rawStatus:
      input.status,
    notes:
      input.notes,
    licenseClassCode:
      input.licenseClassCode,
  };
}

function dateValue(
  value:
    string,
): number {
  const time =
    new Date(
      value,
    ).getTime();

  return Number.isFinite(
    time,
  )
    ? time
    : 0;
}

export async function getAppointmentsPageData(
  input: {
    userId: string;
    locale: string;
  },
): Promise<AppointmentsPageData> {
  const snapshot =
    await getAppointmentsRepositorySnapshot({
      userId:
        input.userId,
    });

  const now =
    Date.now();

  const appointments =
    snapshot.appointments.map(
      toView,
    );

  const upcoming =
    appointments
      .filter(
        (
          appointment,
        ) =>
          appointment.status !==
            "cancelled" &&
          appointment.status !==
            "completed" &&
          dateValue(
            appointment.startsAt,
          ) >=
            now,
      )
      .sort(
        (
          left,
          right,
        ) =>
          dateValue(
            left.startsAt,
          ) -
          dateValue(
            right.startsAt,
          ),
      );

  const history =
    appointments
      .filter(
        (
          appointment,
        ) =>
          appointment.status ===
            "cancelled" ||
          appointment.status ===
            "completed" ||
          dateValue(
            appointment.startsAt,
          ) <
            now,
      )
      .sort(
        (
          left,
          right,
        ) =>
          dateValue(
            right.startsAt,
          ) -
          dateValue(
            left.startsAt,
          ),
      );

  const confirmedCount =
    upcoming.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        "confirmed",
    ).length;

  const completedCount =
    appointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        "completed",
    ).length;

  return {
    status:
      snapshot
        .activeLicenseClassCode
        ? "ready"
        : "no_active_license_class",
    licenseClassCode:
      snapshot
        .activeLicenseClassCode,
    timezone:
      snapshot.timezone,
    locale:
      input.locale,
    overview: {
      nextAppointment:
        upcoming[0] ??
        null,
      upcomingCount:
        upcoming.length,
      confirmedCount,
      completedCount,
    },
    upcoming,
    history,
  };
}
