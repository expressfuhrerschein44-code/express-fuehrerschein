"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  PlayCircle,
  XCircle,
} from "lucide-react";

import { AdminApplicationStatusBadge } from "@/components/admin/applications/admin-application-status-badge";
import type {
  AdminApplicationReviewAction,
  AdminApplicationViewStatus,
} from "@/types/admin-applications";

interface AdminApplicationReviewCardProps {
  applicationId: string;
  status: AdminApplicationViewStatus;
  rejectionReason: string | null;
  reviewerName: string | null;
}

interface ReviewApiPayload {
  success?: boolean;
  message?: string;
  code?: string;
  fields?: Record<string, string>;
}

export function AdminApplicationReviewCard({
  applicationId,
  status,
  rejectionReason,
  reviewerName,
}: AdminApplicationReviewCardProps) {
  const router = useRouter();
  const [reason, setReason] = useState(rejectionReason ?? "");
  const [pendingAction, setPendingAction] = useState<AdminApplicationReviewAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDraft = status === "draft";

  async function submit(action: AdminApplicationReviewAction) {
    if (pendingAction) return;

    if (action === "reject" && reason.trim().length < 5) {
      setSuccess(null);
      setError("Bitte gib einen Ablehnungsgrund mit mindestens 5 Zeichen an.");
      return;
    }

    if (action === "approve") {
      const confirmed = window.confirm(
        "Soll dieser Führerscheinantrag administrativ bestätigt werden?",
      );
      if (!confirmed) return;
    }

    if (action === "reject") {
      const confirmed = window.confirm(
        "Soll dieser Führerscheinantrag wirklich abgelehnt werden?",
      );
      if (!confirmed) return;
    }

    setPendingAction(action);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/applications/${encodeURIComponent(applicationId)}`,
        {
          method: "PATCH",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reason: action === "reject" ? reason.trim() : null,
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as ReviewApiPayload | null;

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.fields?.reason ??
            payload?.message ??
            "Der Antrag konnte nicht aktualisiert werden.",
        );
      }

      setSuccess(payload.message ?? "Der Antrag wurde aktualisiert.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Der Antrag konnte nicht aktualisiert werden.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-300">
            <ClipboardCheck className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-300">Admin-Prüfung</p>
            <h2 className="mt-1 text-base font-black text-white">Antrag bearbeiten</h2>
            {reviewerName ? (
              <p className="mt-1 text-xs font-semibold text-slate-500">Bearbeitet von {reviewerName}</p>
            ) : null}
          </div>
        </div>
        <AdminApplicationStatusBadge status={status} />
      </div>

      {isDraft ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-4 text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-xs font-semibold leading-5">
            Dieser Antrag befindet sich noch im Entwurf. Eine administrative Entscheidung ist erst nach der Kundeneinreichung sinnvoll.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <label htmlFor="application-rejection-reason" className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
              Ablehnungsgrund
            </label>
            <textarea
              id="application-rejection-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 2000))}
              rows={4}
              placeholder="Nur erforderlich, wenn der Antrag abgelehnt wird..."
              className="mt-2 w-full resize-y rounded-xl border border-white/[0.09] bg-[#070F1D] px-3 py-3 text-sm font-medium leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
            />
            <div className="mt-1 flex justify-end text-[10px] font-semibold text-slate-600">
              {reason.length}/2000
            </div>
          </div>

          {error ? (
            <div role="alert" className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2.5 text-xs font-semibold text-rose-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-2.5 text-xs font-semibold text-emerald-300">
              {success}
            </div>
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => void submit("start_review")}
              disabled={Boolean(pendingAction) || status === "under_review"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 text-xs font-black text-blue-300 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {pendingAction === "start_review" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Prüfung starten
            </button>

            <button
              type="button"
              onClick={() => void submit("approve")}
              disabled={Boolean(pendingAction)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingAction === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Antrag bestätigen
            </button>

            <button
              type="button"
              onClick={() => void submit("reject")}
              disabled={Boolean(pendingAction)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 text-xs font-black text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingAction === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Antrag ablehnen
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminApplicationReviewCard;
