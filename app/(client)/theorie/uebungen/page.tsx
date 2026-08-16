/**
 * Express-Führerschein
 * Practice entry page.
 *
 * Session creation is handled by POST /api/theory/practice.
 */

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  ListChecks,
  Shuffle,
  Timer,
  XCircle,
} from "lucide-react";

import {
  TheoryPage,
} from "@/components/theory/theory-page";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

import type {
  TheoryOverviewData as TheoryClientOverviewData,
} from "@/types/theory";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export default async function TheoryPracticePage({
  searchParams,
}: {
  searchParams:
    Promise<{
      mode?:
        string;

      topic?:
        string;
    }>;
}) {
  const query =
    await searchParams;

  const data =
    await getTheoryOverviewData();

  const clientData:
    TheoryClientOverviewData =
    data;

  if (
    clientData.status !==
    "ready"
  ) {
    return (
      <TheoryPage
        data={
          clientData
        }
      />
    );
  }

  const options = [
    {
      id:
        "random",

      title:
        "Zufällige Fragen",

      description:
        "Trainiere eine zufällige Auswahl aus deinem Theorieprogramm.",

      icon:
        Shuffle,

      href:
        "/theorie/uebungen?mode=random",
    },

    {
      id:
        "errors",

      title:
        "Meine Fehler",

      description:
        "Wiederhole Fragen, die aktuell noch Aufmerksamkeit benötigen.",

      icon:
        XCircle,

      href:
        "/theorie/uebungen?mode=errors",
    },

    {
      id:
        "quick",

      title:
        "Schnelltraining",

      description:
        "Starte eine kurze Trainingseinheit mit einer kompakten Anzahl Fragen.",

      icon:
        Timer,

      href:
        "/theorie/uebungen?mode=quick",
    },

    {
      id:
        "topic",

      title:
        "Nach Thema",

      description:
        "Wähle ein bestimmtes Thema und konzentriere dein Training darauf.",

      icon:
        ListChecks,

      href:
        "/theorie",
    },
  ] as const;

  const selectedMode =
    query.mode;

  return (
    <div className="mx-auto w-full max-w-[1050px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Theorieübersicht
      </Link>

      <div className="mt-4">
        <h1 className="text-[22px] font-extrabold text-[#081529]">
          Üben
        </h1>

        <p className="mt-1 text-[11px] leading-5 text-[#66758A]">
          Wähle die Trainingsart, die zu deinem aktuellen Lernziel passt.
        </p>
      </div>

      {selectedMode ? (
        <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#DCE7F8] bg-[#F8FBFF] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63F6]" />

          <p className="text-[9px] leading-4 text-[#53647A]">
            Modus <strong>{selectedMode}</strong> ist ausgewählt. Die eigentliche Trainings-Session wird über <code className="font-mono">POST /api/theory/practice</code> erzeugt, damit Fragen und Fortschritt serverseitig kontrolliert bleiben.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {options.map(
          (
            option,
          ) => {
            const Icon =
              option.icon;

            return (
              <Link
                key={
                  option.id
                }
                href={
                  option.href
                }
                className="rounded-[16px] border border-[#E5EAF2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#CFE0FA] hover:shadow-[0_10px_28px_rgba(17,40,70,0.06)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
                  <Icon className="h-5 w-5" />
                </span>

                <h2 className="mt-4 text-[13px] font-extrabold text-[#081529]">
                  {option.title}
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#66758A]">
                  {option.description}
                </p>
              </Link>
            );
          },
        )}
      </div>
    </div>
  );
}
