import {
  History,
} from "lucide-react";

import {
  ExamHistoryCard,
} from "@/components/exams/exam-history-card";

import type {
  ExamHistoryItemView,
} from "@/types/exams";

export interface ExamHistoryListProps {
  history:
    readonly ExamHistoryItemView[];
  trainingOnly?:
    boolean;
}

export function ExamHistoryList({
  history,
  trainingOnly = false,
}: ExamHistoryListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Historie
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Letzte Simulationen
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Deine abgeschlossenen Versuche und Ergebnisse.
        </p>
      </div>

      {history.length ? (
        <div className="mt-5 space-y-3">
          {history.map(
            (
              attempt,
            ) => (
              <ExamHistoryCard
                key={attempt.id}
                attempt={attempt}
                trainingOnly={trainingOnly}
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7E8DA1] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
            Noch keine Simulation abgeschlossen
          </p>

          <p className="mx-auto mt-1 max-w-[330px] text-[9px] font-medium leading-4 text-[#8491A3]">
            Dein erster abgeschlossener Versuch erscheint anschließend automatisch hier.
          </p>
        </div>
      )}
    </section>
  );
}
