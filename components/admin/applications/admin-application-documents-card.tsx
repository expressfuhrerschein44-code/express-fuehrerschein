import { Download, ExternalLink, FileText, Files } from "lucide-react";

import type { AdminApplicationDocument } from "@/types/admin-applications";

interface AdminApplicationDocumentsCardProps {
  documents: AdminApplicationDocument[];
}

function fileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminApplicationDocumentsCard({ documents }: AdminApplicationDocumentsCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-300">Dokumente</p>
          <h2 className="mt-1 text-base font-black text-white">Kundendokumente</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-black text-slate-400">
          <Files className="h-3.5 w-3.5" aria-hidden="true" />
          {documents.length}
        </span>
      </div>

      {documents.length ? (
        <div className="mt-5 grid gap-3">
          {documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <FileText className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-100">{document.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{document.originalFilename}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-600">{document.mimeType} · {fileSize(document.fileSizeBytes)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={document.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07] hover:text-white sm:flex-none"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Anzeigen
                </a>
                <a
                  href={document.downloadUrl}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white transition hover:bg-blue-500 sm:flex-none"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-sm font-semibold text-slate-500">
          Keine Dokumente gespeichert.
        </div>
      )}
    </section>
  );
}

export default AdminApplicationDocumentsCard;
