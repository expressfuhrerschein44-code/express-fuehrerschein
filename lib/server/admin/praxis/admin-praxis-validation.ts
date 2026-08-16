import "server-only";

import type {
  AdminPraxisCreateInput,
  AdminPraxisMutationInput,
  AdminPraxisUpdateInput,
} from "@/types/admin-praxis";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AdminPraxisValidationSuccess<T> {
  success: true;
  data: T;
}

export interface AdminPraxisValidationFailure {
  success: false;
  errors: Record<string, string>;
}

export type AdminPraxisValidationResult<T> =
  | AdminPraxisValidationSuccess<T>
  | AdminPraxisValidationFailure;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function text(
  value: unknown,
  maxLength: number,
): string {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function nullableText(
  value: unknown,
  maxLength: number,
): string | null {
  const normalized = text(
    value,
    maxLength,
  );
  return normalized || null;
}

function nullableUuid(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value.trim())
  ) {
    return null;
  }

  return value.trim();
}

function parseIsoDate(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const date = new Date(
    value.trim(),
  );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.toISOString();
}

function validateSharedFields(
  raw: Record<string, unknown>,
): {
  data: AdminPraxisUpdateInput;
  errors: Record<string, string>;
} {
  const errors:
    Record<string, string> = {};

  const title = text(
    raw.title,
    160,
  );

  if (
    title.length < 2
  ) {
    errors.title =
      "Bitte gib einen Titel für die Fahrstunde ein.";
  }

  const startsAt =
    parseIsoDate(
      raw.startsAt,
    );

  if (!startsAt) {
    errors.startsAt =
      "Bitte wähle ein gültiges Startdatum.";
  }

  const rawEndsAt =
    raw.endsAt;

  const endsAt =
    rawEndsAt === null ||
    rawEndsAt === undefined ||
    rawEndsAt === ""
      ? null
      : parseIsoDate(
          rawEndsAt,
        );

  if (
    rawEndsAt !== null &&
    rawEndsAt !== undefined &&
    rawEndsAt !== "" &&
    !endsAt
  ) {
    errors.endsAt =
      "Bitte wähle ein gültiges Enddatum.";
  }

  if (
    startsAt &&
    endsAt &&
    new Date(endsAt).getTime() <=
      new Date(startsAt).getTime()
  ) {
    errors.endsAt =
      "Das Ende muss nach dem Beginn liegen.";
  }

  const rawLicenseClassId =
    raw.userLicenseClassId;

  const userLicenseClassId =
    nullableUuid(
      rawLicenseClassId,
    );

  if (
    rawLicenseClassId !== null &&
    rawLicenseClassId !== undefined &&
    rawLicenseClassId !== "" &&
    !userLicenseClassId
  ) {
    errors.userLicenseClassId =
      "Die Führerscheinklasse ist ungültig.";
  }

  return {
    data: {
      title,
      location:
        nullableText(
          raw.location,
          255,
        ),
      userLicenseClassId,
      startsAt:
        startsAt ?? "",
      endsAt,
      notes:
        nullableText(
          raw.notes,
          5000,
        ),
      adminNotes:
        nullableText(
          raw.adminNotes,
          5000,
        ),
    },
    errors,
  };
}

export function validateAdminPraxisCreateInput(
  rawInput: unknown,
): AdminPraxisValidationResult<AdminPraxisCreateInput> {
  if (
    !isRecord(
      rawInput,
    )
  ) {
    return {
      success: false,
      errors: {
        form:
          "Die übermittelten Daten sind ungültig.",
      },
    };
  }

  const userId =
    typeof rawInput.userId ===
      "string"
      ? rawInput.userId.trim()
      : "";

  const shared =
    validateSharedFields(
      rawInput,
    );

  if (
    !UUID_PATTERN.test(
      userId,
    )
  ) {
    shared.errors.userId =
      "Bitte wähle einen gültigen Kunden.";
  }

  if (
    Object.keys(
      shared.errors,
    ).length > 0
  ) {
    return {
      success: false,
      errors:
        shared.errors,
    };
  }

  return {
    success: true,
    data: {
      userId,
      ...shared.data,
    },
  };
}

export function validateAdminPraxisMutationInput(
  rawInput: unknown,
): AdminPraxisValidationResult<AdminPraxisMutationInput> {
  if (
    !isRecord(
      rawInput,
    )
  ) {
    return {
      success: false,
      errors: {
        form:
          "Die übermittelten Daten sind ungültig.",
      },
    };
  }

  const action =
    text(
      rawInput.action,
      20,
    );

  if (
    action ===
    "confirm"
  ) {
    return {
      success: true,
      data: {
        action:
          "confirm",
      },
    };
  }

  if (
    action ===
    "cancel"
  ) {
    return {
      success: true,
      data: {
        action:
          "cancel",
        reason:
          nullableText(
            rawInput.reason,
            1000,
          ),
      },
    };
  }

  if (
    action ===
    "update"
  ) {
    if (
      !isRecord(
        rawInput.data,
      )
    ) {
      return {
        success: false,
        errors: {
          data:
            "Die Termindaten fehlen.",
        },
      };
    }

    const shared =
      validateSharedFields(
        rawInput.data,
      );

    if (
      Object.keys(
        shared.errors,
      ).length > 0
    ) {
      return {
        success: false,
        errors:
          shared.errors,
      };
    }

    return {
      success: true,
      data: {
        action:
          "update",
        data:
          shared.data,
      },
    };
  }

  return {
    success: false,
    errors: {
      action:
        "Die gewünschte Aktion ist ungültig.",
    },
  };
}

export function isAdminPraxisUuid(
  value: string,
): boolean {
  return UUID_PATTERN.test(
    value.trim(),
  );
}
