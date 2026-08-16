import { Download, ExternalLink, PenLine } from "lucide-react";

import type { AdminApplicationSignature } from "@/types/admin-applications";

interface AdminApplicationSignatureCardProps {
  signature: AdminApplicationSignature;
}

function signatureTypeLabel(value: string | null): string {
  if (!value) return "Unbekannt";
  const normalized = value.toLowerCase();
  if (normalized.includes("draw")) return "Digital gezeichnet";
  if (normalized.includes("upload")) return "Hochgeladen";
  return value;
}

export function AdminApplicationSignatureCard({ signature }: AdminApplicationSignatureCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10 text-violet-300">
          <PenLine className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-300">Unterschrift</p>
          <h2 className="mt-1 text-base font-black text-white">Kundenunterschrift</h2>
        </div>
      </div>

      {signature.available && signature.viewUrl && signature.downloadUrl ? (
        <div className="mt-5">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white">
            <iframe
              src={signature.viewUrl}
              title="Gespeicherte Kundenunterschrift"
              className="h-44 w-full bg-white"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              Typ: <span className="font-bold text-slate-300">{signatureTypeLabel(signature.type)}</span>
            </p>
            <div className="flex gap-2">
              <a
                href={signature.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Öffnen
              </a>
              <a
                href={signature.downloadUrl}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-extrabold text-white transition hover:bg-blue-500"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-sm font-semibold text-slate-500">
          Keine Unterschrift gespeichert.
        </div>
      )}
    </section>
  );
}

export default AdminApplicationSignatureCard;
