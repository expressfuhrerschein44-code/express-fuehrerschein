"use client";

import Link from "next/link";
import {
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  TheoryExamResultView,
} from "@/types/theory";

export interface ExamResultProps {
  result: TheoryExamResultView;
}

export function ExamResult({
  result,
}: ExamResultProps) {
  return (
    <section className="mx-auto w-full max-w-[760px] rounded-[18px] border border-[#E5EAF2] bg-white p-5 text-center shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-7">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          result.passed
            ? "bg-[#EAF9F2] text-[#10A36A]"
            : "bg-[#FFF0F0] text-[#EF4444]"
        }`}
      >
        {result.passed ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <XCircle className="h-7 w-7" />
        )}
      </span>

      <h1 className="mt-4 text-[22px] font-extrabold text-[#081529]">
        Dein Ergebnis
      </h1>

      <p
        className={`mt-1 text-[13px] font-extrabold ${
          result.passed ? "text-[#10A36A]" : "text-[#EF4444]"
        }`}
      >
        {result.passed ? "Bestanden" : "Nicht bestanden"}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Ergebnis", `${result.scorePercent}%`],
          ["Richtig", `${result.correctAnswers}`],
          ["Fehler", `${result.incorrectAnswers}`],
          ["Fehlerpunkte", `${result.penaltyPoints}`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-[#F7F9FC] px-3 py-3"
          >
            <p className="text-[8px] text-[#718094]">
              {label}
            </p>
            <p className="mt-1 text-[13px] font-extrabold text-[#081529]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          href="/theorie/fehler"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] px-4 text-[9px] font-extrabold text-[#53647A]"
        >
          Fehler überprüfen
        </Link>

        <Link
          href="/theorie/pruefungssimulation"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Neue Simulation
        </Link>

        <Link
          href="/theorie/uebungen"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] px-4 text-[9px] font-extrabold text-[#53647A]"
        >
          Schwache Themen trainieren
        </Link>

        <Link
          href="/theorie"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] px-4 text-[9px] font-extrabold text-[#53647A]"
        >
          Zur Übersicht
        </Link>
      </div>
    </section>
  );
}
