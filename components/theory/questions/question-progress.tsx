"use client";

export interface QuestionProgressProps {
  position?: number | null;
  totalQuestions?: number | null;
  answeredCount?: number | null;
  label?: string;
  compact?: boolean;
  className?: string;
}

function boundedInt(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value ?? 0));
}

export function QuestionProgress({
  position,
  totalQuestions,
  answeredCount,
  label = "Fortschritt",
  compact = false,
  className = "",
}: QuestionProgressProps) {
  const total = boundedInt(totalQuestions);
  const current = total > 0
    ? Math.min(total, Math.max(1, boundedInt(position) || 1))
    : 0;
  const answered = total > 0
    ? Math.min(total, boundedInt(answeredCount))
    : boundedInt(answeredCount);

  const percent = total > 0
    ? Math.max(0, Math.min(100, Math.round((current / total) * 100)))
    : 0;

  if (total <= 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`} aria-label={`${label}: ${current} von ${total}`}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6F7F94]">
          {label}
        </span>
        <span className="text-[9px] font-bold tabular-nums text-[#53647A]">
          {current} / {total}
          {!compact && answered > 0 ? ` · ${answered} beantwortet` : ""}
        </span>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[#E9EEF5]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${current} von ${total} Fragen`}
      >
        <div
          className="h-full rounded-full bg-[#0B63F6] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
