/**
 * Express-Führerschein
 * Real mock-exam history.
 */

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryContextForUser,
  listExamHistory,
} from "@/lib/server/theory/theory-repository";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

function formatDate(
  value:
    Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    value,
  );
}

export default async function TheoryResultsPage() {
  const session =
    await requireClientSession();

  const context =
    await getTheoryContextForUser(
      session
        .user
        .id,

      session
        .user
        .preferredLocale,
    );

  const history =
    await listExamHistory(
      context,
      50,
    );

  return (
    <div className="mx-auto w-full max-w-[1000px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Theorieübersicht
      </Link>

      <div className="mt-4">
        <h1 className="text-[22px] font-extrabold text-[#081529]">
          Prüfungsergebnisse
        </h1>

        <p className="mt-1 text-[11px] leading-5 text-[#66758A]">
          Deine abgeschlossenen Theorie-Simulationen.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="mt-5 rounded-[16px] border border-[#E5EAF2] bg-white px-5 py-10 text-center">
          <p className="text-[11px] font-extrabold text-[#081529]">
            Noch keine abgeschlossene Simulation.
          </p>

          <Link
            href="/theorie/pruefungssimulation"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white"
          >
            Zur Prüfungssimulation
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {history.map(
            (
              exam,
            ) => (
              <article
                key={
                  exam.id
                }
                className="flex flex-col gap-3 rounded-[14px] border border-[#E5EAF2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      exam.passed
                        ? "bg-[#EAF9F2] text-[#10A36A]"
                        : "bg-[#FFF0F0] text-[#EF4444]"
                    }`}
                  >
                    {exam.passed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </span>

                  <div>
                    <p className="text-[10px] font-extrabold text-[#081529]">
                      {exam.passed
                        ? "Bestanden"
                        : "Nicht bestanden"}
                    </p>

                    <p className="mt-0.5 text-[8px] text-[#718094]">
                      {formatDate(
                        exam.startedAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[9px] text-[#66758A]">
                  <span>
                    Ergebnis:{" "}
                    <strong className="text-[#081529]">
                      {exam.scorePercent ?? 0}%
                    </strong>
                  </span>

                  <span>
                    Richtig:{" "}
                    <strong className="text-[#081529]">
                      {exam.correctAnswers}
                    </strong>
                  </span>

                  <span>
                    Fehler:{" "}
                    <strong className="text-[#081529]">
                      {exam.incorrectAnswers}
                    </strong>
                  </span>

                  <span>
                    Fehlerpunkte:{" "}
                    <strong className="text-[#081529]">
                      {exam.penaltyPoints}
                    </strong>
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
}