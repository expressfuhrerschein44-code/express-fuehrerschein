import Link from "next/link";

import {
  ArrowLeft,
  BookOpenCheck,
  Brain,
  Clock3,
  GraduationCap,
  Target,
} from "lucide-react";

import type {
  AdminTheoryCandidateView,
} from "@/types/admin-theory";

function hours(seconds: number): string {
  const totalMinutes =
    Math.round(seconds / 60);
  const h =
    Math.floor(totalMinutes / 60);
  const m =
    totalMinutes % 60;

  return `${h}h ${m}m`;
}

export function AdminTheoryCandidateDetail({
  candidate,
}: {
  candidate: AdminTheoryCandidateView;
}) {
  const cards = [
    {
      label: "Prüfungsbereitschaft",
      value: `${candidate.progress.readinessScore} %`,
      icon: Target,
    },
    {
      label: "Lektionen abgeschlossen",
      value: candidate.metrics.lessonsCompleted,
      icon: BookOpenCheck,
    },
    {
      label: "Fehlerfragen",
      value: candidate.metrics.questionsNeedsReview,
      icon: Brain,
    },
    {
      label: "Simulationen bestanden",
      value: `${candidate.metrics.simulationsPassed}/${candidate.metrics.simulations}`,
      icon: GraduationCap,
    },
    {
      label: "Aktive Lernzeit",
      value: hours(candidate.metrics.activeStudySeconds),
      icon: Clock3,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-6">
      <Link
        href="/admin/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#60738A]"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Theorieverwaltung
      </Link>

      <section className="mt-4 rounded-[22px] border border-[#E1E8F2] bg-white p-5 sm:p-6">
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
          Kandidatenfortschritt
        </p>
        <h1 className="mt-1 text-[24px] font-black tracking-[-0.04em] text-[#071426]">
          {candidate.fullName}
        </h1>
        <p className="mt-1 text-[10px] font-semibold text-[#718096]">
          {candidate.email} · {candidate.countryCode} · Klasse {candidate.licenseClassCode}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-2xl border border-[#E5EBF3] bg-[#F8FAFD] p-4"
              >
                <Icon className="h-4 w-4 text-[#0B63F6]" />
                <p className="mt-2 text-[8px] font-bold text-[#718096]">
                  {card.label}
                </p>
                <p className="mt-1 text-[17px] font-black text-[#12243B]">
                  {card.value}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#E5EBF3] p-4">
            <h2 className="text-[11px] font-black text-[#12243B]">
              Lernfortschritt
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[9px]">
              <div>
                <dt className="font-bold text-[#91A0B2]">Aktueller Tag</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.currentDay ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Tage abgeschlossen</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.completedDays}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Fragen beantwortet</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.answeredQuestions}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Richtig</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.correctAnswers}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Lernzeit</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.totalStudyMinutes} Min.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Letzte Aktivität</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.progress.lastActivityAt
                    ? new Intl.DateTimeFormat("de-DE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(candidate.progress.lastActivityAt))
                    : "—"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-[#E5EBF3] p-4">
            <h2 className="text-[11px] font-black text-[#12243B]">
              Detailmetriken
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[9px]">
              <div>
                <dt className="font-bold text-[#91A0B2]">Themen begonnen</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.metrics.topicsStarted}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Lektionen begonnen</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.metrics.lessonsStarted}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Fragen mit Verlauf</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.metrics.questionRows}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#91A0B2]">Beherrschte Fragen</dt>
                <dd className="mt-1 font-black text-[#40546D]">
                  {candidate.metrics.masteredQuestions}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <p className="mt-4 text-[8px] font-semibold leading-4 text-[#91A0B2]">
          Diese Admin-Seite liest ausschließlich die realen Lern- und Prüfungsdaten des Kandidaten. Sie verändert keine Kundenergebnisse.
        </p>
      </section>
    </main>
  );
}
