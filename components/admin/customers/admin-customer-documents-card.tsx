import {
  FileText,
  Files,
} from "lucide-react";

import type {
  AdminCustomerDocumentView,
} from "@/types/admin-customers";

interface AdminCustomerDocumentsCardProps {
  documents: AdminCustomerDocumentView[];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function AdminCustomerDocumentsCard({
  documents,
}: AdminCustomerDocumentsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <Files className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">
            Documents
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Fichiers du client et des demandes
          </h2>
        </div>
      </div>

      {documents.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Aucun document enregistré.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
                <th className="pb-3">Document</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Taille</th>
                <th className="pb-3 text-right">Ajouté</th>
              </tr>
            </thead>
            <tbody>
              {documents.slice(0, 30).map((document) => (
                <tr
                  key={`${document.source}-${document.id}`}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="max-w-72 truncate text-sm font-extrabold text-slate-900">
                          {document.title ?? document.filename}
                        </p>
                        <p className="max-w-72 truncate text-[11px] text-slate-400">
                          {document.type} • {document.mimeType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-slate-600">
                    {document.source === "application"
                      ? "Demande"
                      : "Espace client"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">
                      {document.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-slate-600">
                    {fileSize(document.fileSizeBytes)}
                  </td>
                  <td className="py-3 text-right text-xs font-semibold text-slate-500">
                    {formatDate(document.uploadedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
