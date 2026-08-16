import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type {
  ExamHistoryItemView,
} from "@/types/exams";

export interface ExamHistoryCardProps {
  attempt:
    ExamHistoryItemView;
  trainingOnly?:
    boolean;
}

function formatDate(
  value:
    string,
): string {
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
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}

export function ExamHistoryCard({
  attempt,
  trainingOnly = false,
}: ExamHistoryCardProps) {
  const passed =
    attempt.passed ===
    true;

  return (
    <Link
      href={`/pruefungen/${encodeURIComponent(attempt.id)}`}
      className="flex items-center justify-between gap-4 rounded-[16px] border border-[#E7ECF3] bg-white p-4 transition hover:border-[#C9D9F2] hover:shadow-[0_8px_22px_rgba(17,40,70,0.05)]"
    >
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-[#78879A]">
          {formatDate(
            attempt.completedAt ??
            attempt.startedAt,
          )}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-black text-[#081529]">
            {attempt.scorePercent ===
            null
              ? "—"
              : `${attempt.scorePercent} %`}
          </span>

          <span className="text-[8px] font-bold text-[#7B899B]">
            {attempt.correctAnswers} richtig · {attempt.incorrectAnswers} falsch
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {trainingOnly ? (
          <span className="rounded-full border border-[#CFE0FF] bg-[#F2F7FF] px-2.5 py-1 text-[8px] font-extrabold text-[#0B63F6]">
            Training
          </span>
        ) : passed ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#BFE8D7] bg-[#F1FBF6] px-2.5 py-1 text-[8px] font-extrabold text-[#0C8B59]">
            <CheckCircle2
              className="h-3 w-3"
              aria-hidden="true"
            />
            Bestanden
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#F1CACA] bg-[#FFF5F5] px-2.5 py-1 text-[8px] font-extrabold text-[#C43737]">
            <XCircle
              className="h-3 w-3"
              aria-hidden="true"
            />
            Nicht bestanden
          </span>
        )}

        <ArrowRight
          className="h-4 w-4 text-[#8390A2]"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
