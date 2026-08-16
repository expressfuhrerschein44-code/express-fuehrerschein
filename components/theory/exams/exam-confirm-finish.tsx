"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

export interface ExamConfirmFinishProps {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ExamConfirmFinish({
  open,
  answeredCount,
  totalQuestions,
  pending = false,
  onCancel,
  onConfirm,
}: ExamConfirmFinishProps) {
  if (!open) return null;
  const unanswered = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061427]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="exam-finish-title">
      <div className="w-full max-w-[440px] rounded-[18px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#F59E0B]"><AlertTriangle className="h-5 w-5" /></span>
          <button type="button" disabled={pending} onClick={onCancel} aria-label="Dialog schließen" className="rounded-lg p-2 text-[#718094] hover:bg-[#F7F9FC]"><X className="h-4 w-4" /></button>
        </div>
        <h2 id="exam-finish-title" className="mt-3 text-[16px] font-extrabold text-[#081529]">Prüfung wirklich beenden?</h2>
        <p className="mt-2 text-[9px] leading-4 text-[#66758A]">
          {answeredCount} von {totalQuestions} Fragen wurden beantwortet.
          {unanswered > 0 ? ` ${unanswered} ${unanswered === 1 ? "Frage ist" : "Fragen sind"} noch offen.` : " Alle Fragen sind beantwortet."}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={pending} onClick={onCancel} className="min-h-10 rounded-lg border border-[#DCE4EF] px-4 text-[9px] font-extrabold text-[#53647A]">Zurück zur Prüfung</button>
          <button type="button" disabled={pending} onClick={() => void onConfirm()} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#061427] px-4 text-[9px] font-extrabold text-white disabled:opacity-55">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Prüfung beenden
          </button>
        </div>
      </div>
    </div>
  );
}
