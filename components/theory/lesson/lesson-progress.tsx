"use client";

export interface LessonProgressProps {
  percent: number;
  currentBlock: number;
  totalBlocks: number;
}

export function LessonProgress({
  percent,
  currentBlock,
  totalBlocks,
}: LessonProgressProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const safeTotal = Math.max(0, totalBlocks);
  const position = safeTotal === 0
    ? 0
    : Math.min(Math.max(1, currentBlock + 1), safeTotal);

  return (
    <div className="rounded-xl border border-[#E5EAF2] bg-white p-3.5">
      <div className="flex items-center justify-between gap-3 text-[9px]">
        <span className="font-semibold text-[#66758A]">
          Lernfortschritt
        </span>

        <span className="font-extrabold text-[#081529]">
          {safeTotal > 0 ? `${position} / ${safeTotal}` : "Noch kein Inhalt"}
        </span>
      </div>

      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]"
        role="progressbar"
        aria-label="Lernfortschritt der Lektion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <div
          className="h-full rounded-full bg-[#0B63F6] transition-[width] duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <p className="mt-1.5 text-right text-[8px] font-bold text-[#7A899C]">
        {safePercent} %
      </p>
    </div>
  );
}
