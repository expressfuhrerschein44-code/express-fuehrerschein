/**
 * Express-Führerschein
 * Protected Profile route.
 *
 * Architecture:
 * app/(client)/layout.tsx
 *   -> ClientShell
 *      -> /profil
 *         -> getProfileData()
 *            -> profile-service.ts
 *               -> profile-repository.ts
 *                  -> Prisma / Supabase
 *
 * This route never imports Prisma directly.
 */

import {
  redirect,
} from "next/navigation";

import {
  ProfilePage,
} from "@/components/profile/profile-page";

import {
  getProfileData,
} from "@/lib/server/profile/profile-service";

import {
  ProfileServiceError,
} from "@/types/profile";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function ProfileRoutePage() {
  try {
    const data =
      await getProfileData();

    return (
      <ProfilePage
        data={
          data
        }
      />
    );
  } catch (
    error:
      unknown
  ) {
    /**
     * The parent client layout already protects the client area.
     * This additional route-level guard handles a session that expires
     * between the layout read and the Profile data read.
     */
    if (
      error instanceof
        ProfileServiceError &&
      error.code ===
        "UNAUTHENTICATED"
    ) {
      redirect(
        "/login",
      );
    }

    /**
     * If the account no longer exists or is unavailable, returning to login
     * is safer than exposing a broken private page.
     */
    if (
      error instanceof
        ProfileServiceError &&
      error.code ===
        "ACCOUNT_UNAVAILABLE"
    ) {
      redirect(
        "/login",
      );
    }

    /**
     * Database/storage/internal failures are intentionally re-thrown.
     * Next.js will render app/(client)/profil/error.tsx.
     */
    throw error;
  }
}
