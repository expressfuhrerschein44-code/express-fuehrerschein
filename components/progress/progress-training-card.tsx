import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  Dumbbell,
  FileQuestion,
  Target,
} from "lucide-react";

import type {
  ProgressTrainingView,
} from "@/types/progress";

export interface ProgressTrainingCardProps {
  training:
    ProgressTrainingView;
}

function formatDate(
  value:
    string | null,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

export function ProgressTrainingCard({
  training,
}: ProgressTrainingCardProps) {
  const rows = [
    {
      id:
        "sessions",
      label:
        "Trainings",
      value:
        String(
          training.completedSessions,
        ),
      icon:
        Dumbbell,
    },
    {
      id:
        "questions",
      label:
        "Fragen trainiert",
      value:
        String(
          training.totalQuestionsAnswered,
        ),
      icon:
        FileQuestion,
    },
    {
      id:
        "time",
      label:
        "Trainingszeit",
      value:
        `${training.totalDurationMinutes} Min`,
      icon:
        Clock3,
    },
    {
      id:
        "score",
      label:
        "Ø Score",
      value:
        training.averageScorePercent ===
        null
          ? "—"
          : `${training.averageScorePercent} %`,
      icon:
        Target,
    },
  ] as const;

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Training
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Deine Übungseinheiten
          </h2>
        </div>

        <Link
          href="/trainieren"
          className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0B63F6]"
        >
          Trainieren
          <ArrowRight
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
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
                <Icon
                  className="h-3.5 w-3.5 text-[#0B63F6]"
                  aria-hidden="true"
                />

                <p className="mt-2 text-[8px] font-bold text-[#78879A]">
                  {row.label}
                </p>

                <p className="mt-0.5 text-[13px] font-black text-[#081529]">
                  {row.value}
                </p>
              </div>
            );
          },
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-[#F8FAFD] px-3.5 py-3">
        <div>
          <p className="text-[8px] font-bold text-[#8390A2]">
            Letztes Training
          </p>
          <p className="mt-0.5 text-[9px] font-extrabold text-[#34445A]">
            {formatDate(
              training.lastTrainingAt,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-bold text-[#8390A2]">
            Letzter Score
          </p>
          <p className="mt-0.5 text-[9px] font-extrabold text-[#34445A]">
            {training.lastScorePercent ===
            null
              ? "—"
              : `${training.lastScorePercent} %`}
          </p>
        </div>
      </div>
    </section>
  );
}
