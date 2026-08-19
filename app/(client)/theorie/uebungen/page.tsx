/**
 * Express-Führerschein
 * Practice entry page.
 *
 * Practice sessions are created server-side through POST /api/theory/practice.
 */

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ListChecks,
  Shuffle,
  Timer,
  XCircle,
} from "lucide-react";

import {
  PracticeRunner,
} from "@/components/theory/practice/practice-runner";

import {
  TheoryPage,
} from "@/components/theory/theory-page";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

import type {
  TheoryOverviewData as TheoryClientOverviewData,
  TheoryPracticeSessionView,
} from "@/types/theory";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

function practiceMode(
  value: string | undefined,
): TheoryPracticeSessionView["mode"] | null {
  switch (value) {
    case "random":
    case "errors":
    case "quick":
    case "topic":
      return value;
    default:
      return null;
  }
}

export default async function TheoryPracticePage({
  searchParams,
}: {
  searchParams:
    Promise<{
      mode?: string;
      topic?: string;
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

  const selectedMode =
    practiceMode(
      query.mode,
    );

  const requestedTopicId =
    query.topic?.trim() ||
    null;

  const selectedTopic =
    requestedTopicId
      ? clientData.topics.find(
          (topic) =>
            topic.id ===
            requestedTopicId,
        ) ?? null
      : null;

  const options = [
    {
      id: "random",
      title:
        "Zufällige Fragen",
      description:
        "Trainiere eine zufällige Auswahl aus deinem Theorieprogramm.",
      icon: Shuffle,
      href:
        "/theorie/uebungen?mode=random",
    },
    {
      id: "errors",
      title:
        "Meine Fehler",
      description:
        "Wiederhole Fragen, die aktuell noch Aufmerksamkeit benötigen.",
      icon: XCircle,
      href:
        "/theorie/uebungen?mode=errors",
    },
    {
      id: "quick",
      title:
        "Schnelltraining",
      description:
        "Starte eine kurze Trainingseinheit mit einer kompakten Anzahl Fragen.",
      icon: Timer,
      href:
        "/theorie/uebungen?mode=quick",
    },
    {
      id: "topic",
      title:
        "Nach Thema",
      description:
        "Wähle ein bestimmtes Thema und konzentriere dein Training darauf.",
      icon: ListChecks,
      href:
        "/theorie/uebungen?mode=topic",
    },
  ] as const;

  const showRunner =
    Boolean(
      selectedMode &&
      (
        selectedMode !==
          "topic" ||
        selectedTopic
      ),
    );

  return (
    <div className="mx-auto w-full max-w-[1050px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href={
          selectedMode
            ? "/theorie/uebungen"
            : "/theorie"
        }
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {selectedMode
          ? "Zur Übungsauswahl"
          : "Theorieübersicht"}
      </Link>

      <div className="mt-4">
        <h1 className="text-[22px] font-extrabold text-[#081529]">
          Üben
        </h1>

        <p className="mt-1 text-[11px] leading-5 text-[#66758A]">
          {selectedMode ===
          "topic"
            ? selectedTopic
              ? `Themen-Training: ${selectedTopic.title}`
              : "Wähle ein Thema für dein Training."
            : selectedMode
              ? "Deine Trainings-Session wird mit deinem aktuellen Theorieprogramm gestartet."
              : "Wähle die Trainingsart, die zu deinem aktuellen Lernziel passt."}
        </p>
      </div>

      {query.mode &&
      !selectedMode ? (
        <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#F2C7C7] bg-[#FFF8F8] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D93B3B]" />
          <p className="text-[9px] leading-4 text-[#8C4A4A]">
            Dieser Trainingsmodus ist nicht verfügbar. Wähle bitte eine der angebotenen Übungen.
          </p>
        </div>
      ) : null}

      {selectedMode ===
        "topic" &&
      requestedTopicId &&
      !selectedTopic ? (
        <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#F2C7C7] bg-[#FFF8F8] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D93B3B]" />
          <p className="text-[9px] leading-4 text-[#8C4A4A]">
            Das gewählte Thema gehört nicht zu deinem aktuellen Theorieprogramm.
          </p>
        </div>
      ) : null}

      {showRunner &&
      selectedMode ? (
        <PracticeRunner
          key={`${selectedMode}:${selectedTopic?.id ?? ""}`}
          mode={
            selectedMode
          }
          topicId={
            selectedTopic?.id ??
            null
          }
          topicTitle={
            selectedTopic?.title ??
            null
          }
        />
      ) : selectedMode ===
          "topic" ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {clientData.topics.map(
            (topic) => (
              <Link
                key={
                  topic.id
                }
                href={`/theorie/uebungen?mode=topic&topic=${encodeURIComponent(
                  topic.id,
                )}`}
                className="group flex items-center gap-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#CFE0FA] hover:shadow-[0_10px_28px_rgba(17,40,70,0.06)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
                  <ListChecks className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-extrabold text-[#081529]">
                    {topic.title}
                  </span>

                  <span className="mt-0.5 block text-[9px] text-[#66758A]">
                    {topic.totalQuestions} Fragen · {topic.progressPercent}% Fortschritt
                  </span>
                </span>

                <ChevronRight className="h-4 w-4 shrink-0 text-[#9AA8B9] transition group-hover:translate-x-0.5 group-hover:text-[#0B63F6]" />
              </Link>
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {options.map(
            (option) => {
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
      )}
    </div>
  );
}
