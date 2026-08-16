import {
  ExternalLink,
  FileText,
} from "lucide-react";

import type {
  AdminPaymentProof,
} from "@/types/admin-payments";

function fileSize(value: string | null) {
  if (!value) return "Taille inconnue";
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "Taille inconnue";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function dateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminPaymentProofCard({
  paymentId,
  proof,
}: {
  paymentId: string;
  proof: AdminPaymentProof | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
            Justificatif
          </p>
          <h2 className="text-base font-black text-slate-950">
            Preuve de paiement
          </h2>
        </div>
      </div>

      {!proof ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
          Le client n’a encore transmis aucune preuve.
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="break-all text-sm font-extrabold text-slate-900">
            {proof.originalFilename ?? "Justificatif de paiement"}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{proof.mimeType ?? "Type inconnu"}</span>
            <span>{fileSize(proof.fileSizeBytes)}</span>
            <span>Reçu : {dateTime(proof.submittedAt)}</span>
          </div>

          <a
            href={`/api/admin/payments/${paymentId}/proof`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            Voir la preuve
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}
