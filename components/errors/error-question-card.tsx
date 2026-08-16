import {
  CalendarClock,
  CircleAlert,
  RotateCcw,
} from "lucide-react";

import type {
  ErrorQuestionView,
} from "@/types/errors";

export interface ErrorQuestionCardProps {
  question:
    ErrorQuestionView;
  onStart:
    (
      questionId:
        string,
    ) => void;
}

function formatDate(
  value:
    string | null,
): string {
  if (!value) {
    return "Noch nicht";
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

export function ErrorQuestionCard({
  question,
  onStart,
}: ErrorQuestionCardProps) {
  return (
    <article className="rounded-[16px] border border-[#E7ECF3] bg-white p-4 transition hover:border-[#D3DEEB]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#F2F7FF] px-2.5 py-1 text-[8px] font-extrabold text-[#0B63F6]">
            {question.topicTitle}
          </span>

          <h3 className="mt-2.5 text-[11px] font-extrabold leading-5 text-[#081529]">
            {question.prompt}
          </h3>
        </div>

        {question.penaltyPoints >
        0 ? (
          <span className="shrink-0 rounded-full bg-[#FFF5F5] px-2.5 py-1 text-[8px] font-extrabold text-[#C43737]">
            {question.penaltyPoints} Punkte
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFD] px-2.5 py-1.5 text-[8px] font-bold text-[#65758A]">
          <CircleAlert
            className="h-3 w-3 text-[#C43737]"
            aria-hidden="true"
          />
          {question.incorrectCount}× falsch
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFD] px-2.5 py-1.5 text-[8px] font-bold text-[#65758A]">
          <CalendarClock
            className="h-3 w-3 text-[#7A899C]"
            aria-hidden="true"
          />
          {formatDate(
            question.lastAnsweredAt,
          )}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          onStart(
            question.id,
          )
        }
        className="mt-4 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-4 text-[8px] font-extrabold text-[#0B63F6] transition hover:border-[#BDD0EB] hover:bg-[#F7FAFF]"
      >
        <RotateCcw
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        Wiederholen
      </button>
    </article>
  );
}
