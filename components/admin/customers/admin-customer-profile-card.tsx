import {
  CalendarDays,
  Clock3,
  Globe2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import type {
  AdminCustomerProfileView,
} from "@/types/admin-customers";

interface AdminCustomerProfileCardProps {
  profile: AdminCustomerProfileView;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function countryLabel(code: string): string {
  try {
    return (
      new Intl.DisplayNames(["fr"], {
        type: "region",
      }).of(code.toUpperCase()) ?? code
    );
  } catch {
    return code;
  }
}

const itemClass =
  "rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3";

export function AdminCustomerProfileCard({
  profile,
}: AdminCustomerProfileCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
            Identité
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Informations du client
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <UserRound className="h-3.5 w-3.5" /> Nom complet
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {profile.fullName}
          </p>
        </div>

        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <Globe2 className="h-3.5 w-3.5" /> Pays
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {countryLabel(profile.countryCode)} ({profile.countryCode})
          </p>
        </div>

        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <Mail className="h-3.5 w-3.5" /> E-mail
          </p>
          <p className="mt-1 break-all text-sm font-extrabold text-slate-900">
            {profile.email}
          </p>
        </div>

        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <Phone className="h-3.5 w-3.5" /> Téléphone
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {profile.phone}
          </p>
        </div>

        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" /> Inscription
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {formatDate(profile.createdAt)}
          </p>
        </div>

        <div className={itemClass}>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            <Clock3 className="h-3.5 w-3.5" /> Dernière activité
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {formatDate(profile.lastSeenAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className={itemClass}>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            Langue préférée
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {profile.preferredLocale ?? "—"}
          </p>
        </div>
        <div className={itemClass}>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            Fuseau horaire
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {profile.timezone ?? "—"}
          </p>
        </div>
        <div className={itemClass}>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
            Conditions acceptées
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatDate(profile.acceptedTermsAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
