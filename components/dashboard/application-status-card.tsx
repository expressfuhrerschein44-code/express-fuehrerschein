/**
 * Express-Führerschein
 * Dashboard card for the latest driving-license application.
 *
 * The component is presentation-only:
 * - it does not query Prisma;
 * - it receives data already resolved by the dashboard server service;
 * - it reuses the shared DrivingLicenseApplication contract;
 * - it never exposes Storage paths, documents or signature data.
 */

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import type {
  DrivingLicenseApplication,
  DrivingLicenseApplicationStatus,
} from "@/types/driving-license-application";

export interface ApplicationStatusCardProps {
  application:
    DrivingLicenseApplication | null;

  href?:
    string;

  className?:
    string;
}

/* ==========================================================================
   STATUS
   ========================================================================== */

interface ApplicationStatusPresentation {
  label:
    string;

  description:
    string;

  className:
    string;

  icon:
    "clock" | "check" | "reject";
}

const STATUS_PRESENTATION:
  Record<
    DrivingLicenseApplicationStatus,
    ApplicationStatusPresentation
  > = {
  draft: {
    label:
      "Entwurf",

    description:
      "Deine Anfrage ist noch nicht vollständig eingereicht.",

    className:
      "border-[#DCE6F3] bg-[#F5F8FC] text-[#52657C]",

    icon:
      "clock",
  },

  submitted: {
    label:
      "Eingereicht",

    description:
      "Deine Anfrage wurde erfolgreich übermittelt.",

    className:
      "border-[#CFE0FF] bg-[#EEF5FF] text-[#0B63F6]",

    icon:
      "clock",
  },

  in_review: {
    label:
      "In Prüfung",

    description:
      "Unser Team prüft aktuell deine Angaben und Dokumente.",

    className:
      "border-[#FFE4B5] bg-[#FFF8E9] text-[#A9680B]",

    icon:
      "clock",
  },

  approved: {
    label:
      "Bestätigt",

    description:
      "Deine Anfrage wurde erfolgreich bestätigt.",

    className:
      "border-[#CAE9D7] bg-[#EDF9F2] text-[#168A52]",

    icon:
      "check",
  },

  rejected: {
    label:
      "Abgelehnt",

    description:
      "Deine Anfrage konnte nicht bestätigt werden.",

    className:
      "border-[#F1CECE] bg-[#FFF2F2] text-[#C64949]",

    icon:
      "reject",
  },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatMoney(
  cents:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  ).format(
    cents /
    100,
  );
}

function formatDate(
  value:
    string | null,
): string | null {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function formatClassLabel(
  application:
    DrivingLicenseApplication,
): string {
  if (
    application
      .selectedClasses
      .length ===
    0
  ) {
    return "Noch keine Klasse gewählt";
  }

  return application
    .selectedClasses
    .map(
      (
        code,
      ) =>
        `Klasse ${code}`,
    )
    .join(
      " + ",
    );
}

function StatusIcon({
  type,
}: {
  type:
    ApplicationStatusPresentation["icon"];
}) {
  switch (
    type
  ) {
    case "check":
      return (
        <CheckCircle2 className="h-3.5 w-3.5" />
      );

    case "reject":
      return (
        <XCircle className="h-3.5 w-3.5" />
      );

    default:
      return (
        <Clock3 className="h-3.5 w-3.5" />
      );
  }
}

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */

function EmptyApplicationState() {
  return (
    <div className="flex min-h-[212px] flex-col justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
            <FileText className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h2 className="text-[13px] font-black text-[#132239]">
              Mein Führerschein
            </h2>

            <p className="mt-0.5 text-[10px] text-[#718096]">
              Noch keine Führerscheinanfrage
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-[#D9E3EF] bg-[#FAFCFE] px-4 py-4">
          <p className="text-[11px] font-bold text-[#33465D]">
            Starte deine erste Anfrage.
          </p>

          <p className="mt-1 text-[10px] leading-5 text-[#718096]">
            Wähle deine Führerscheinklasse, lade deine Unterlagen hoch und sende deinen Antrag sicher ab.
          </p>
        </div>
      </div>

      <Link
        href="/mein-fuehrerschein"
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[11px] font-extrabold text-white transition hover:bg-[#0757D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6] focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" />
        Neuen Antrag starten
      </Link>
    </div>
  );
}

/* ==========================================================================
   CARD
   ========================================================================== */

export function ApplicationStatusCard({
  application,

  href =
    "/mein-fuehrerschein",

  className,
}: ApplicationStatusCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E4EAF1] bg-white p-4 shadow-[0_8px_24px_rgba(20,35,55,0.035)] sm:p-5",

        className,
      )}
    >
      {!application ? (
        <EmptyApplicationState />
      ) : (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
                <FileText className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h2 className="truncate text-[13px] font-black text-[#132239]">
                  Führerscheinantrag
                </h2>

                <p className="mt-0.5 truncate text-[10px] font-medium text-[#718096]">
                  {
                    formatClassLabel(
                      application,
                    )
                  }
                </p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold",

                STATUS_PRESENTATION[
                  application.status
                ].className,
              )}
            >
              <StatusIcon
                type={
                  STATUS_PRESENTATION[
                    application.status
                  ].icon
                }
              />

              {
                STATUS_PRESENTATION[
                  application.status
                ].label
              }
            </span>
          </div>

          <p className="mt-4 text-[10px] leading-5 text-[#65758A]">
            {
              STATUS_PRESENTATION[
                application.status
              ].description
            }
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F7F9FC] px-3 py-3">
              <div className="text-[9px] font-semibold text-[#7B899A]">
                Gesamtbetrag
              </div>

              <div className="mt-1 text-[16px] font-black text-[#0B63F6]">
                {
                  formatMoney(
                    application
                      .pricing
                      .totalCents,
                  )
                }
              </div>
            </div>

            <div className="rounded-xl bg-[#F7F9FC] px-3 py-3">
              <div className="text-[9px] font-semibold text-[#7B899A]">
                {
                  application.status ===
                  "draft"
                    ? "Zuletzt aktualisiert"
                    : "Übermittelt"
                }
              </div>

              <div className="mt-1 text-[12px] font-extrabold text-[#26384E]">
                {
                  formatDate(
                    application.status ===
                    "draft"
                      ? application
                          .updatedAt
                      : application
                          .submittedAt,
                  ) ??
                  "—"
                }
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E6ECF3] bg-[#FBFCFE] px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#168A52]" />

            <p className="min-w-0 text-[9px] leading-4 text-[#66778B]">
              Dokumente und Unterschrift werden sicher und vertraulich gespeichert.
            </p>
          </div>

          <Link
            href={
              href
            }
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white px-4 text-[11px] font-extrabold text-[#0B63F6] transition hover:border-[#BFD3F3] hover:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6] focus-visible:ring-offset-2"
          >
            {application.status ===
            "draft"
              ? "Antrag fortsetzen"
              : "Antrag ansehen"}

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

export default ApplicationStatusCard;
