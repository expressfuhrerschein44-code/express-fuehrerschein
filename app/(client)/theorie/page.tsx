/**
 * Express-Führerschein
 * Theorie overview route.
 *
 * Uses the existing authenticated client shell from app/(client)/layout.tsx.
 * No sidebar/header duplication here.
 */

import {
  TheoryPage,
} from "@/components/theory/theory-page";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

import type {
  TheoryOverviewData as TheoryClientOverviewData,
} from "@/types/theory";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export default async function TheoriePage() {
  const data =
    await getTheoryOverviewData();

  const clientData:
    TheoryClientOverviewData =
    data;

  return (
    <TheoryPage
      data={
        clientData
      }
    />
  );
}
