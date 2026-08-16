import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  File,
  FileImage,
  FileText,
  UploadCloud,
  XCircle,
} from "lucide-react";

import type {
  DocumentStatusView,
  DocumentView,
} from "@/types/documents";

export interface DocumentCardProps {
  document: DocumentView;
}

function statusLabel(
  status: DocumentStatusView,
  rawStatus: string,
): string {
  switch (
    status
  ) {
    case "uploaded":
      return "Hochgeladen";

    case "pending":
      return "In Prüfung";

    case "verified":
      return "Verifiziert";

    case "rejected":
      return "Abgelehnt";

    case "submitted":
      return "Eingereicht";

    case "other":
    default:
      return rawStatus ||
        "Dokument";
  }
}

function statusClasses(
  status: DocumentStatusView,
): string {
  switch (
    status
  ) {
    case "verified":
      return "border-[#BFE8D7] bg-[#F1FBF6] text-[#0C8B59]";

    case "rejected":
      return "border-[#F1CACA] bg-[#FFF5F5] text-[#C43737]";

    case "pending":
      return "border-[#F2D9A6] bg-[#FFF9EE] text-[#A66B13]";

    case "submitted":
      return "border-[#CFE0FF] bg-[#F2F7FF] text-[#0B63F6]";

    case "uploaded":
      return "border-[#D9E3F0] bg-[#F7F9FC] text-[#5F6F84]";

    case "other":
    default:
      return "border-[#DCE4EF] bg-[#F8FAFD] text-[#65758A]";
  }
}

function StatusIcon({
  status,
}: {
  status: DocumentStatusView;
}) {
  switch (
    status
  ) {
    case "verified":
      return (
        <CheckCircle2
          className="h-3 w-3"
          aria-hidden="true"
        />
      );

    case "rejected":
      return (
        <XCircle
          className="h-3 w-3"
          aria-hidden="true"
        />
      );

    case "pending":
      return (
        <Clock3
          className="h-3 w-3"
          aria-hidden="true"
        />
      );

    case "submitted":
    case "uploaded":
      return (
        <UploadCloud
          className="h-3 w-3"
          aria-hidden="true"
        />
      );

    default:
      return (
        <File
          className="h-3 w-3"
          aria-hidden="true"
        />
      );
  }
}

function documentIcon(
  mimeType: string,
) {
  if (
    mimeType.startsWith(
      "image/",
    )
  ) {
    return FileImage;
  }

  if (
    mimeType ===
    "application/pdf"
  ) {
    return FileText;
  }

  return File;
}

function formatFileSize(
  bytes: number,
): string {
  const safe =
    Math.max(
      0,
      bytes,
    );

  if (
    safe < 1024
  ) {
    return `${safe} B`;
  }

  if (
    safe <
    1024 *
      1024
  ) {
    return `${(safe / 1024).toFixed(1)} KB`;
  }

  return `${(safe / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMimeType(
  mimeType: string,
): string {
  const normalized =
    mimeType
      .trim()
      .toLowerCase();

  switch (
    normalized
  ) {
    case "application/pdf":
      return "PDF";

    case "image/jpeg":
      return "JPG";

    case "image/png":
      return "PNG";

    case "image/webp":
      return "WEBP";

    default:
      return normalized
        .split(
          "/",
        )
        .pop()
        ?.toUpperCase() ||
        "DATEI";
  }
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

export function DocumentCard({
  document,
}: DocumentCardProps) {
  const Icon =
    documentIcon(
      document.mimeType,
    );

  return (
    <article className="rounded-[17px] border border-[#E6EBF2] bg-white p-4 transition hover:border-[#D2DDEB] hover:shadow-[0_8px_22px_rgba(17,40,70,0.045)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <Icon
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-black text-[#081529]">
                {document.title}
              </h3>

              <p className="mt-1 truncate text-[8px] font-medium text-[#7B899B]">
                {document.originalFilename}
              </p>
            </div>

            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-extrabold ${statusClasses(document.status)}`}
            >
              <StatusIcon
                status={
                  document.status
                }
              />
              {statusLabel(
                document.status,
                document.rawStatus,
              )}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-bold text-[#718096]">
            <span>
              {formatMimeType(
                document.mimeType,
              )}
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              {formatFileSize(
                document.fileSizeBytes,
              )}
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span className="inline-flex items-center gap-1">
              <CalendarDays
                className="h-3 w-3"
                aria-hidden="true"
              />
              {formatDate(
                document.uploadedAt,
              )}
            </span>
          </div>

          {document.expiresOn ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#FFF9EE] px-2.5 py-1.5 text-[8px] font-bold text-[#956317]">
              <AlertTriangle
                className="h-3 w-3"
                aria-hidden="true"
              />
              Gültig bis {formatDate(document.expiresOn)}
            </div>
          ) : null}

          {document.status ===
            "rejected" &&
          document.rejectionReason ? (
            <div className="mt-3 rounded-xl border border-[#F1CACA] bg-[#FFF7F7] px-3 py-2.5">
              <p className="text-[8px] font-extrabold text-[#B53535]">
                Grund der Ablehnung
              </p>

              <p className="mt-1 whitespace-pre-line text-[8px] font-medium leading-4 text-[#8A5050]">
                {document.rejectionReason}
              </p>
            </div>
          ) : null}

          <a
            href={`/api/documents/${encodeURIComponent(document.id)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-4 text-[8px] font-extrabold text-[#0B63F6] transition hover:border-[#BDD0EB] hover:bg-[#F7FAFF]"
          >
            Ansehen
            <ExternalLink
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
}
