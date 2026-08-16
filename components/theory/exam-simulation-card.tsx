"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import type {
  TheoryExamRuleView,
} from "@/types/theory";

export interface ExamSimulationCardProps {
  rules?: readonly TheoryExamRuleView[];
  available?: boolean;
}

export function ExamSimulationCard({
  rules = [],
  available = true,
}: ExamSimulationCardProps) {
  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-extrabold text-[#081529]">
            Prüfungssimulation
          </h2>

          <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
            Teste dein Wissen unter realistischen Prüfungsbedingungen.
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <ClipboardCheck className="h-5 w-5" />
        </span>
      </div>

      {rules.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rules.map((rule) => (
            <li
              key={`${rule.label}-${rule.value}`}
              className="flex items-center gap-2 text-[9px] text-[#56677E]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0B63F6]" />
              <span className="font-semibold">
                {rule.label}:
              </span>
              <span>{rule.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[9px] leading-4 text-[#7A899C]">
          Die gültigen Prüfungsregeln werden aus deiner Länder- und Führerscheinklassen-Konfiguration geladen.
        </p>
      )}

      <Link
        href="/theorie/pruefungssimulation"
        aria-disabled={!available}
        className={`mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-lg px-3 text-[10px] font-extrabold transition ${
          available
            ? "bg-[#0B63F6] text-white hover:bg-[#0958DC]"
            : "pointer-events-none bg-[#E9EEF5] text-[#8A98AA]"
        }`}
      >
        Simulation starten
      </Link>
    </article>
  );
}
