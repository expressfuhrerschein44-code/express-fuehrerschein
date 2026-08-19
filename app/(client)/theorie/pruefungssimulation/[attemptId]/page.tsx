import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  ExamPlayer,
} from "@/components/exams/exam-player";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryExamAttemptPageData,
  TheoryExamServiceError,
} from "@/lib/server/theory/theory-exam-service";

import type {
  ExamAttemptPageData,
  ExamResultView,
} from "@/types/exams";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

interface TheoryExamAttemptPageProps {
  params:
    Promise<{
      attemptId:
        string;
    }>;
}

function ResultPage({
  data,
}: {
  data:
    ExamAttemptPageData;
}) {
  const result =
    data.result as
      ExamResultView;

  const passed =
    result.passed ===
    true;

  const failed =
    result.passed ===
    false;

  const title =
    result.trainingOnly
      ? "Simulation abgeschlossen"
      : passed
        ? "Prüfung bestanden"
        : failed
          ? "Prüfung nicht bestanden"
          : "Prüfung abgeschlossen";

  const ResultIcon =
    result.trainingOnly
      ? ClipboardCheck
      : passed
        ? CheckCircle2
        : failed
          ? XCircle
          : CircleHelp;

  const tone =
    result.trainingOnly
      ? "border-[#CFE0FF] bg-[#F3F7FF] text-[#0B63F6]"
      : passed
        ? "border-[#BFE8D7] bg-[#F2FBF7] text-[#0C8B59]"
        : failed
          ? "border-[#F8C8C8] bg-[#FFF6F6] text-[#D93B3B]"
          : "border-[#DCE4EF] bg-[#F8FAFD] text-[#53647A]";

  return (
    <main className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-5 sm:px-5 lg:px-6 lg:pb-10 lg:pt-7">
      <Link
        href="/theorie/pruefungssimulation"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        Prüfungssimulation
      </Link>

      <section
        className={`mt-4 rounded-[20px] border p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] sm:p-6 ${tone}`}
      >
        <ResultIcon
          className="h-7 w-7"
          aria-hidden="true"
        />

        <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.08em]">
          Klasse {data.licenseClassCode}
        </p>

        <h1 className="mt-1 text-[22px] font-black text-[#081529] sm:text-[26px]">
          {title}
        </h1>

        <p className="mt-2 text-[10px] font-semibold leading-5 text-[#5F6F84]">
          Deine Antworten wurden serverseitig ausgewertet. Erst jetzt werden die richtigen Lösungen und Erklärungen angezeigt.
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#718094]">
            Ergebnis
          </p>
          <p className="mt-2 text-[22px] font-black text-[#081529]">
            {result.scorePercent}%
          </p>
        </article>

        <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#718094]">
            Richtig
          </p>
          <p className="mt-2 text-[22px] font-black text-[#0C8B59]">
            {result.correctAnswers}
          </p>
        </article>

        <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#718094]">
            Falsch
          </p>
          <p className="mt-2 text-[22px] font-black text-[#D93B3B]">
            {result.incorrectAnswers}
          </p>
        </article>

        <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#718094]">
            Fehlerpunkte
          </p>
          <p className="mt-2 text-[22px] font-black text-[#081529]">
            {result.penaltyPoints}
          </p>
        </article>
      </section>

      {result.unansweredQuestions >
      0 ? (
        <div className="mt-4 rounded-[14px] border border-[#F4D6A8] bg-[#FFF9EF] px-4 py-3">
          <p className="text-[9px] font-bold text-[#9A651B]">
            {result.unansweredQuestions} Frage(n) wurden nicht beantwortet.
          </p>
        </div>
      ) : null}

      <section className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
              Auswertung
            </p>

            <h2 className="mt-1 text-[18px] font-black text-[#081529]">
              Deine Antworten im Detail
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/theorie/ergebnisse"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#DCE4EF] bg-white px-4 text-[9px] font-extrabold text-[#53647A]"
            >
              Alle Ergebnisse
            </Link>

            <Link
              href="/theorie/pruefungssimulation"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white"
            >
              <RotateCcw
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Neue Simulation
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {result.review.map(
            (
              item,
            ) => {
              const correct =
                item.isCorrect ===
                true;

              const wrong =
                item.isCorrect ===
                false;

              return (
                <article
                  key={
                    item.id
                  }
                  className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_6px_20px_rgba(17,40,70,0.03)] sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        correct
                          ? "bg-[#EEF9F4] text-[#0C8B59]"
                          : wrong
                            ? "bg-[#FFF1F1] text-[#D93B3B]"
                            : "bg-[#F2F5F9] text-[#65758A]"
                      }`}
                    >
                      {correct ? (
                        <CheckCircle2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : wrong ? (
                        <XCircle
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <CircleHelp
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#718094]">
                          Frage {item.position}
                        </p>

                        {item.penaltyPoints >
                        0 ? (
                          <span className="rounded-full bg-[#F7F9FC] px-2.5 py-1 text-[8px] font-extrabold text-[#53647A]">
                            {item.penaltyPoints} Punkte
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 text-[12px] font-black leading-5 text-[#081529]">
                        {item.prompt}
                      </h3>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#E5EAF2] bg-[#FAFBFD] p-3">
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#718094]">
                            Deine Antwort
                          </p>

                          <p className="mt-1.5 text-[9px] font-semibold leading-4 text-[#34445A]">
                            {item.selectedAnswerLabels.length >
                            0
                              ? item.selectedAnswerLabels.join(
                                  ", ",
                                )
                              : "Keine Antwort"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#BFE8D7] bg-[#F5FCF8] p-3">
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0C8B59]">
                            Richtige Antwort
                          </p>

                          <p className="mt-1.5 text-[9px] font-semibold leading-4 text-[#27624D]">
                            {item.correctAnswerLabels.length >
                            0
                              ? item.correctAnswerLabels.join(
                                  ", ",
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {item.explanation ? (
                        <div className="mt-3 rounded-xl border border-[#DCE7F7] bg-[#F7FAFF] p-3">
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
                            Erklärung
                          </p>

                          <p className="mt-1.5 text-[9px] leading-4 text-[#53647A]">
                            {item.explanation}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      </section>
    </main>
  );
}

export default async function TheoryExamAttemptPage({
  params,
}: TheoryExamAttemptPageProps) {
  const {
    attemptId,
  } =
    await params;

  const normalizedAttemptId =
    attemptId.trim();

  if (
    !normalizedAttemptId
  ) {
    notFound();
  }

  const session =
    await requireClientSession();

  let data:
    ExamAttemptPageData | null =
    null;

  let loadError:
    string | null =
    null;

  try {
    data =
      await getTheoryExamAttemptPageData({
        userId:
          session.user.id,
        locale:
          session.user
            .preferredLocale,
        attemptId:
          normalizedAttemptId,
      });
  } catch (
    error
  ) {
    if (
      error instanceof
      TheoryExamServiceError
    ) {
      loadError =
        error.message;
    } else {
      throw error;
    }
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-5 sm:px-5 lg:px-6 lg:pb-10">
        <Link
          href="/theorie/pruefungssimulation"
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
        >
          <ArrowLeft
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          Prüfungssimulation
        </Link>

        <section className="mt-4 rounded-[18px] border border-[#F1CACA] bg-[#FFF7F7] p-5">
          <h1 className="text-[16px] font-black text-[#9F2F2F]">
            Simulation konnte nicht geladen werden
          </h1>

          <p className="mt-2 text-[10px] leading-5 text-[#7A4545]">
            {loadError}
          </p>
        </section>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  if (data.result) {
    return (
      <ResultPage
        data={
          data
        }
      />
    );
  }

  return (
    <ExamPlayer
      data={
        data
      }
    />
  );
}
