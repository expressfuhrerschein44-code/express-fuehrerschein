/**
 * Express-Führerschein
 * Read-only personal information loaded from the authenticated profile.
 */

import Link from "next/link";

import {
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

import type {
  DrivingLicenseApplicationPersonalInformation,
} from "@/types/driving-license-application";

export interface PersonalInformationSectionProps {
  personalInformation:
    DrivingLicenseApplicationPersonalInformation;

  compact?:
    boolean;
}

function countryLabel(
  code:
    string,
): string {
  switch (
    code
      .trim()
      .toUpperCase()
  ) {
    case "DE":
      return "🇩🇪 Deutschland";

    case "AT":
      return "🇦🇹 Österreich";

    case "CH":
      return "🇨🇭 Schweiz";

    case "BE":
      return "🇧🇪 Belgien";

    case "ES":
      return "🇪🇸 Spanien";

    default:
      return code || "—";
  }
}

function Value({
  label,

  value,
}: {
  label:
    string;

  value:
    string | null | undefined;
}) {
  return (
    <div className="min-w-0 border-b border-[#EDF1F6] pb-2.5">
      <div className="text-[10px] font-semibold text-[#718096]">
        {
          label
        }
      </div>

      <div className="mt-1 truncate text-[12px] font-semibold text-[#142238]">
        {
          value?.trim() ||
          "—"
        }
      </div>
    </div>
  );
}

export function PersonalInformationSection({
  personalInformation,

  compact =
    false,
}: PersonalInformationSectionProps) {
  return (
    <div>
      <div
        className={
          compact
            ? "grid grid-cols-2 gap-x-4 gap-y-3"
            : "grid grid-cols-2 gap-x-7 gap-y-3 lg:grid-cols-4"
        }
      >
        <Value
          label="Vorname"
          value={
            personalInformation
              .firstName
          }
        />

        <Value
          label="Nachname"
          value={
            personalInformation
              .lastName
          }
        />

        <Value
          label="Land"
          value={
            countryLabel(
              personalInformation
                .countryCode,
            )
          }
        />

        <Value
          label="Stadt"
          value={
            personalInformation
              .city
          }
        />

        <div
          className={
            compact
              ? "col-span-2"
              : "lg:col-span-2"
          }
        >
          <Value
            label="Adresse"
            value={
              personalInformation
                .addressLine1
            }
          />
        </div>

        <Value
          label="Postleitzahl"
          value={
            personalInformation
              .postalCode
          }
        />
      </div>

      {personalInformation
        .profileComplete ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECF9F2] px-2.5 py-1 text-[10px] font-bold text-[#168A52]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Automatisch geladen
          </span>

          <Link
            href="/profil"
            className="text-[10px] font-bold text-[#0B63F6] transition hover:text-[#0750C9]"
          >
            Daten bearbeiten
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F7D7A3] bg-[#FFF9EC] px-3 py-2.5">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#7A5515]">
            <CircleAlert className="h-4 w-4" />
            Bitte vervollständige zuerst deine persönlichen Daten.
          </span>

          <Link
            href="/profil"
            className="rounded-lg bg-[#0B63F6] px-3 py-1.5 text-[10px] font-extrabold text-white"
          >
            Profil vervollständigen
          </Link>
        </div>
      )}
    </div>
  );
}
