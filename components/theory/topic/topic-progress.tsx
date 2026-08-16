import {
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Trophy,
} from "lucide-react";

export interface TopicProgressProps {
  progressPercent: number;
  masteryScore: number;
  answeredQuestions: number;
  questionCount: number;
  correctAnswers: number;
  reviewQuestions: number;
  masteredQuestions: number;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function TopicProgress({
  progressPercent,
  masteryScore,
  answeredQuestions,
  questionCount,
  correctAnswers,
  reviewQuestions,
  masteredQuestions,
}: TopicProgressProps) {
  const progress = clampPercent(progressPercent);
  const mastery = clampPercent(masteryScore);

  return (
    <section
      aria-labelledby="topic-progress-title"
      className="rounded-[18px] border border-[#E5EAF2] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
            Lernstand
          </p>
          <h2
            id="topic-progress-title"
            className="mt-1 text-[15px] font-extrabold text-[#081529]"
          >
            Dein Fortschritt in diesem Thema
          </h2>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <BrainCircuit className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] bg-[#F8FAFD] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold text-[#748397]">
                Bearbeitungsfortschritt
              </p>
              <p className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-[#081529]">
                {progress}%
              </p>
            </div>
            <CircleHelp className="h-5 w-5 text-[#0B63F6]" aria-hidden="true" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E6ECF4]">
            <div
              className="h-full rounded-full bg-[#0B63F6] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[9px] text-[#66758A]">
            {answeredQuestions} von {questionCount} Fragen bearbeitet
          </p>
        </div>

        <div className="rounded-[14px] bg-[#F8FAFD] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold text-[#748397]">
                Themenbeherrschung
              </p>
              <p className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-[#081529]">
                {mastery}%
              </p>
            </div>
            <Trophy className="h-5 w-5 text-[#10A36A]" aria-hidden="true" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E6ECF4]">
            <div
              className="h-full rounded-full bg-[#10A36A] transition-[width] duration-300"
              style={{ width: `${mastery}%` }}
            />
          </div>
          <p className="mt-2 text-[9px] text-[#66758A]">
            Wird aus deinen echten Lern- und Trainingsergebnissen berechnet.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-[#EDF1F6] p-3">
          <CheckCircle2 className="h-4 w-4 text-[#10A36A]" aria-hidden="true" />
          <p className="mt-2 text-[16px] font-extrabold text-[#081529]">
            {correctAnswers}
          </p>
          <p className="text-[8px] font-semibold text-[#748397]">
            Richtige Antworten
          </p>
        </div>

        <div className="rounded-xl border border-[#EDF1F6] p-3">
          <RotateCcw className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
          <p className="mt-2 text-[16px] font-extrabold text-[#081529]">
            {reviewQuestions}
          </p>
          <p className="text-[8px] font-semibold text-[#748397]">
            Zu wiederholen
          </p>
        </div>

        <div className="rounded-xl border border-[#EDF1F6] p-3">
          <Trophy className="h-4 w-4 text-[#0B63F6]" aria-hidden="true" />
          <p className="mt-2 text-[16px] font-extrabold text-[#081529]">
            {masteredQuestions}
          </p>
          <p className="text-[8px] font-semibold text-[#748397]">
            Gemeistert
          </p>
        </div>

        <div className="rounded-xl border border-[#EDF1F6] p-3">
          <CircleHelp className="h-4 w-4 text-[#66758A]" aria-hidden="true" />
          <p className="mt-2 text-[16px] font-extrabold text-[#081529]">
            {questionCount}
          </p>
          <p className="text-[8px] font-semibold text-[#748397]">
            Verfügbare Fragen
          </p>
        </div>
      </div>
    </section>
  );
}
