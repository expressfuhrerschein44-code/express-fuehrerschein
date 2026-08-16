import Link from "next/link";

import {
  ChevronRight,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import type {
  SettingsAccountView,
} from "@/types/settings";

export interface SettingsAccountCardProps {
  account:
    SettingsAccountView;
}

function countryLabel(
  countryCode:
    string,
): string {
  switch (
    countryCode
      .trim()
      .toUpperCase()
  ) {
    case "DE":
      return "Deutschland";

    case "AT":
      return "Österreich";

    case "CH":
      return "Schweiz";

    case "BE":
      return "Belgien";

    case "ES":
      return "Spanien";

    default:
      return countryCode
        .trim()
        .toUpperCase() ||
        "—";
  }
}

export function SettingsAccountCard({
  account,
}: SettingsAccountCardProps) {
  const fullName =
    `${account.firstName} ${account.lastName}`
      .trim();

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Konto
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Kontoinformationen
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Deine persönlichen Daten werden im Profil verwaltet.
        </p>
      </div>

      <div className="mt-5 rounded-[15px] border border-[#E7ECF3] bg-[#FAFBFD] px-4">
        <div className="flex items-center gap-3 border-b border-[#EDF1F6] py-3">
          <UserRound
            className="h-4 w-4 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8794A6]">
              Name
            </p>

            <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#223248]">
              {fullName ||
                "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-[#EDF1F6] py-3">
          <Mail
            className="h-4 w-4 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8794A6]">
              E-Mail
            </p>

            <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#223248]">
              {account.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-[#EDF1F6] py-3">
          <Phone
            className="h-4 w-4 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8794A6]">
              Telefon
            </p>

            <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#223248]">
              {account.phoneE164}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 py-3">
          <MapPin
            className="h-4 w-4 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8794A6]">
              Land
            </p>

            <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#223248]">
              {countryLabel(
                account.countryCode,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          href="/profil"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[#DCE4EF] bg-white px-4 text-[9px] font-extrabold text-[#34445A] transition hover:border-[#BDD0EB] hover:bg-[#F7FAFF]"
        >
          Profil verwalten
          <ChevronRight
            className="h-3.5 w-3.5 text-[#8491A3]"
            aria-hidden="true"
          />
        </Link>

        <Link
          href="/profil"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl border border-[#DCE4EF] bg-white px-4 text-[9px] font-extrabold text-[#34445A] transition hover:border-[#BDD0EB] hover:bg-[#F7FAFF]"
        >
          <span className="inline-flex items-center gap-2">
            <LockKeyhole
              className="h-3.5 w-3.5 text-[#0B63F6]"
              aria-hidden="true"
            />
            Sicherheit
          </span>

          <ChevronRight
            className="h-3.5 w-3.5 text-[#8491A3]"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
