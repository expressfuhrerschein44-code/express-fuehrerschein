/**
 * Express-Führerschein
 * Secure 6-digit email verification codes.
 */

import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

const CODE_MIN = 100000;
const CODE_MAX_EXCLUSIVE = 1000000;

export const VERIFICATION_CODE_LENGTH = 6 as const;

function getVerificationPepper(): string {
  const pepper = process.env.VERIFICATION_CODE_PEPPER?.trim();

  if (!pepper) {
    throw new Error(
      "[Express-Führerschein] VERIFICATION_CODE_PEPPER fehlt.",
    );
  }

  if (pepper.length < 32) {
    throw new Error(
      "[Express-Führerschein] VERIFICATION_CODE_PEPPER muss mindestens 32 Zeichen lang sein.",
    );
  }

  return pepper;
}

export function generateVerificationCode(): string {
  return randomInt(CODE_MIN, CODE_MAX_EXCLUSIVE).toString();
}

export function isVerificationCodeFormatValid(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function hashVerificationCode(
  code: string,
  verificationId: string,
): string {
  const normalized = code.trim();

  if (!isVerificationCodeFormatValid(normalized)) {
    throw new Error("Ungültiges Verifizierungscode-Format.");
  }

  return createHmac("sha256", getVerificationPepper())
    .update(`${verificationId}:${normalized}`, "utf8")
    .digest("hex");
}

export function verifyCodeHash(
  code: string,
  verificationId: string,
  expectedHash: string,
): boolean {
  if (
    !isVerificationCodeFormatValid(code) ||
    !/^[a-f0-9]{64}$/i.test(expectedHash)
  ) {
    return false;
  }

  const actual = Buffer.from(
    hashVerificationCode(code, verificationId),
    "hex",
  );
  const expected = Buffer.from(expectedHash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}
