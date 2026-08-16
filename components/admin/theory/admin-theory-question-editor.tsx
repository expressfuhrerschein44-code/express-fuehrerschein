"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Trash2,
} from "lucide-react";

import {
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminTheoryApiResponse,
  AdminTheoryPageData,
  AdminTheoryQuestionTranslationInput,
  AdminTheoryQuestionView,
} from "@/types/admin-theory";

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AdminTheoryQuestionEditor({
  question,
  pageData,
  createMode = false,
  onSaved,
}: {
  question?: AdminTheoryQuestionView | null;
  pageData: AdminTheoryPageData;
  createMode?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const editing =
    Boolean(question) && !createMode;

  const translationInitial =
    useMemo<AdminTheoryQuestionTranslationInput[]>(
      () =>
        question?.translations?.length
          ? question.translations
          : [
              {
                locale: "de",
                prompt: "",
                explanation: null,
                answerOptions: [
                  { id: "a", text: "" },
                  { id: "b", text: "" },
                  { id: "c", text: "" },
                ],
                correctAnswer: null,
              },
            ],
      [question],
    );

  const [topicId, setTopicId] =
    useState(
      question?.topicId ??
      pageData.topics[0]?.id ??
      "",
    );
  const [externalRef, setExternalRef] =
    useState(question?.externalRef ?? "");
  const [questionType, setQuestionType] =
    useState(question?.questionType ?? "single_choice");
  const [penaltyPoints, setPenaltyPoints] =
    useState(question?.penaltyPoints ?? 0);
  const [difficulty, setDifficulty] =
    useState(question?.difficulty ?? "standard");
  const [status, setStatus] =
    useState(question?.status ?? "");
  const [isActive, setIsActive] =
    useState(question?.isActive ?? false);
  const [validFrom, setValidFrom] =
    useState(question?.validFrom ?? "");
  const [validUntil, setValidUntil] =
    useState(question?.validUntil ?? "");
  const [translationsJson, setTranslationsJson] =
    useState(pretty(translationInitial));
  const [error, setError] =
    useState("");
  const [pending, startTransition] =
    useTransition();
  const [mediaPending, startMediaTransition] =
    useTransition();

  function submit(action = "update") {
    setError("");

    let translations: unknown;

    try {
      translations = JSON.parse(translationsJson);
    } catch {
      setError(
        "Die Frageübersetzungen enthalten kein gültiges JSON.",
      );
      return;
    }

    startTransition(async () => {
      const body = {
        topicId,
        externalRef: externalRef.trim() || null,
        questionType,
        penaltyPoints,
        difficulty,
        status: editing ? status : undefined,
        isActive,
        validFrom: validFrom || null,
        validUntil: validUntil || null,
        translations,
      };

      try {
        const response =
          await fetch(
            editing
              ? `/api/admin/theory/questions/${question!.id}`
              : "/api/admin/theory/questions",
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
            AdminTheoryApiResponse<AdminTheoryQuestionView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.allowedValues?.length
                ? `${payload.message} Erlaubt: ${payload.allowedValues.join(", ")}`
                : payload.message
              : "Die Frage konnte nicht gespeichert werden.",
          );
          return;
        }

        router.refresh();
        onSaved?.();
      } catch {
        setError(
          "Die Frage konnte gerade nicht gespeichert werden.",
        );
      }
    });
  }

  function uploadMedia() {
    const file =
      fileRef.current?.files?.[0];

    if (!file || !question) return;

    setError("");

    startMediaTransition(async () => {
      try {
        const form = new FormData();
        form.set("file", file);

        const response =
          await fetch(
            `/api/admin/theory/media/${question.id}`,
            {
              method: "POST",
              body: form,
            },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryQuestionView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.message
              : "Das Medium konnte nicht gespeichert werden.",
          );
          return;
        }

        if (fileRef.current) {
          fileRef.current.value = "";
        }

        router.refresh();
      } catch {
        setError(
          "Das Medium konnte gerade nicht gespeichert werden.",
        );
      }
    });
  }

  function deleteMedia() {
    if (!question?.mediaStoragePath) return;

    startMediaTransition(async () => {
      try {
        const response =
          await fetch(
            `/api/admin/theory/media/${question.id}`,
            { method: "DELETE" },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryQuestionView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.message
              : "Das Medium konnte nicht entfernt werden.",
          );
          return;
        }

        router.refresh();
      } catch {
        setError(
          "Das Medium konnte gerade nicht entfernt werden.",
        );
      }
    });
  }

  function openMedia() {
    if (!question?.mediaStoragePath) return;

    startMediaTransition(async () => {
      try {
        const response =
          await fetch(
            `/api/admin/theory/media/${question.id}`,
            { cache: "no-store" },
          );

        const payload =
          await response.json() as {
            ok: boolean;
            data?: { url?: string };
            message?: string;
          };

        if (!response.ok || !payload.ok || !payload.data?.url) {
          setError(
            payload.message ??
            "Das Medium konnte nicht geöffnet werden.",
          );
          return;
        }

        window.open(
          payload.data.url,
          "_blank",
          "noopener,noreferrer",
        );
      } catch {
        setError(
          "Das Medium konnte gerade nicht geöffnet werden.",
        );
      }
    });
  }

  return (
    <main
      className={
        createMode
          ? ""
          : "mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-6"
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
          {editing ? "Frage bearbeiten" : "Neue Frage"}
        </p>
        <h1 className="mt-1 line-clamp-2 text-[20px] font-black text-[#071426]">
          {question?.prompt || "Theoriefrage"}
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[9px] font-extrabold text-[#52657B] lg:col-span-2">
            Thema
            <select
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 text-[10px]"
            >
              {pageData.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.countryCode} · {topic.licenseClassCode} · {topic.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Externe Referenz
            <input
              value={externalRef}
              onChange={(event) => setExternalRef(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Fragetyp
            <input
              value={questionType}
              onChange={(event) => setQuestionType(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Fehlerpunkte
            <input
              type="number"
              min={0}
              value={penaltyPoints}
              onChange={(event) => setPenaltyPoints(Number(event.target.value))}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Schwierigkeit
            <input
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
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

          <label className="flex min-h-10 items-center gap-2 self-end rounded-xl border border-[#DCE5F0] px-3 text-[10px] font-extrabold text-[#52657B]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Für Kunden aktiv
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Gültig ab
            <input
              type="date"
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Gültig bis
            <input
              type="date"
              value={validUntil}
              onChange={(event) => setValidUntil(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>
        </div>

        <label className="mt-4 block text-[9px] font-extrabold text-[#52657B]">
          Übersetzungen, Antworten und Lösung (JSON)
          <textarea
            value={translationsJson}
            onChange={(event) => setTranslationsJson(event.target.value)}
            rows={18}
            spellCheck={false}
            className="mt-1.5 w-full rounded-xl border border-[#DCE5F0] p-3 font-mono text-[9px] leading-5"
          />
        </label>

        {editing ? (
          <section className="mt-4 rounded-2xl border border-[#E4EAF2] bg-[#F8FAFD] p-4">
            <p className="text-[10px] font-black text-[#12243B]">
              Frage-Medium
            </p>
            <p className="mt-1 break-all text-[8px] font-semibold text-[#91A0B2]">
              {question?.mediaStoragePath || "Kein Medium hinterlegt"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                className="max-w-full text-[9px] font-semibold text-[#52657B]"
              />

              <button
                type="button"
                disabled={mediaPending}
                onClick={uploadMedia}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0B63F6] px-3 text-[9px] font-extrabold text-white"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Hochladen
              </button>

              {question?.mediaStoragePath ? (
                <>
                  <button
                    type="button"
                    disabled={mediaPending}
                    onClick={openMedia}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE5F0] bg-white px-3 text-[9px] font-extrabold text-[#52657B]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Sicher öffnen
                  </button>

                  <button
                    type="button"
                    disabled={mediaPending}
                    onClick={deleteMedia}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[9px] font-extrabold text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Entfernen
                  </button>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {editing && question?.isActive ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("deactivate")}
              className="min-h-10 rounded-xl border border-[#DCE5F0] bg-white px-4 text-[10px] font-extrabold text-[#61748B]"
            >
              Deaktivieren
            </button>
          ) : null}

          {editing &&
          (question?.status !== "published" || !question?.isActive) ? (
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
            {pending ? "Speichern..." : editing ? "Änderungen speichern" : "Frage anlegen"}
          </button>
        </div>
      </section>
    </main>
  );
}
