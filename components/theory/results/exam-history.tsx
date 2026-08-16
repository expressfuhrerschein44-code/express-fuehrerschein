"use client";

import { History } from "lucide-react";
import { ExamResultCard, type ExamHistoryItem } from "@/components/theory/results/exam-result-card";

export interface ExamHistoryProps {
  results: readonly ExamHistoryItem[];
  selectedId?: string | null;
  onSelect?: (result: ExamHistoryItem) => void;
}

export function ExamHistory({ results, selectedId = null, onSelect }: ExamHistoryProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#E5EAF2] bg-white p-8 text-center">
        <History className="mx-auto h-5 w-5 text-[#718094]" />
        <p className="mt-2 text-[10px] font-extrabold text-[#081529]">Noch keine abgeschlossene Simulation</p>
        <p className="mt-1 text-[8px] text-[#718094]">Deine Ergebnisse erscheinen nach dem Abschluss einer Prüfungssimulation hier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => <ExamResultCard key={result.id} result={result} selected={result.id === selectedId} onSelect={onSelect} />)}
    </div>
  );
}
