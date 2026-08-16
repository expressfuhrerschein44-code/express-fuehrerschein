import {
  DocumentCard,
} from "@/components/documents/document-card";

import {
  DocumentsEmptyState,
} from "@/components/documents/documents-empty-state";

import type {
  DocumentView,
} from "@/types/documents";

export interface DocumentsListProps {
  applicationDocuments:
    readonly DocumentView[];
  userDocuments:
    readonly DocumentView[];
}

export function DocumentsList({
  applicationDocuments,
  userDocuments,
}: DocumentsListProps) {
  const hasDocuments =
    applicationDocuments.length >
      0 ||
    userDocuments.length >
      0;

  if (!hasDocuments) {
    return (
      <DocumentsEmptyState />
    );
  }

  return (
    <div className="space-y-4">
      {applicationDocuments.length ? (
        <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
              Führerscheinantrag
            </p>

            <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
              Eingereichte Antragsunterlagen
            </h2>

            <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
              Dokumente, die bereits über „Mein Führerschein“ eingereicht wurden.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {applicationDocuments.map(
              (
                document,
              ) => (
                <DocumentCard
                  key={
                    document.id
                  }
                  document={
                    document
                  }
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      {userDocuments.length ? (
        <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#6F7F94]">
              Weitere Dokumente
            </p>

            <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
              Meine weiteren Unterlagen
            </h2>

            <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
              Freigegebene, geprüfte oder noch zu prüfende Dokumente aus deinem Kundenbereich.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {userDocuments.map(
              (
                document,
              ) => (
                <DocumentCard
                  key={
                    document.id
                  }
                  document={
                    document
                  }
                />
              ),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
