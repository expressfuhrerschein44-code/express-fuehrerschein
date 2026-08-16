"use client";

import { CheckCircle2, Target, XCircle } from "lucide-react";
import type { ExamHistoryItem } from "@/components/theory/results/exam-result-card";

export interface ExamResultDetailProps {
  result: ExamHistoryItem | null;
}

export function ExamResultDetail({ result }: ExamResultDetailProps) {
  if (!result) {
    return <div className="rounded-[16px] border border-dashed border-[#DCE4EF] bg-[#FAFBFD] p-6 text-center text-[9px] text-[#718094]">Wähle ein Ergebnis aus, um die Details zu sehen.</div>;
  }

  return (
    <section className="rounded-[16px] border border-[#E5EAF2] bg-white p-5">
      <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#718094]">Simulation</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#081529]">{result.passed ? "Bestanden" : "Nicht bestanden"}</h2>
          <p className="mt-1 text-[8px] text-[#718094]">{new Date(result.startedAt).toLocaleString("de-DE")}</p>
        </div>
        <p className="text-[26px] font-extrabold text-[#081529]">{result.scorePercent ?? 0}%</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Detail icon={Target} label="Beantwortet" value={`${result.answeredQuestions} / ${result.totalQuestions}`} />
        <Detail icon={CheckCircle2} label="Richtig" value={String(result.correctAnswers)} />
        <Detail icon={XCircle} label="Fehlerpunkte" value={String(result.penaltyPoints)} />
      </div>
      <p className="mt-4 text-[8px] leading-4 text-[#718094]">Das Ergebnis wurde serverseitig anhand des Konfigurations-Snapshots dieser Simulation berechnet.</p>
    </section>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return <div className="rounded-[14px] bg-[#F7F9FC] p-3"><Icon className="h-4 w-4 text-[#0B63F6]" /><p className="mt-2 text-[15px] font-extrabold text-[#081529]">{value}</p><p className="text-[8px] text-[#718094]">{label}</p></div>;
}
