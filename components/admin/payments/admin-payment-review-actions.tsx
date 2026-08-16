"use client";

import {
  CheckCircle2,
  Loader2,
  PlayCircle,
  XCircle,
  Ban,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import type {
  AdminPaymentApiResponse,
  AdminPaymentDetail,
  AdminPaymentMutationAction,
} from "@/types/admin-payments";

export function AdminPaymentReviewActions({
  payment,
}: {
  payment: AdminPaymentDetail;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] =
    useState<AdminPaymentMutationAction | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(
    action: AdminPaymentMutationAction,
    actionReason?: string,
  ) {
    setPendingAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/payments/${payment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            ...(actionReason
              ? { reason: actionReason }
              : {}),
          }),
        },
      );

      const result = (await response.json().catch(() => null)) as
        | AdminPaymentApiResponse<AdminPaymentDetail>
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result && !result.ok
            ? result.message
            : "Impossible d’exécuter cette action.",
        );
      }

      setMessage(result.message);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossible d’exécuter cette action.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
          Contrôle administrateur
        </p>
        <h2 className="mt-1 text-base font-black text-slate-950">
          Actions disponibles
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {payment.status === "draft" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void mutate("activate")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-sm font-extrabold text-white transition hover:bg-[#0957D7] disabled:opacity-60"
          >
            {pendingAction === "activate" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            Activer le paiement
          </button>
        )}

        {payment.status === "proof_submitted" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void mutate("start_review")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {pendingAction === "start_review" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            Commencer la vérification
          </button>
        )}

        {payment.status === "under_review" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void mutate("confirm")}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {pendingAction === "confirm" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmer le paiement
            </button>

            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <label className="text-xs font-bold text-red-800">
                Raison du refus
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Ex. Le paiement n’a pas pu être identifié sur le compte bancaire."
                  className="mt-1.5 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>
              <button
                type="button"
                disabled={busy || reason.trim().length < 3}
                onClick={() => void mutate("reject", reason.trim())}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pendingAction === "reject" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Refuser le paiement
              </button>
            </div>
          </>
        )}

        {(payment.status === "draft" ||
          payment.status === "awaiting_payment") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const cancelReason =
                reason.trim() ||
                "Paiement annulé par l’administration.";
              void mutate("cancel", cancelReason);
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {pendingAction === "cancel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Annuler cette étape
          </button>
        )}

        {payment.status === "paid" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
            Ce paiement est confirmé et son historique financier est verrouillé.
          </div>
        )}

        {payment.status === "rejected" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Le client peut transmettre un nouveau justificatif depuis son espace paiement.
          </div>
        )}

        {payment.status === "cancelled" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Cette étape est annulée. Créez une nouvelle ligne de paiement si nécessaire.
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {message}
        </p>
      )}
    </section>
  );
}
