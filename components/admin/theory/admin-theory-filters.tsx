"use client";

import {
  Search,
  X,
} from "lucide-react";

export interface AdminTheoryFilterState {
  search: string;
  country: string;
  licenseClass: string;
  status: string;
}

export function AdminTheoryFilters({
  value,
  onChange,
  countries,
  licenseClasses,
  statuses,
}: {
  value: AdminTheoryFilterState;
  onChange: (value: AdminTheoryFilterState) => void;
  countries: string[];
  licenseClasses: string[];
  statuses: string[];
}) {
  const update =
    (key: keyof AdminTheoryFilterState) =>
    (
      event:
        React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement
        >,
    ) => {
      onChange({
        ...value,
        [key]: event.target.value,
      });
    };

  const active =
    Boolean(
      value.search ||
      value.country ||
      value.licenseClass ||
      value.status,
    );

  return (
    <section className="grid gap-3 rounded-[18px] border border-[#E1E8F2] bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_150px_150px_160px_auto]">
      <label className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA8B8]"
          aria-hidden="true"
        />
        <input
          value={value.search}
          onChange={update("search")}
          placeholder="Suchen..."
          className="min-h-10 w-full rounded-xl border border-[#DCE5F0] bg-white pl-10 pr-3 text-[11px] font-semibold text-[#24364D] outline-none focus:border-[#7FAEFF]"
        />
      </label>

      <select
        value={value.country}
        onChange={update("country")}
        className="min-h-10 rounded-xl border border-[#DCE5F0] bg-white px-3 text-[11px] font-semibold text-[#52657B] outline-none"
      >
        <option value="">Alle Länder</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        value={value.licenseClass}
        onChange={update("licenseClass")}
        className="min-h-10 rounded-xl border border-[#DCE5F0] bg-white px-3 text-[11px] font-semibold text-[#52657B] outline-none"
      >
        <option value="">Alle Klassen</option>
        {licenseClasses.map((licenseClass) => (
          <option
            key={licenseClass}
            value={licenseClass}
          >
            Klasse {licenseClass}
          </option>
        ))}
      </select>

      <select
        value={value.status}
        onChange={update("status")}
        className="min-h-10 rounded-xl border border-[#DCE5F0] bg-white px-3 text-[11px] font-semibold text-[#52657B] outline-none"
      >
        <option value="">Alle Status</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={!active}
        onClick={() =>
          onChange({
            search: "",
            country: "",
            licenseClass: "",
            status: "",
          })
        }
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#DCE5F0] px-3 text-[10px] font-extrabold text-[#708096] disabled:opacity-40"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Zurücksetzen
      </button>
    </section>
  );
}
