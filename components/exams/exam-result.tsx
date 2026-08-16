import Link from "next/link";

import {
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import type {
  ExamResultView,
} from "@/types/exams";

export interface ExamResultProps {
  result:
    ExamResultView;
  licenseClassCode:
    string;
}

function answerText(
  values:
    readonly string[],
): string {
  return values.length
    ? values.join(
        ", ",
      )
    : "Keine Antwort";
}

export function ExamResult({
  result,
  licenseClassCode,
}: ExamResultProps) {
  const successful =
    result.passed ===
    true;

  return (
    <main className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <section className="rounded-[22px] border border-[#E5EAF2] bg-white p-5 text-center shadow-[0_12px_34px_rgba(17,40,70,0.05)] sm:p-7">
        <span
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
            result.trainingOnly
              ? "bg-[#EFF5FF] text-[#0B63F6]"
              : successful
                ? "bg-[#F1FBF6] text-[#0C8B59]"
                : "bg-[#FFF3F3] text-[#C43737]"
          }`}
        >
          {result.trainingOnly ? (
            <Trophy
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : successful ? (
            <CheckCircle2
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}
        </span>

        <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Klasse {licenseClassCode}
        </p>

        <h1 className="mt-1 text-[24px] font-black tracking-[-0.03em] text-[#081529]">
          {result.trainingOnly
            ? "Training abgeschlossen"
            : successful
              ? "Prüfung bestanden"
              : "Prüfung nicht bestanden"}
        </h1>

        <p className="mt-3 text-[34px] font-black tracking-[-0.04em] text-[#081529]">
          {result.scorePercent} %
        </p>

        <div className="mx-auto mt-5 grid max-w-[720px] grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[14px] bg-[#F8FAFD] p-3.5">
            <p className="text-[8px] font-bold text-[#8390A2]">
              Richtig
            </p>
            <p className="mt-1 text-[14px] font-black text-[#081529]">
              {result.correctAnswers}
            </p>
          </div>

          <div className="rounded-[14px] bg-[#F8FAFD] p-3.5">
            <p className="text-[8px] font-bold text-[#8390A2]">
              Falsch
            </p>
            <p className="mt-1 text-[14px] font-black text-[#081529]">
              {result.incorrectAnswers}
            </p>
          </div>

          <div className="rounded-[14px] bg-[#F8FAFD] p-3.5">
            <p className="text-[8px] font-bold text-[#8390A2]">
              Offen
            </p>
            <p className="mt-1 text-[14px] font-black text-[#081529]">
              {result.unansweredQuestions}
            </p>
          </div>

          <div className="rounded-[14px] bg-[#F8FAFD] p-3.5">
            <p className="text-[8px] font-bold text-[#8390A2]">
              Fehlerpunkte
            </p>
            <p className="mt-1 text-[14px] font-black text-[#081529]">
              {result.penaltyPoints}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/pruefungen"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] bg-white px-5 text-[9px] font-extrabold text-[#34445A]"
          >
            Zur Übersicht
          </Link>

          <Link
            href="/trainieren"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white"
          >
            <RotateCcw
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Weiter trainieren
          </Link>
        </div>
      </section>

      <section className="mt-4 rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Auswertung
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Fragen im Überblick
        </h2>

        <div className="mt-5 space-y-3">
          {result.review.map(
            (
              item,
            ) => (
              <article
                key={
                  item.id
                }
                className="rounded-[16px] border border-[#E7ECF3] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.05em] text-[#748398]">
                    Frage {item.position}
                  </p>

                  {item.isCorrect ===
                  true ? (
                    <span className="rounded-full border border-[#BFE8D7] bg-[#F1FBF6] px-2.5 py-1 text-[8px] font-extrabold text-[#0C8B59]">
                      Richtig
                    </span>
                  ) : item.isCorrect ===
                    false ? (
                    <span className="rounded-full border border-[#F1CACA] bg-[#FFF5F5] px-2.5 py-1 text-[8px] font-extrabold text-[#C43737]">
                      Falsch
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#E1E7EF] bg-[#F8FAFD] px-2.5 py-1 text-[8px] font-extrabold text-[#718096]">
                      Offen
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-[11px] font-extrabold leading-5 text-[#081529]">
                  {item.prompt}
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#F8FAFD] px-3 py-2.5">
                    <p className="text-[8px] font-bold text-[#8491A3]">
                      Deine Antwort
                    </p>
                    <p className="mt-1 text-[9px] font-semibold leading-4 text-[#34445A]">
                      {answerText(
                        item.selectedAnswerLabels,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F1FBF6] px-3 py-2.5">
                    <p className="text-[8px] font-bold text-[#5D8D78]">
                      Richtige Antwort
                    </p>
                    <p className="mt-1 text-[9px] font-semibold leading-4 text-[#176846]">
                      {answerText(
                        item.correctAnswerLabels,
                      )}
                    </p>
                  </div>
                </div>

                {item.explanation ? (
                  <div className="mt-2 rounded-xl border border-[#E4EAF2] px-3 py-2.5">
                    <p className="text-[8px] font-extrabold text-[#53647A]">
                      Warum?
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[9px] font-medium leading-4 text-[#6F7E91]">
                      {item.explanation}
                    </p>
                  </div>
                ) : null}
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
