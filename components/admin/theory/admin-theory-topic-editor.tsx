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
  AdminTheoryPageData,
  AdminTheoryTopicView,
  AdminTheoryTranslationInput,
} from "@/types/admin-theory";

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AdminTheoryTopicEditor({
  topic,
  pageData,
  createMode = false,
  onSaved,
}: {
  topic?: AdminTheoryTopicView | null;
  pageData: AdminTheoryPageData;
  createMode?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const editing =
    Boolean(topic) && !createMode;

  const initialTranslations =
    useMemo<AdminTheoryTranslationInput[]>(
      () =>
        topic?.translations?.length
          ? topic.translations
          : [
              {
                locale: "de",
                title: "",
                description: null,
              },
            ],
      [topic],
    );

  const [programId, setProgramId] =
    useState(
      topic?.programId ??
      pageData.programs[0]?.id ??
      "",
    );
  const [slug, setSlug] =
    useState(topic?.slug ?? "");
  const [sortOrder, setSortOrder] =
    useState(topic?.sortOrder ?? 0);
  const [isActive, setIsActive] =
    useState(topic?.isActive ?? true);
  const [translationsJson, setTranslationsJson] =
    useState(stringify(initialTranslations));
  const [error, setError] =
    useState("");
  const [pending, startTransition] =
    useTransition();

  function submit() {
    setError("");

    let translations: unknown;

    try {
      translations =
        JSON.parse(translationsJson);
    } catch {
      setError(
        "Die Übersetzungen enthalten kein gültiges JSON.",
      );
      return;
    }

    startTransition(async () => {
      try {
        const body = {
          programId,
          slug,
          sortOrder,
          isActive,
          translations,
        };

        const response =
          await fetch(
            editing
              ? `/api/admin/theory/topics/${topic!.id}`
              : "/api/admin/theory/topics",
            {
              method: editing ? "PATCH" : "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                editing ? { data: body } : body,
              ),
            },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryTopicView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.message
              : "Das Thema konnte nicht gespeichert werden.",
          );
          return;
        }

        router.refresh();
        onSaved?.();
      } catch {
        setError(
          "Das Thema konnte gerade nicht gespeichert werden.",
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
          {editing ? "Thema bearbeiten" : "Neues Thema"}
        </p>
        <h1 className="mt-1 text-[20px] font-black text-[#071426]">
          {topic?.title || "Theorie-Thema"}
        </h1>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-[9px] font-extrabold text-[#52657B]">
            Theorieprogramm
            <select
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] bg-white px-3 text-[11px]"
            >
              {pageData.programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.countryCode} · {program.licenseClassCode} · {program.code}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[9px] font-extrabold text-[#52657B]">
            Slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="persoenliche-voraussetzungen"
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

          <label className="flex min-h-10 items-center gap-2 self-end rounded-xl border border-[#DCE5F0] px-3 text-[10px] font-extrabold text-[#52657B]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Für Kunden aktiv
          </label>
        </div>

        <label className="mt-4 block text-[9px] font-extrabold text-[#52657B]">
          Übersetzungen (JSON)
          <textarea
            value={translationsJson}
            onChange={(event) => setTranslationsJson(event.target.value)}
            rows={12}
            spellCheck={false}
            className="mt-1.5 w-full rounded-xl border border-[#DCE5F0] p-3 font-mono text-[10px] leading-5 outline-none focus:border-[#7FAEFF]"
          />
        </label>

        <p className="mt-2 text-[8px] font-semibold leading-4 text-[#91A0B2]">
          Jede Sprache wird als Objekt mit locale, title und description gespeichert. Die vorhandenen Prisma-Übersetzungstabellen bleiben die einzige Datenquelle.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="min-h-10 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white disabled:opacity-60"
          >
            {pending ? "Speichern..." : editing ? "Änderungen speichern" : "Thema anlegen"}
          </button>
        </div>
      </section>
    </main>
  );
}
