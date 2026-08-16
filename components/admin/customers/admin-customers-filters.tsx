import type {
  AdminCustomersFilterOptions,
  AdminCustomersQuery,
} from "@/types/admin-customers";

interface AdminCustomersFiltersProps {
  query: AdminCustomersQuery;
  options: AdminCustomersFilterOptions;
}

function SelectField({
  name,
  label,
  value,
  values,
}: {
  name: string;
  label: string;
  value: string;
  values: string[];
}) {
  return (
    <label className="min-w-0">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">{label}</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminCustomersFilters({
  query,
  options,
}: AdminCustomersFiltersProps) {
  return (
    <form
      action="/admin/kunden"
      method="get"
      className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
    >
      <input type="hidden" name="search" value={query.search} />
      <input type="hidden" name="pageSize" value={query.pageSize} />

      <SelectField
        name="country"
        label="Tous les pays"
        value={query.country}
        values={options.countries}
      />
      <SelectField
        name="accountStatus"
        label="Tous les comptes"
        value={query.accountStatus}
        values={options.accountStatuses}
      />
      <SelectField
        name="licenseClass"
        label="Toutes les classes"
        value={query.licenseClass}
        values={options.licenseClasses}
      />
      <SelectField
        name="applicationStatus"
        label="Tous les dossiers"
        value={query.applicationStatus}
        values={options.applicationStatuses}
      />

      <button
        type="submit"
        className="h-11 rounded-xl border border-slate-200 bg-slate-950 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800"
      >
        Filtrer
      </button>
    </form>
  );
}
