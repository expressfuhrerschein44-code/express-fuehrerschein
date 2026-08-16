"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryApiResponse,
  AdminTheoryReportView,
} from "@/types/admin-theory";

export function AdminTheoryReportsTable({
  reports,
}: {
  reports: AdminTheoryReportView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Gemeldete Theoriefragen
        </h2>
      </div>

      <div className="divide-y divide-[#EDF1F6]">
        {reports.length === 0 ? (
          <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
            Keine Meldungen vorhanden.
          </p>
        ) : reports.map((report) => (
          <div
            key={report.id}
            className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_160px_140px_auto] lg:items-center"
          >
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#0B63F6]">
                {report.reason} · {report.question.topicTitle}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] font-black text-[#12243B]">
                {report.question.prompt}
              </p>
              <p className="mt-1 text-[8px] font-semibold text-[#91A0B2]">
                {report.candidate.fullName} · Klasse {report.candidate.licenseClassCode}
              </p>
            </div>

            <span className="text-[9px] font-semibold text-[#62748A]">
              {new Intl.DateTimeFormat("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(new Date(report.createdAt))}
            </span>

            <AdminTheoryStatusBadge status={report.status} />

            <Link
              href={`/admin/theorie/meldungen/${report.id}`}
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#DCE5F0] px-3 text-[9px] font-extrabold text-[#0B63F6]"
            >
              Öffnen
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminTheoryReportDetail({
  report,
}: {
  report: AdminTheoryReportView;
}) {
  const router = useRouter();
  const [error, setError] =
    useState("");
  const [pending, startTransition] =
    useTransition();

  function resolveReport() {
    setError("");

    startTransition(async () => {
      try {
        const response =
          await fetch(
            `/api/admin/theory/reports/${report.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "resolve",
              }),
            },
          );

        const payload =
          await response.json() as
            AdminTheoryApiResponse<AdminTheoryReportView>;

        if (!response.ok || !payload.ok) {
          setError(
            !payload.ok
              ? payload.allowedValues?.length
                ? `${payload.message} Erlaubt: ${payload.allowedValues.join(", ")}`
                : payload.message
              : "Die Meldung konnte nicht abgeschlossen werden.",
          );
          return;
        }

        router.refresh();
      } catch {
        setError(
          "Die Meldung konnte gerade nicht abgeschlossen werden.",
        );
      }
    });
  }

  const alreadyResolved =
    Boolean(report.resolvedAt) ||
    report.status === "resolved" ||
    report.status === "closed";

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-6 lg:px-6">
      <Link
        href="/admin/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#60738A]"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Theorieverwaltung
      </Link>

      <section className="mt-4 rounded-[20px] border border-[#E1E8F2] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
              Frage-Meldung
            </p>
            <h1 className="mt-1 text-[22px] font-black text-[#071426]">
              {report.reason}
            </h1>
          </div>
          <AdminTheoryStatusBadge status={report.status} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#E5EBF3] bg-[#F8FAFD] p-4">
            <p className="text-[9px] font-black text-[#718096]">
              Frage
            </p>
            <p className="mt-2 text-[12px] font-black leading-5 text-[#12243B]">
              {report.question.prompt}
            </p>
            <p className="mt-2 text-[9px] font-semibold text-[#718096]">
              Thema: {report.question.topicTitle}
            </p>
            <Link
              href={`/admin/theorie/fragen/${report.question.id}`}
              className="mt-3 inline-flex text-[9px] font-extrabold text-[#0B63F6]"
            >
              Frage öffnen
            </Link>
          </article>

          <article className="rounded-2xl border border-[#E5EBF3] bg-[#F8FAFD] p-4">
            <p className="text-[9px] font-black text-[#718096]">
              Kandidat
            </p>
            <p className="mt-2 text-[12px] font-black text-[#12243B]">
              {report.candidate.fullName}
            </p>
            <p className="mt-1 text-[9px] font-semibold text-[#718096]">
              {report.candidate.email}
            </p>
            <p className="mt-1 text-[9px] font-semibold text-[#718096]">
              Klasse {report.candidate.licenseClassCode}
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-[#E5EBF3] p-4">
          <p className="text-[9px] font-black text-[#718096]">
            Nachricht des Kandidaten
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[11px] font-medium leading-5 text-[#40546D]">
            {report.message || "Keine zusätzliche Nachricht."}
          </p>
        </article>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {!alreadyResolved ? (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={resolveReport}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {pending ? "Wird abgeschlossen..." : "Als erledigt markieren"}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
