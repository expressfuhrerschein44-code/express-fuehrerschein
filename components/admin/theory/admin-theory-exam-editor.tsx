"use client";

import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminTheoryApiResponse,
  AdminTheoryExamView,
  AdminTheoryPageData,
} from "@/types/admin-theory";

export function AdminTheoryExamEditor({
  exam,
  pageData,
  createMode = false,
  onSaved,
}: {
  exam?: AdminTheoryExamView | null;
  pageData: AdminTheoryPageData;
  createMode?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const editing =
    Boolean(exam) && !createMode;

  const [programId, setProgramId] =
    useState(
      exam?.programId ??
      pageData.programs[0]?.id ??
      "",
    );
  const [version, setVersion] =
    useState(exam?.version ?? "");
  const [questionCount, setQuestionCount] =
    useState(exam?.questionCount ?? 30);
  const [durationSeconds, setDurationSeconds] =
    useState(exam?.durationSeconds ?? 1800);
  const [scoringMethod, setScoringMethod] =
    useState(exam?.scoringMethod ?? "penalty_points");
  const [passingRuleJson, setPassingRuleJson] =
    useState(
      JSON.stringify(
        exam?.passingRule ?? {
          maxPenaltyPoints: 10,
        },
        null,
        2,
      ),
    );
  const [status, setStatus] =
    useState(exam?.status ?? "");
  const [activeFrom, setActiveFrom] =
    useState(exam?.activeFrom ?? "");
  const [activeUntil, setActiveUntil] =
    useState(exam?.activeUntil ?? "");
  const [error, setError] =
    useState("");
  const [pending, startTransition] =
    useTransition();

  function submit(action = "update") {
    setError("");

    let passingRule: unknown;

    try {
      passingRule = JSON.parse(passingRuleJson);
    } catch {
      setError(
        "Die Bestehensregel enthält kein gültiges JSON.",
      );
      return;
    }

    startTransition(async () => {
      const body = {
        programId,
        version,
        questionCount,
        durationSeconds,
        scoringMethod,
        passingRule,
        status: editing ? status : undefined,
        activeFrom: activeFrom || null,
        activeUntil: activeUntil || null,
      };

      try {
        const response =
          await fetch(
            editing
              ? `/api/admin/theory/exams/${exam!.id}`
              : "/api/admin/theory/exams",
            {
              method: editing ? "PATCH" : "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                editing
                  ? {
                      action,
                      data: body,
                    }
                  : body,
              ),
            },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryExamView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.allowedValues?.length
                ? `${payload.message} Erlaubt: ${payload.allowedValues.join(", ")}`
                : payload.message
              : "Die Prüfung konnte nicht gespeichert werden.",
          );
          return;
        }

        router.refresh();
        onSaved?.();
      } catch {
        setError(
          "Die Prüfung konnte gerade nicht gespeichert werden.",
        );
      }
    });
  }

  return (
    <main
      className={
        createMode
          ? ""
          : "mx-auto w-full max-w-[1080px] px-4 py-6 lg:px-6"
      }
    >
      {!createMode ? (
        <Link
          href="/admin/theorie"
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#60738A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Theorieverwaltung
        </Link>
      ) : null}

      <section className={[
        "rounded-[18px] border border-[#E1E8F2] bg-white p-5",
        createMode ? "" : "mt-4",
      ].join(" ")}>
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
          {editing ? "Prüfung bearbeiten" : "Neue Prüfung"}
        </p>
        <h1 className="mt-1 text-[20px] font-black text-[#071426]">
          Prüfungskonfiguration
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-[9px] font-extrabold text-[#52657B] lg:col-span-2">
            Theorieprogramm
            <select
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 text-[10px]"
            >
              {pageData.programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.countryCode} · Klasse {program.licenseClassCode} · {program.code}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Version
            <input
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Fragenanzahl
            <input
              type="number"
              min={1}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Dauer (Sekunden)
            <input
              type="number"
              min={60}
              value={durationSeconds}
              onChange={(event) => setDurationSeconds(Number(event.target.value))}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Bewertungsmethode
            <input
              value={scoringMethod}
              onChange={(event) => setScoringMethod(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          {editing ? (
            <label className="text-[9px] font-extrabold text-[#52657B]">
              Status
              <input
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
              />
            </label>
          ) : null}

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Aktiv ab
            <input
              type="date"
              value={activeFrom}
              onChange={(event) => setActiveFrom(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Aktiv bis
            <input
              type="date"
              value={activeUntil}
              onChange={(event) => setActiveUntil(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>
        </div>

        <label className="mt-4 block text-[9px] font-extrabold text-[#52657B]">
          Bestehensregel (JSON)
          <textarea
            value={passingRuleJson}
            onChange={(event) => setPassingRuleJson(event.target.value)}
            rows={10}
            spellCheck={false}
            className="mt-1.5 w-full rounded-xl border border-[#DCE5F0] p-3 font-mono text-[10px] leading-5"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {editing && exam?.status !== "published" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("publish")}
              className="min-h-10 rounded-xl border border-[#BFD4F7] bg-[#F3F7FF] px-4 text-[10px] font-extrabold text-[#0B63F6]"
            >
              Veröffentlichen
            </button>
          ) : null}

          <button
            type="button"
            disabled={pending}
            onClick={() => submit("update")}
            className="min-h-10 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white disabled:opacity-60"
          >
            {pending ? "Speichern..." : editing ? "Änderungen speichern" : "Prüfung anlegen"}
          </button>
        </div>
      </section>
    </main>
  );
}
