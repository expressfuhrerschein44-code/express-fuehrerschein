import {
  BookOpenCheck,
  BrainCircuit,
  TimerReset,
  Trophy,
} from "lucide-react";

import type {
  AdminCustomerTheorySummaryView,
} from "@/types/admin-customers";

interface AdminCustomerTheoryCardProps {
  theory: AdminCustomerTheorySummaryView;
}

function formatMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}

export function AdminCustomerTheoryCard({
  theory,
}: AdminCustomerTheoryCardProps) {
  const stats = [
    {
      label: "Préparation",
      value:
        theory.readinessScore === null
          ? "—"
          : `${theory.readinessScore}%`,
      icon: BrainCircuit,
    },
    {
      label: "Leçons terminées",
      value: theory.completedLessons.toLocaleString("fr-FR"),
      icon: BookOpenCheck,
    },
    {
      label: "Examens réussis",
      value: `${theory.passedExamAttempts}/${theory.completedExamAttempts}`,
      icon: Trophy,
    },
    {
      label: "Temps d’étude",
      value: formatMinutes(theory.totalStudyMinutes),
      icon: TimerReset,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
          Théorie
        </p>
        <h2 className="text-lg font-black text-slate-950">
          Progression d’apprentissage
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Classe principale : {theory.primaryLicenseClass ?? "—"}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-[#0B63F6]" />
              </div>
              <p className="mt-2 text-lg font-black text-slate-950">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-slate-700">
        <div className="flex justify-between gap-3">
          <span className="font-bold">Questions répondues</span>
          <span className="font-black">{theory.answeredQuestions}</span>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <span className="font-bold">Bonnes réponses</span>
          <span className="font-black">{theory.correctAnswers}</span>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <span className="font-bold">Entraînements terminés</span>
          <span className="font-black">
            {theory.completedTrainingSessions}
          </span>
        </div>
      </div>
    </section>
  );
}
