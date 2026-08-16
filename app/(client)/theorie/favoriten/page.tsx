/**
 * Express-Führerschein
 * Favorites page.
 *
 * Current Prisma schema has no dedicated persistent favorites relation.
 * We intentionally refuse fake/in-memory favorites.
 */

import Link from "next/link";

import {
  ArrowLeft,
  Bookmark,
} from "lucide-react";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryFavoriteCapability,
} from "@/lib/server/theory/theory-favorite-service";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export default async function TheoryFavoritesPage() {
  const session =
    await requireClientSession();

  const capability =
    await getTheoryFavoriteCapability({
      userId:
        session
          .user
          .id,

      locale:
        session
          .user
          .preferredLocale,
    });

  return (
    <div className="mx-auto flex min-h-[480px] w-full max-w-[900px] items-center justify-center px-3 py-8 lg:px-7">
      <div className="w-full rounded-[18px] border border-[#E5EAF2] bg-white px-5 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF5FF] text-[#0B63F6]">
          <Bookmark className="h-5 w-5" />
        </span>

        <h1 className="mt-4 text-[18px] font-extrabold text-[#081529]">
          Markierte Fragen
        </h1>

        <p className="mx-auto mt-2 max-w-[580px] text-[11px] leading-5 text-[#66758A]">
          {capability.reason}
        </p>

        <p className="mx-auto mt-2 max-w-[580px] text-[9px] leading-4 text-[#7A899C]">
          Es werden bewusst keine Browser- oder In-Memory-Favoriten verwendet, damit PC und Mobile später dieselbe echte Datenquelle nutzen.
        </p>

        <Link
          href="/theorie"
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] px-4 text-[10px] font-extrabold text-[#53647A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
