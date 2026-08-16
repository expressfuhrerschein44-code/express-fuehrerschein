import "server-only";

import {
  createPraxisAppointment,
  createPraxisUserNotification,
  findConflictingPraxisAppointment,
  getPraxisAdminStatusCounts,
  getPraxisRepositorySnapshot,
  getPraxisUserContext,
  listPraxisAdminAppointments,
  updatePraxisAppointmentStatus,
} from "@/lib/server/praxis/praxis-repository";

import type {
  PraxisAdminAppointmentRecord,
  PraxisAppointmentRecord,
  PraxisUserContextRecord,
} from "@/lib/server/praxis/praxis-repository";

import {
  sendPraxisAdminNewRequestEmail,
  sendPraxisRequestCancelledEmail,
  sendPraxisRequestConfirmedEmail,
  sendPraxisRequestReceivedEmail,
} from "@/lib/server/praxis/praxis-email-service";

import type {
  CreatePraxisLessonRequestInput,
  PraxisAdminAction,
  PraxisAdminPageData,
  PraxisAdminRequestView,
  PraxisAppointmentStatus,
  PraxisAppointmentView,
  PraxisPageData,
} from "@/types/praxis";

export type PraxisServiceErrorCode =
  | "USER_NOT_FOUND"
  | "NO_ACTIVE_LICENSE_CLASS"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "DATE_IN_PAST"
  | "INVALID_LOCATION"
  | "INVALID_NOTE"
  | "DUPLICATE_REQUEST"
  | "INVALID_APPOINTMENT_ID"
  | "INVALID_ADMIN_ACTION"
  | "APPOINTMENT_STATUS_CONFLICT";

export class PraxisServiceError
  extends Error {
  readonly code:
    PraxisServiceErrorCode;

  readonly status:
    number;

  constructor(
    code:
      PraxisServiceErrorCode,
    message:
      string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "PraxisServiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

function normalizeAppointmentStatus(
  value: string,
): PraxisAppointmentStatus {
  switch (
    value
  ) {
    case "requested":
    case "scheduled":
    case "confirmed":
    case "completed":
    case "cancelled":
      return value;

    default:
      return "scheduled";
  }
}

function toAppointmentView(
  record:
    PraxisAppointmentRecord,
  fallbackLicenseClassCode:
    string,
): PraxisAppointmentView {
  return {
    id:
      record.id,
    licenseClassCode:
      record
        .user_license_classes
        ?.license_class_code ??
      fallbackLicenseClassCode,
    title:
      record.title,
    location:
      record.location,
    startsAt:
      record.starts_at.toISOString(),
    endsAt:
      record.ends_at?.toISOString() ??
      null,
    status:
      normalizeAppointmentStatus(
        record.status,
      ),
    notes:
      record.notes,
    createdAt:
      record.created_at.toISOString(),
  };
}

function isValidTimeZone(
  value: string,
): boolean {
  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          value,
      },
    ).format(
      new Date(),
    );

    return true;
  } catch {
    return false;
  }
}

function safeTimeZone(
  value: string,
): string {
  const normalized =
    value.trim();

  return isValidTimeZone(
    normalized,
  )
    ? normalized
    : "Europe/Berlin";
}

function timeZoneOffsetMs(
  instant: Date,
  timeZone: string,
): number {
  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
        hour:
          "2-digit",
        minute:
          "2-digit",
        second:
          "2-digit",
        hourCycle:
          "h23",
      },
    );

  const values =
    formatter
      .formatToParts(
        instant,
      )
      .reduce<Record<string, string>>(
        (
          acc,
          part,
        ) => {
          if (
            part.type !==
            "literal"
          ) {
            acc[
              part.type
            ] =
              part.value;
          }

          return acc;
        },
        {},
      );

  const year =
    Number(
      values.year ??
        "0",
    );

  const month =
    Number(
      values.month ??
        "1",
    );

  const day =
    Number(
      values.day ??
        "1",
    );

  const hour =
    Number(
      values.hour ??
        "0",
    );

  const minute =
    Number(
      values.minute ??
        "0",
    );

  const second =
    Number(
      values.second ??
        "0",
    );

  const asUtc =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
    );

  return (
    asUtc -
    instant.getTime()
  );
}

function localDateTimeToUtc(
  dateValue: string,
  timeValue: string,
  timeZone: string,
): Date | null {
  const dateMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateValue,
    );

  const timeMatch =
    /^(\d{2}):(\d{2})$/.exec(
      timeValue,
    );

  if (
    !dateMatch ||
    !timeMatch
  ) {
    return null;
  }

  const year =
    Number(
      dateMatch[1],
    );

  const month =
    Number(
      dateMatch[2],
    );

  const day =
    Number(
      dateMatch[3],
    );

  const hour =
    Number(
      timeMatch[1],
    );

  const minute =
    Number(
      timeMatch[2],
    );

  if (
    !Number.isInteger(
      year,
    ) ||
    !Number.isInteger(
      month,
    ) ||
    !Number.isInteger(
      day,
    ) ||
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    ) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const calendarCheck =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
      ),
    );

  if (
    calendarCheck.getUTCFullYear() !==
      year ||
    calendarCheck.getUTCMonth() !==
      month - 1 ||
    calendarCheck.getUTCDate() !==
      day
  ) {
    return null;
  }

  const zone =
    safeTimeZone(
      timeZone,
    );

  const localAsUtcMs =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
    );

  const firstGuess =
    new Date(
      localAsUtcMs,
    );

  const firstOffset =
    timeZoneOffsetMs(
      firstGuess,
      zone,
    );

  let result =
    new Date(
      localAsUtcMs -
        firstOffset,
    );

  const secondOffset =
    timeZoneOffsetMs(
      result,
      zone,
    );

  if (
    secondOffset !==
    firstOffset
  ) {
    result =
      new Date(
        localAsUtcMs -
          secondOffset,
      );
  }

  const verify =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          zone,
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
        hour:
          "2-digit",
        minute:
          "2-digit",
        hourCycle:
          "h23",
      },
    )
      .formatToParts(
        result,
      )
      .reduce<Record<string, string>>(
        (
          acc,
          part,
        ) => {
          if (
            part.type !==
            "literal"
          ) {
            acc[
              part.type
            ] =
              part.value;
          }

          return acc;
        },
        {},
      );

  if (
    Number(
      verify.year ??
        "0",
    ) !==
      year ||
    Number(
      verify.month ??
        "0",
    ) !==
      month ||
    Number(
      verify.day ??
        "0",
    ) !==
      day ||
    Number(
      verify.hour ??
        "-1",
    ) !==
      hour ||
    Number(
      verify.minute ??
        "-1",
    ) !==
      minute
  ) {
    return null;
  }

  return result;
}

function cleanOptionalText(
  value: unknown,
  maxLength: number,
  errorCode:
    | "INVALID_LOCATION"
    | "INVALID_NOTE",
  message: string,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length >
    maxLength
  ) {
    throw new PraxisServiceError(
      errorCode,
      message,
    );
  }

  return normalized ||
    null;
}

function sortAppointments(
  appointments:
    PraxisAppointmentView[],
): PraxisAppointmentView[] {
  const now =
    Date.now();

  return [
    ...appointments,
  ].sort(
    (
      left,
      right,
    ) => {
      const leftTime =
        new Date(
          left.startsAt,
        ).getTime();

      const rightTime =
        new Date(
          right.startsAt,
        ).getTime();

      const leftUpcoming =
        leftTime >= now &&
        left.status !==
          "completed" &&
        left.status !==
          "cancelled";

      const rightUpcoming =
        rightTime >= now &&
        right.status !==
          "completed" &&
        right.status !==
          "cancelled";

      if (
        leftUpcoming &&
        !rightUpcoming
      ) {
        return -1;
      }

      if (
        rightUpcoming &&
        !leftUpcoming
      ) {
        return 1;
      }

      return leftUpcoming
        ? leftTime -
            rightTime
        : rightTime -
            leftTime;
    },
  );
}

export async function getPraxisPageData(
  userId: string,
): Promise<PraxisPageData> {
  const snapshot =
    await getPraxisRepositorySnapshot(
      userId,
    );

  const timezone =
    safeTimeZone(
      snapshot.context
        .timezone,
    );

  if (
    !snapshot.context
      .userLicenseClassId ||
    !snapshot.context
      .licenseClassCode
  ) {
    return {
      licenseClassCode:
        null,
      timezone,
      canRequestLesson:
        false,
      overview: {
        totalLessons:
          0,
        completedLessons:
          0,
        openRequests:
          0,
        nextAppointment:
          null,
      },
      appointments:
        [],
    };
  }

  const licenseClassCode =
    snapshot.context
      .licenseClassCode;

  const appointments =
    sortAppointments(
      snapshot.appointments.map(
        (
          appointment,
        ) =>
          toAppointmentView(
            appointment,
            licenseClassCode,
          ),
      ),
    );

  return {
    licenseClassCode,
    timezone,
    canRequestLesson:
      true,
    overview: {
      totalLessons:
        snapshot.totalLessons,
      completedLessons:
        snapshot.completedLessons,
      openRequests:
        snapshot.openRequests,
      nextAppointment:
        snapshot.nextAppointment
          ? toAppointmentView(
              snapshot.nextAppointment,
              licenseClassCode,
            )
          : null,
    },
    appointments,
  };
}

export async function createPraxisLessonRequest(
  userId: string,
  input:
    CreatePraxisLessonRequestInput,
): Promise<PraxisPageData> {
  const context =
    await getPraxisUserContext(
      userId,
    );

  if (!context) {
    throw new PraxisServiceError(
      "USER_NOT_FOUND",
      "Benutzer wurde nicht gefunden.",
      404,
    );
  }

  if (
    !context.userLicenseClassId ||
    !context.licenseClassCode
  ) {
    throw new PraxisServiceError(
      "NO_ACTIVE_LICENSE_CLASS",
      "Für die Praxis ist noch keine aktive Führerscheinklasse verfügbar.",
      409,
    );
  }

  const date =
    typeof input.date ===
      "string"
      ? input.date.trim()
      : "";

  const time =
    typeof input.time ===
      "string"
      ? input.time.trim()
      : "";

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date,
    )
  ) {
    throw new PraxisServiceError(
      "INVALID_DATE",
      "Bitte wähle ein gültiges Datum.",
    );
  }

  if (
    !/^\d{2}:\d{2}$/.test(
      time,
    )
  ) {
    throw new PraxisServiceError(
      "INVALID_TIME",
      "Bitte wähle eine gültige Uhrzeit.",
    );
  }

  const startsAt =
    localDateTimeToUtc(
      date,
      time,
      context.timezone,
    );

  if (!startsAt) {
    throw new PraxisServiceError(
      "INVALID_DATE",
      "Datum oder Uhrzeit ist für die gewählte Zeitzone ungültig.",
    );
  }

  if (
    startsAt.getTime() <=
    Date.now()
  ) {
    throw new PraxisServiceError(
      "DATE_IN_PAST",
      "Die gewünschte Fahrstunde muss in der Zukunft liegen.",
    );
  }

  const location =
    cleanOptionalText(
      input.location,
      255,
      "INVALID_LOCATION",
      "Der Treffpunkt darf höchstens 255 Zeichen enthalten.",
    );

  const notes =
    cleanOptionalText(
      input.note,
      1500,
      "INVALID_NOTE",
      "Der Hinweis darf höchstens 1500 Zeichen enthalten.",
    );

  const conflict =
    await findConflictingPraxisAppointment({
      userId:
        context.userId,
      userLicenseClassId:
        context.userLicenseClassId,
      startsAt,
    });

  if (conflict) {
    throw new PraxisServiceError(
      "DUPLICATE_REQUEST",
      "Für diesen Zeitpunkt besteht bereits eine Fahrstunden-Anfrage.",
      409,
    );
  }

  const appointment =
    await createPraxisAppointment({
      userId:
        context.userId,
      userLicenseClassId:
        context.userLicenseClassId,
      licenseClassCode:
        context.licenseClassCode,
      startsAt,
      location,
      notes,
    });

  await runSecondaryEffects([
    () =>
      createPraxisUserNotification({
        userId:
          context.userId,
        title:
          "Fahrstunden-Anfrage erhalten",
        message:
          "Deine Fahrstunden-Anfrage wurde erfolgreich übermittelt und wird nun geprüft.",
      }),

    () =>
      sendPraxisRequestReceivedEmail(
        emailPayloadFromContext(
          context,
          appointment,
        ),
      ),

    () =>
      sendPraxisAdminNewRequestEmail(
        emailPayloadFromContext(
          context,
          appointment,
        ),
      ),
  ]);

  return getPraxisPageData(
    userId,
  );
}


function emailPayloadFromContext(
  context:
    PraxisUserContextRecord,
  appointment:
    PraxisAppointmentRecord,
) {
  return {
    appointmentId:
      appointment.id,
    firstName:
      context.firstName,
    lastName:
      context.lastName,
    email:
      context.email,
    licenseClassCode:
      appointment
        .user_license_classes
        ?.license_class_code ??
      context.licenseClassCode ??
      "—",
    startsAt:
      appointment.starts_at,
    timezone:
      safeTimeZone(
        context.timezone,
      ),
    location:
      appointment.location,
  };
}

function emailPayloadFromAdminRecord(
  record:
    PraxisAdminAppointmentRecord,
) {
  return {
    appointmentId:
      record.id,
    firstName:
      record.users.first_name,
    lastName:
      record.users.last_name,
    email:
      record.users.email,
    licenseClassCode:
      record
        .user_license_classes
        ?.license_class_code ??
      "—",
    startsAt:
      record.starts_at,
    timezone:
      safeTimeZone(
        record.users
          .user_profile
          ?.timezone ??
        "Europe/Berlin",
      ),
    location:
      record.location,
  };
}

async function runSecondaryEffects(
  effects:
    readonly (() => Promise<unknown>)[],
): Promise<void> {
  const results =
    await Promise.allSettled(
      effects.map(
        (
          effect,
        ) =>
          effect(),
      ),
    );

  for (
    const result of results
  ) {
    if (
      result.status ===
      "rejected"
    ) {
      console.error(
        "[PRAXIS_SECONDARY_EFFECT_ERROR]",
        result.reason,
      );
    }
  }
}

function toAdminRequestView(
  record:
    PraxisAdminAppointmentRecord,
): PraxisAdminRequestView {
  return {
    ...toAppointmentView(
      record,
      record
        .user_license_classes
        ?.license_class_code ??
        "—",
    ),
    timezone:
      safeTimeZone(
        record.users
          .user_profile
          ?.timezone ??
          "Europe/Berlin",
      ),
    user: {
      id:
        record.users.id,
      firstName:
        record.users.first_name,
      lastName:
        record.users.last_name,
      email:
        record.users.email,
    },
  };
}

export async function getPraxisAdminPageData():
  Promise<PraxisAdminPageData> {
  const [
    rows,
    counts,
  ] =
    await Promise.all([
      listPraxisAdminAppointments(
        150,
      ),
      getPraxisAdminStatusCounts(),
    ]);

  const requests =
    rows.map(
      toAdminRequestView,
    );

  const total =
    Object.values(
      counts,
    ).reduce(
      (
        sum,
        value,
      ) =>
        sum + value,
      0,
    );

  return {
    overview: {
      requested:
        counts.requested ??
        0,
      confirmed:
        counts.confirmed ??
        0,
      cancelled:
        counts.cancelled ??
        0,
      completed:
        counts.completed ??
        0,
      total,
    },
    requests,
  };
}

export async function updatePraxisAdminRequest(
  input: {
    appointmentId: string;
    action:
      PraxisAdminAction;
  },
): Promise<PraxisAdminPageData> {
  const appointmentId =
    input.appointmentId.trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      appointmentId,
    )
  ) {
    throw new PraxisServiceError(
      "INVALID_APPOINTMENT_ID",
      "Ungültige Fahrstunden-Anfrage.",
    );
  }

  if (
    input.action !==
      "confirm" &&
    input.action !==
      "cancel"
  ) {
    throw new PraxisServiceError(
      "INVALID_ADMIN_ACTION",
      "Ungültige Admin-Aktion.",
    );
  }

  const confirm =
    input.action ===
    "confirm";

  const record =
    await updatePraxisAppointmentStatus({
      appointmentId,
      nextStatus:
        confirm
          ? "confirmed"
          : "cancelled",
      allowedCurrentStatuses:
        confirm
          ? [
              "requested",
              "scheduled",
            ]
          : [
              "requested",
              "scheduled",
              "confirmed",
            ],
    });

  if (!record) {
    throw new PraxisServiceError(
      "APPOINTMENT_STATUS_CONFLICT",
      "Die Fahrstunden-Anfrage wurde bereits bearbeitet oder kann in diesem Status nicht geändert werden.",
      409,
    );
  }

  if (confirm) {
    await runSecondaryEffects([
      () =>
        createPraxisUserNotification({
          userId:
            record.user_id,
          title:
            "Fahrstunde bestätigt",
          message:
            "Dein gewünschter Fahrstundentermin wurde bestätigt.",
        }),
      () =>
        sendPraxisRequestConfirmedEmail(
          emailPayloadFromAdminRecord(
            record,
          ),
        ),
    ]);
  } else {
    await runSecondaryEffects([
      () =>
        createPraxisUserNotification({
          userId:
            record.user_id,
          title:
            "Fahrstunden-Anfrage storniert",
          message:
            "Deine Fahrstunden-Anfrage wurde storniert. Du kannst einen neuen Terminwunsch senden.",
        }),
      () =>
        sendPraxisRequestCancelledEmail(
          emailPayloadFromAdminRecord(
            record,
          ),
        ),
    ]);
  }

  return getPraxisAdminPageData();
}
