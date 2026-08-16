import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  CircleAlert,
  FileQuestion,
  Target,
} from "lucide-react";

import type {
  ProgressTheoryView,
} from "@/types/progress";

export interface ProgressTheoryCardProps {
  theory:
    ProgressTheoryView;
}

export function ProgressTheoryCard({
  theory,
}: ProgressTheoryCardProps) {
  const rows = [
    {
      id:
        "lessons",
      label:
        "Lektionen",
      value:
        `${theory.completedLessons} / ${theory.totalLessons}`,
      detail:
        `${theory.lessonCompletionPercent} % abgeschlossen`,
      icon:
        BookOpenCheck,
    },
    {
      id:
        "questions",
      label:
        "Fragen",
      value:
        `${theory.answeredQuestions} / ${theory.totalQuestions}`,
      detail:
        `${theory.questionCoveragePercent} % bearbeitet`,
      icon:
        FileQuestion,
    },
    {
      id:
        "accuracy",
      label:
        "Trefferquote",
      value:
        `${theory.accuracyPercent} %`,
      detail:
        `${theory.correctAttempts} richtig · ${theory.incorrectAttempts} falsch`,
      icon:
        Target,
    },
    {
      id:
        "review",
      label:
        "Zu wiederholen",
      value:
        String(
          theory.needsReviewCount,
        ),
      detail:
        "Fragen im Fehlertraining",
      icon:
        CircleAlert,
    },
  ] as const;

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Theorie
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Dein Lernstand
          </h2>
        </div>

        <Link
          href="/theorie"
          className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0B63F6]"
        >
          Theorie
          <ArrowRight
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(
          (
            row,
          ) => {
            const Icon =
              row.icon;

            return (
              <div
                key={
                  row.id
                }
                className="rounded-[15px] border border-[#E8EDF4] bg-[#FAFBFD] p-3.5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0B63F6] shadow-[0_3px_10px_rgba(17,40,70,0.04)]">
                    <Icon
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-[#78879A]">
                      {row.label}
                    </p>

                    <p className="mt-0.5 text-[13px] font-black text-[#081529]">
                      {row.value}
                    </p>

                    <p className="mt-0.5 text-[8px] font-medium leading-3.5 text-[#8491A3]">
                      {row.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
