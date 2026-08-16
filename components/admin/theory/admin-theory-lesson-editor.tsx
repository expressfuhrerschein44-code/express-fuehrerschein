"use client";

import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminTheoryApiResponse,
  AdminTheoryLessonBlockInput,
  AdminTheoryLessonView,
  AdminTheoryPageData,
  AdminTheoryTranslationInput,
} from "@/types/admin-theory";

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AdminTheoryLessonEditor({
  lesson,
  pageData,
  createMode = false,
  onSaved,
}: {
  lesson?: AdminTheoryLessonView | null;
  pageData: AdminTheoryPageData;
  createMode?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const editing =
    Boolean(lesson) && !createMode;

  const translationInitial =
    useMemo<AdminTheoryTranslationInput[]>(
      () =>
        lesson?.translations?.length
          ? lesson.translations
          : [
              {
                locale: "de",
                title: "",
                description: null,
              },
            ],
      [lesson],
    );

  const blockInitial =
    useMemo<AdminTheoryLessonBlockInput[]>(
      () =>
        lesson?.contentBlocks?.map((block) => ({
          id: block.id,
          blockType: block.blockType,
          sortOrder: block.sortOrder,
          mediaStoragePath: block.mediaStoragePath,
          questionId: block.questionId,
          configJson: block.configJson,
          isActive: block.isActive,
          translations: block.translations,
        })) ?? [],
      [lesson],
    );

  const [topicId, setTopicId] =
    useState(
      lesson?.topicId ??
      pageData.topics[0]?.id ??
      "",
    );
  const [slug, setSlug] =
    useState(lesson?.slug ?? "");
  const [sortOrder, setSortOrder] =
    useState(lesson?.sortOrder ?? 0);
  const [duration, setDuration] =
    useState<string>(
      lesson?.estimatedDurationMinutes?.toString() ?? "",
    );
  const [status, setStatus] =
    useState(lesson?.status ?? "");
  const [validFrom, setValidFrom] =
    useState(lesson?.validFrom ?? "");
  const [validUntil, setValidUntil] =
    useState(lesson?.validUntil ?? "");
  const [translationsJson, setTranslationsJson] =
    useState(pretty(translationInitial));
  const [blocksJson, setBlocksJson] =
    useState(pretty(blockInitial));
  const [error, setError] =
    useState("");
  const [pending, startTransition] =
    useTransition();

  function submit(action = "update") {
    setError("");

    let translations: unknown;
    let contentBlocks: unknown;

    try {
      translations = JSON.parse(translationsJson);
      contentBlocks = JSON.parse(blocksJson);
    } catch {
      setError(
        "Übersetzungen oder Inhaltsblöcke enthalten kein gültiges JSON.",
      );
      return;
    }

    startTransition(async () => {
      const body = {
        topicId,
        slug,
        sortOrder,
        estimatedDurationMinutes:
          duration.trim() ? Number(duration) : null,
        status: editing ? status : undefined,
        validFrom: validFrom || null,
        validUntil: validUntil || null,
        translations,
        contentBlocks,
      };

      try {
        const response =
          await fetch(
            editing
              ? `/api/admin/theory/lessons/${lesson!.id}`
              : "/api/admin/theory/lessons",
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
            AdminTheoryApiResponse<AdminTheoryLessonView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.allowedValues?.length
                ? `${payload.message} Erlaubt: ${payload.allowedValues.join(", ")}`
                : payload.message
              : "Die Lektion konnte nicht gespeichert werden.",
          );
          return;
        }

        router.refresh();
        onSaved?.();
      } catch {
        setError(
          "Die Lektion konnte gerade nicht gespeichert werden.",
        );
      }
    });
  }

  return (
    <main
      className={
        createMode
          ? ""
          : "mx-auto w-full max-w-[1120px] px-4 py-6 lg:px-6"
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
          {editing ? "Lektion bearbeiten" : "Neue Lektion"}
        </p>
        <h1 className="mt-1 text-[20px] font-black text-[#071426]">
          {lesson?.title || "Theorie-Lektion"}
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-[9px] font-extrabold text-[#52657B]">
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
            Slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Reihenfolge
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px]"
            />
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Dauer (Minuten)
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
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

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <label className="block text-[9px] font-extrabold text-[#52657B]">
            Übersetzungen (JSON)
            <textarea
              value={translationsJson}
              onChange={(event) => setTranslationsJson(event.target.value)}
              rows={14}
              spellCheck={false}
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F0] p-3 font-mono text-[9px] leading-5"
            />
          </label>

          <label className="block text-[9px] font-extrabold text-[#52657B]">
            Inhaltsblöcke (JSON)
            <textarea
              value={blocksJson}
              onChange={(event) => setBlocksJson(event.target.value)}
              rows={14}
              spellCheck={false}
              className="mt-1.5 w-full rounded-xl border border-[#DCE5F0] p-3 font-mono text-[9px] leading-5"
            />
          </label>
        </div>

        <p className="mt-2 text-[8px] font-semibold leading-4 text-[#91A0B2]">
          Inhaltsblöcke werden über die vorhandenen Tabellen theory_lesson_content_blocks und deren Übersetzungen gespeichert. Beim Speichern wird die Blockliste der Lektion atomar ersetzt.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {editing && lesson?.status !== "published" ? (
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
            {pending ? "Speichern..." : editing ? "Änderungen speichern" : "Lektion anlegen"}
          </button>
        </div>
      </section>
    </main>
  );
}
