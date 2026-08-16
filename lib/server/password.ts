/**
 * Express-Führerschein
 * Password hashing with Node.js scrypt.
 *
 * Stored format:
 * scrypt$N$r$p$saltBase64url$hashBase64url
 */

import {
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const MAX_MEMORY = 64 * 1024 * 1024;

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  N = SCRYPT_N,
  r = SCRYPT_R,
  p = SCRYPT_P,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      keyLength,
      {
        N,
        r,
        p,
        maxmem: MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(
  password: string,
): Promise<string> {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw new Error("Ungültige Passwortlänge.");
  }

  const salt = randomBytes(16);
  const derived = await deriveKey(
    password,
    salt,
    KEY_LENGTH,
  );

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const [
      algorithm,
      nRaw,
      rRaw,
      pRaw,
      saltRaw,
      hashRaw,
    ] = storedHash.split("$");

    if (
      algorithm !== "scrypt" ||
      !nRaw ||
      !rRaw ||
      !pRaw ||
      !saltRaw ||
      !hashRaw
    ) {
      return false;
    }

    const N = Number(nRaw);
    const r = Number(rRaw);
    const p = Number(pRaw);

    if (
      !Number.isInteger(N) ||
      !Number.isInteger(r) ||
      !Number.isInteger(p)
    ) {
      return false;
    }

    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(hashRaw, "base64url");

    const actual = await deriveKey(
      password,
      salt,
      expected.length,
      N,
      r,
      p,
    );

    return (
      actual.length === expected.length &&
      timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}
