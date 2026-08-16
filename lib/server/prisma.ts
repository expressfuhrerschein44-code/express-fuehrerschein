/**
 * Express-Führerschein
 * Shared Prisma Client singleton.
 *
 * Prisma ORM: 6.19.x
 *
 * Why a singleton?
 * Next.js development hot reload can evaluate server modules repeatedly.
 * Reusing one PrismaClient instance avoids creating unnecessary database
 * connection pools during development.
 *
 * IMPORTANT:
 * - server-only module;
 * - never import this file from a Client Component;
 * - DATABASE_URL is read internally by Prisma Client;
 * - DIRECT_URL is reserved for Prisma CLI / migration operations.
 */

import "server-only";

import {
  PrismaClient,
} from "@prisma/client";

/* ==========================================================================
   GLOBAL DEVELOPMENT CACHE
   ========================================================================== */

const globalForPrisma =
  globalThis as unknown as {
    __efPrisma?:
      PrismaClient;
  };

/* ==========================================================================
   CLIENT
   ========================================================================== */

export const prisma =
  globalForPrisma.__efPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV ===
      "development"
        ? [
            "warn",
            "error",
          ]
        : [
            "error",
          ],
  });

/* ==========================================================================
   DEVELOPMENT HOT-RELOAD PROTECTION
   ========================================================================== */

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.__efPrisma =
    prisma;
}

/* ==========================================================================
   DEFAULT EXPORT
   ========================================================================== */

export default prisma;
