"use client";

import {
  CalendarDays,
  Search,
  X,
} from "lucide-react";

import type {
  AdminPraxisFilters as Filters,
  AdminPraxisStatusView,
} from "@/types/admin-praxis";

export interface AdminPraxisFiltersProps {
  filters:
    Filters;
  licenseClasses:
    string[];
  onChange:
    (
      next:
        Filters,
    ) => void;
}

const STATUS_OPTIONS: Array<{
  value:
    "all" | AdminPraxisStatusView;
  label:
    string;
}> = [
  {
    value:
      "all",
    label:
      "Alle Status",
  },
  {
    value:
      "scheduled",
    label:
      "Geplant",
  },
  {
    value:
      "confirmed",
    label:
      "Bestätigt",
  },
  {
    value:
      "cancelled",
    label:
      "Abgesagt",
  },
  {
    value:
      "completed",
    label:
      "Abgeschlossen",
  },
  {
    value:
      "other",
    label:
      "Sonstige",
  },
];

export function AdminPraxisFilters({
  filters,
  licenseClasses,
  onChange,
}: AdminPraxisFiltersProps) {
  const active =
    Boolean(
      filters.search ||
        filters.status !==
          "all" ||
        filters.licenseClass ||
        filters.period !==
          "all",
    );

  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_160px_160px_auto]">
        <label className="relative block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.1em] text-[#7B899C]">
            Suche
          </span>

          <Search
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-[#8B98A9]"
          />

          <input
            type="search"
            value={
              filters.search
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...filters,
                search:
                  event.target
                    .value,
              })
            }
            placeholder="Kunde, E-Mail, Titel, Ort..."
            className="h-11 w-full rounded-[12px] border border-[#DDE5EF] bg-[#FBFCFE] pl-10 pr-3 text-[11px] font-semibold text-[#142238] outline-none transition placeholder:text-[#9AA6B5] focus:border-[#8EB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.1em] text-[#7B899C]">
            Status
          </span>

          <select
            value={
              filters.status
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...filters,
                status:
                  event.target
                    .value as Filters["status"],
              })
            }
            className="h-11 w-full rounded-[12px] border border-[#DDE5EF] bg-[#FBFCFE] px-3 text-[11px] font-bold text-[#334155] outline-none focus:border-[#8EB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          >
            {STATUS_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.1em] text-[#7B899C]">
            Klasse
          </span>

          <select
            value={
              filters.licenseClass
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...filters,
                licenseClass:
                  event.target
                    .value,
              })
            }
            className="h-11 w-full rounded-[12px] border border-[#DDE5EF] bg-[#FBFCFE] px-3 text-[11px] font-bold text-[#334155] outline-none focus:border-[#8EB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          >
            <option value="">
              Alle Klassen
            </option>

            {licenseClasses.map(
              (
                code,
              ) => (
                <option
                  key={
                    code
                  }
                  value={
                    code
                  }
                >
                  Klasse{" "}
                  {code}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#7B899C]">
            <CalendarDays
              aria-hidden="true"
              className="h-3 w-3"
            />
            Zeitraum
          </span>

          <select
            value={
              filters.period
            }
            onChange={(
              event,
            ) =>
              onChange({
                ...filters,
                period:
                  event.target
                    .value as Filters["period"],
              })
            }
            className="h-11 w-full rounded-[12px] border border-[#DDE5EF] bg-[#FBFCFE] px-3 text-[11px] font-bold text-[#334155] outline-none focus:border-[#8EB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          >
            <option value="all">
              Alle
            </option>
            <option value="today">
              Heute
            </option>
            <option value="upcoming">
              Zukünftig
            </option>
            <option value="past">
              Vergangen
            </option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            disabled={
              !active
            }
            onClick={() =>
              onChange({
                search:
                  "",
                status:
                  "all",
                licenseClass:
                  "",
                period:
                  "all",
              })
            }
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#DDE5EF] bg-white px-3 text-[10px] font-extrabold text-[#64748B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
          >
            <X
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
            Zurücksetzen
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminPraxisFilters;
