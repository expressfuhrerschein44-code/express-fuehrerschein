import {
  AlertCircle,
} from "lucide-react";

import {
  DocumentsHeader,
} from "@/components/documents/documents-header";

import {
  DocumentsList,
} from "@/components/documents/documents-list";

import {
  DocumentsOverview,
} from "@/components/documents/documents-overview";

import type {
  DocumentsPageData,
} from "@/types/documents";

export interface DocumentsPageProps {
  data: DocumentsPageData;
}

export function DocumentsPage({
  data,
}: DocumentsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <DocumentsHeader
        status={
          data.status
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />

      <div className="mt-4">
        <DocumentsOverview
          overview={
            data.overview
          }
        />
      </div>

      {data.status ===
      "no_active_license_class" ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1D6A6] bg-[#FFF9EE] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
            Aktuell ist keine aktive Führerscheinklasse hinterlegt. Bereits vorhandene Dokumente bleiben trotzdem sichtbar.
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        <DocumentsList
          applicationDocuments={
            data.applicationDocuments
          }
          userDocuments={
            data.userDocuments
          }
        />
      </div>
    </main>
  );
}
