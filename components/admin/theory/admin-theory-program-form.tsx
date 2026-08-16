"use client";

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
  AdminTheoryProgramView,
} from "@/types/admin-theory";

function dateInput(value: string | null): string {
  return value ?? "";
}

export function AdminTheoryProgramForm({
  program,
  onSaved,
}: {
  program?: AdminTheoryProgramView | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const editing = Boolean(program);

  const initial =
    useMemo(
      () => ({
        countryCode: program?.countryCode ?? "DE",
        licenseClassCode: program?.licenseClassCode ?? "B",
        code: program?.code ?? "",
        version: program?.version ?? "",
        status: program?.status ?? "",
        isCurrent: program?.isCurrent ?? false,
        validFrom: dateInput(program?.validFrom ?? null),
        validUntil: dateInput(program?.validUntil ?? null),
      }),
      [program],
    );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const update =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;

      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  function submit(action = "update") {
    setError("");

    startTransition(async () => {
      try {
        const response =
          await fetch(
            editing
              ? `/api/admin/theory/programs/${program!.id}`
              : "/api/admin/theory/programs",
            {
              method: editing ? "PATCH" : "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                editing
                  ? {
                      action,
                      data: form,
                    }
                  : form,
              ),
            },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryProgramView>;

        if (!response.ok || !payload.ok) {
          const message =
            !payload.ok
              ? payload.allowedValues?.length
                ? `${payload.message} Erlaubt: ${payload.allowedValues.join(", ")}`
                : payload.message
              : "Das Programm konnte nicht gespeichert werden.";
          setError(message);
          return;
        }

        router.refresh();
        onSaved?.();
      } catch {
        setError(
          "Das Programm konnte gerade nicht gespeichert werden.",
        );
      }
    });
  }

  return (
    <section className="rounded-[18px] border border-[#E1E8F2] bg-white p-5">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
          {editing ? "Programm bearbeiten" : "Neues Programm"}
        </p>
        <h2 className="mt-1 text-[18px] font-black text-[#071426]">
          Theorieprogramm
        </h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-[9px] font-extrabold text-[#52657B]">
          Land
          <input
            value={form.countryCode}
            onChange={update("countryCode")}
            maxLength={2}
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] uppercase outline-none focus:border-[#7FAEFF]"
          />
        </label>

        <label className="text-[9px] font-extrabold text-[#52657B]">
          Führerscheinklasse
          <input
            value={form.licenseClassCode}
            onChange={update("licenseClassCode")}
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] uppercase outline-none focus:border-[#7FAEFF]"
          />
        </label>

        <label className="text-[9px] font-extrabold text-[#52657B]">
          Programmcode
          <input
            value={form.code}
            onChange={update("code")}
            placeholder="DE-B-2026"
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] outline-none focus:border-[#7FAEFF]"
          />
        </label>

        <label className="text-[9px] font-extrabold text-[#52657B]">
          Version
          <input
            value={form.version}
            onChange={update("version")}
            placeholder="2026.1"
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] outline-none focus:border-[#7FAEFF]"
          />
        </label>

        <label className="text-[9px] font-extrabold text-[#52657B]">
          Gültig ab
          <input
            type="date"
            value={form.validFrom}
            onChange={update("validFrom")}
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] outline-none"
          />
        </label>

        <label className="text-[9px] font-extrabold text-[#52657B]">
          Gültig bis
          <input
            type="date"
            value={form.validUntil}
            onChange={update("validUntil")}
            className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] outline-none"
          />
        </label>

        {editing ? (
          <label className="text-[9px] font-extrabold text-[#52657B]">
            Status
            <input
              value={form.status}
              onChange={update("status")}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-[#DCE5F0] px-3 text-[11px] outline-none"
            />
          </label>
        ) : null}

        <label className="flex min-h-10 items-center gap-2 self-end rounded-xl border border-[#DCE5F0] px-3 text-[10px] font-extrabold text-[#52657B]">
          <input
            type="checkbox"
            checked={form.isCurrent}
            onChange={update("isCurrent")}
          />
          Aktuelle Programmversion
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {editing && program?.status !== "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("publish")}
            className="min-h-10 rounded-xl border border-[#BFD4F7] bg-[#F3F7FF] px-4 text-[10px] font-extrabold text-[#0B63F6] disabled:opacity-60"
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
          {pending
            ? "Speichern..."
            : editing
              ? "Änderungen speichern"
              : "Programm anlegen"}
        </button>
      </div>
    </section>
  );
}
