import "server-only";

import {
  getSettingsRepositoryRecord,
  saveSettingsPreferences,
} from "@/lib/server/settings/settings-repository";

import type {
  SettingsLocale,
  SettingsPageData,
  UpdateSettingsInput,
  UpdateSettingsResult,
} from "@/types/settings";

const SUPPORTED_LOCALES =
  new Set<SettingsLocale>([
    "de",
    "fr",
    "nl",
    "es",
    "it",
    "en",
  ]);

export class SettingsServiceError
  extends Error {
  readonly code:
    string;

  readonly status:
    number;

  constructor(
    code:
      string,
    message:
      string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "SettingsServiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

function normalizeLocale(
  value:
    string,
): SettingsLocale {
  const normalized =
    value
      .trim()
      .toLowerCase() as
      SettingsLocale;

  return SUPPORTED_LOCALES.has(
    normalized,
  )
    ? normalized
    : "de";
}

function assertSupportedLocale(
  value:
    string,
): SettingsLocale {
  const normalized =
    value
      .trim()
      .toLowerCase() as
      SettingsLocale;

  if (
    !SUPPORTED_LOCALES.has(
      normalized,
    )
  ) {
    throw new SettingsServiceError(
      "SETTINGS_LOCALE_NOT_SUPPORTED",
      "Die ausgewählte Sprache wird nicht unterstützt.",
      400,
    );
  }

  return normalized;
}

function assertValidTimezone(
  value:
    string,
): string {
  const normalized =
    value
      .trim();

  if (
    !normalized ||
    normalized.length >
      64
  ) {
    throw new SettingsServiceError(
      "SETTINGS_TIMEZONE_INVALID",
      "Die ausgewählte Zeitzone ist ungültig.",
      400,
    );
  }

  try {
    new Intl.DateTimeFormat(
      "de-DE",
      {
        timeZone:
          normalized,
      },
    ).format(
      new Date(),
    );
  } catch {
    throw new SettingsServiceError(
      "SETTINGS_TIMEZONE_INVALID",
      "Die ausgewählte Zeitzone ist ungültig.",
      400,
    );
  }

  return normalized;
}

export async function getSettingsPageData(
  userId:
    string,
): Promise<SettingsPageData> {
  const record =
    await getSettingsRepositoryRecord(
      userId,
    );

  return {
    account:
      record.account,
    preferences: {
      preferredLocale:
        normalizeLocale(
          record.preferences
            .preferredLocale,
        ),
      timezone:
        record.preferences
          .timezone ||
        "Europe/Berlin",
    },
  };
}

export async function updateSettings(
  input: {
    userId: string;
    data: UpdateSettingsInput;
  },
): Promise<UpdateSettingsResult> {
  const preferredLocale =
    assertSupportedLocale(
      input.data
        .preferredLocale,
    );

  const timezone =
    assertValidTimezone(
      input.data
        .timezone,
    );

  const preferences =
    await saveSettingsPreferences({
      userId:
        input.userId,
      preferredLocale,
      timezone,
    });

  return {
    preferences: {
      preferredLocale:
        normalizeLocale(
          preferences.preferredLocale,
        ),
      timezone:
        preferences.timezone,
    },
  };
}
