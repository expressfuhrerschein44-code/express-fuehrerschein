import Link from "next/link";

import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Target,
} from "lucide-react";

import type {
  ProgressExamView,
} from "@/types/progress";

export interface ProgressExamCardProps {
  exam:
    ProgressExamView;
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

export function ProgressExamCard({
  exam,
}: ProgressExamCardProps) {
  const rows = [
    {
      id:
        "attempts",
      label:
        "Versuche",
      value:
        String(
          exam.completedAttempts,
        ),
      icon:
        ClipboardCheck,
    },
    {
      id:
        "passed",
      label:
        "Bestanden",
      value:
        String(
          exam.passedAttempts,
        ),
      icon:
        CheckCircle2,
    },
    {
      id:
        "passRate",
      label:
        "Bestehensquote",
      value:
        exam.passRatePercent ===
        null
          ? "—"
          : `${exam.passRatePercent} %`,
      icon:
        Award,
    },
    {
      id:
        "score",
      label:
        "Ø Score",
      value:
        exam.averageScorePercent ===
        null
          ? "—"
          : `${exam.averageScorePercent} %`,
      icon:
        Target,
    },
  ] as const;

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Prüfung
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Prüfungssimulationen
          </h2>
        </div>

        <Link
          href="/pruefungen"
          className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0B63F6]"
        >
          Prüfungen
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
            Letzte Simulation
          </p>
          <p className="mt-0.5 text-[9px] font-extrabold text-[#34445A]">
            {formatDate(
              exam.lastAttemptAt,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-bold text-[#8390A2]">
            Ergebnis
          </p>

          <p className="mt-0.5 text-[9px] font-extrabold text-[#34445A]">
            {exam.lastScorePercent ===
            null
              ? "—"
              : `${exam.lastScorePercent} %`}
          </p>
        </div>
      </div>
    </section>
  );
}
