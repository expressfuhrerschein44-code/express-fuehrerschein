import "server-only";

import {
  activateUserLicenseClasses,
  findPrimaryActiveUserLicenseClass,
  getUserCountryCode,
  listActiveUserLicenseClasses,
  setPrimaryUserLicenseClass,
} from "@/lib/server/license-classes/user-license-class-repository";

export const GERMAN_LICENSE_CLASS_CODES = [
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

export type GermanLicenseClassCode =
  (typeof GERMAN_LICENSE_CLASS_CODES)[number];

const GERMAN_LICENSE_CLASS_SET = new Set<string>(
  GERMAN_LICENSE_CLASS_CODES,
);

export function normalizeGermanLicenseClassCode(
  value: string,
): GermanLicenseClassCode {
  const code = value.trim().toUpperCase();

  if (!GERMAN_LICENSE_CLASS_SET.has(code)) {
    throw new Error(
      `[Express-Führerschein] Nicht unterstützte deutsche Führerscheinklasse: ${code || "(leer)"}.`,
    );
  }

  return code as GermanLicenseClassCode;
}

export function normalizeGermanLicenseClassCodes(
  values: readonly string[],
): readonly GermanLicenseClassCode[] {
  return [...new Set(values.map(normalizeGermanLicenseClassCode))];
}

async function assertGermanUser(
  userId: string,
): Promise<void> {
  const countryCode = await getUserCountryCode(userId);

  if (!countryCode) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  if (countryCode.toUpperCase() !== "DE") {
    throw new Error(
      "[Express-Führerschein] Theorie ist in dieser Ausbaustufe ausschließlich für Deutschland freigeschaltet.",
    );
  }
}

export async function getGermanLicenseClassesForUser(
  userId: string,
) {
  await assertGermanUser(userId);

  const classes = await listActiveUserLicenseClasses(userId);

  return classes.map((item) => ({
    ...item,
    licenseClassCode:
      normalizeGermanLicenseClassCode(item.licenseClassCode),
  }));
}

export async function getPrimaryGermanLicenseClassForUser(
  userId: string,
) {
  await assertGermanUser(userId);

  const primary = await findPrimaryActiveUserLicenseClass(userId);

  if (!primary) {
    return null;
  }

  return {
    ...primary,
    licenseClassCode:
      normalizeGermanLicenseClassCode(primary.licenseClassCode),
  };
}

export async function activateGermanLicenseClassesForUser(
  input: {
    userId: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
) {
  await assertGermanUser(input.userId);

  const codes = normalizeGermanLicenseClassCodes(
    input.licenseClassCodes,
  );

  const primary = input.primaryLicenseClassCode
    ? normalizeGermanLicenseClassCode(
        input.primaryLicenseClassCode,
      )
    : null;

  if (primary && !codes.includes(primary)) {
    throw new Error(
      "[Express-Führerschein] Die primäre Führerscheinklasse muss Teil der zu aktivierenden Klassen sein.",
    );
  }

  return activateUserLicenseClasses({
    userId: input.userId,
    licenseClassCodes: codes,
    primaryLicenseClassCode: primary,
  });
}

export async function changePrimaryGermanLicenseClass(
  input: {
    userId: string;
    licenseClassCode: string;
  },
) {
  await assertGermanUser(input.userId);

  const code = normalizeGermanLicenseClassCode(
    input.licenseClassCode,
  );

  return setPrimaryUserLicenseClass({
    userId: input.userId,
    licenseClassCode: code,
  });
}
