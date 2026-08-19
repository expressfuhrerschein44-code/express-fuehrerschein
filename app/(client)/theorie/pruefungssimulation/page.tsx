/**
 * Express-Führerschein
 * Mock exam entry page.
 *
 * Exam rules are intentionally not hard-coded here.
 * POST /api/theory/exams resolves trusted configuration server-side.
 */

import Link from "next/link";

import {
  ArrowLeft,
  ClipboardCheck,
  LockKeyhole,
} from "lucide-react";

import {
  StartExamButton,
} from "@/components/exams/start-exam-button";

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

export default async function TheoryExamPage() {
  const data =
    await getTheoryOverviewData();

  const clientData:
    TheoryClientOverviewData =
    data;

  if (
    clientData.status !==
    "ready"
  ) {
    return (
      <TheoryPage
        data={
          clientData
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Theorieübersicht
      </Link>

      <section className="mt-4 rounded-[18px] border border-[#E5EAF2] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <ClipboardCheck className="h-6 w-6" />
        </span>

        <h1 className="mt-4 text-[24px] font-extrabold text-[#081529]">
          Prüfungssimulation
        </h1>

        <p className="mt-2 text-[11px] leading-5 text-[#66758A]">
          Teste dein Wissen unter realistischen Prüfungsbedingungen. Die gültigen Regeln werden serverseitig aus der Konfiguration für {clientData.countryCode} / {clientData.licenseClassCode ?? "—"} geladen.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-[#DDE7F4] bg-[#F8FAFD] p-4">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63F6]" />

          <p className="text-[9px] leading-4 text-[#53647A]">
            Während einer laufenden Simulation werden richtige Antworten nicht vorzeitig an den Browser übertragen. Die Korrektur erfolgt erst nach Abschluss.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/theorie/ergebnisse"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] px-4 text-[10px] font-extrabold text-[#53647A]"
          >
            Bisherige Ergebnisse
          </Link>

          <StartExamButton />
        </div>
      </section>
    </div>
  );
}
