"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export interface ExamHistoryItem {
  id: string;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  scorePercent: number | null;
  passed: boolean | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ExamResultCardProps {
  result: ExamHistoryItem;
  selected?: boolean;
  onSelect?: (result: ExamHistoryItem) => void;
}

export function ExamResultCard({ result, selected = false, onSelect }: ExamResultCardProps) {
  const passed = result.passed === true;
  const failed = result.passed === false;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(result)}
      aria-pressed={selected}
      className={[
        "w-full rounded-[16px] border bg-white p-4 text-left transition",
        selected ? "border-[#0B63F6] shadow-[0_8px_24px_rgba(11,99,246,0.08)]" : "border-[#E5EAF2] hover:border-[#C9D8EC]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            passed ? "bg-[#EAF8F2] text-[#10A36A]" : failed ? "bg-[#FFF2F2] text-[#EF4444]" : "bg-[#F7F9FC] text-[#718094]",
          ].join(" ")}>
            {passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-[11px] font-extrabold text-[#081529]">{passed ? "Bestanden" : failed ? "Nicht bestanden" : "Auswertung"}</p>
            <p className="mt-1 flex items-center gap-1 text-[8px] text-[#718094]"><Clock3 className="h-3 w-3" /> {new Date(result.startedAt).toLocaleString("de-DE")}</p>
          </div>
        </div>
        <span className="text-[18px] font-extrabold text-[#081529]">{result.scorePercent ?? 0}%</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Richtig" value={result.correctAnswers} />
        <Mini label="Falsch" value={result.incorrectAnswers} />
        <Mini label="Fehlerpunkte" value={result.penaltyPoints} />
      </div>
    </button>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-[#F7F9FC] px-2 py-2"><p className="text-[11px] font-extrabold text-[#081529]">{value}</p><p className="text-[7px] text-[#718094]">{label}</p></div>;
}
