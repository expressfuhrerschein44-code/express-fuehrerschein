import type {
  AdminPaymentBankDetails,
} from "@/types/admin-payments";

export function AdminPaymentBankDetailsForm({
  initialValue,
}: {
  initialValue?: Partial<AdminPaymentBankDetails> | null;
}) {
  const fieldClass =
    "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <legend className="px-2 text-xs font-black uppercase tracking-[0.08em] text-slate-700">
        Coordonnées bancaires
      </legend>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-bold text-slate-600">
          Titulaire du compte
          <input
            name="accountHolder"
            defaultValue={initialValue?.accountHolder ?? ""}
            maxLength={160}
            autoComplete="off"
            className={fieldClass}
            placeholder="Express-Führerschein GmbH"
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          Banque
          <input
            name="bankName"
            defaultValue={initialValue?.bankName ?? ""}
            maxLength={160}
            autoComplete="off"
            className={fieldClass}
            placeholder="Nom de la banque"
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          IBAN
          <input
            name="iban"
            defaultValue={initialValue?.iban ?? ""}
            maxLength={64}
            autoComplete="off"
            className={fieldClass}
            placeholder="DE00 0000 0000 0000 0000 00"
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          BIC
          <input
            name="bic"
            defaultValue={initialValue?.bic ?? ""}
            maxLength={16}
            autoComplete="off"
            className={fieldClass}
            placeholder="XXXXXXXXXXX"
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          Pays
          <input
            name="bankCountry"
            defaultValue={initialValue?.country ?? "Deutschland"}
            maxLength={80}
            autoComplete="off"
            className={fieldClass}
          />
        </label>

        <label className="text-xs font-bold text-slate-600">
          Référence de virement
          <input
            name="bankReference"
            defaultValue={initialValue?.reference ?? ""}
            maxLength={128}
            autoComplete="off"
            className={fieldClass}
            placeholder="Laisser vide pour génération automatique"
          />
        </label>
      </div>

      <label className="mt-4 block text-xs font-bold text-slate-600">
        Instructions au client
        <textarea
          name="bankInstructions"
          defaultValue={initialValue?.instructions ?? ""}
          maxLength={2000}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Bitte den Verwendungszweck vollständig angeben."
        />
      </label>
    </fieldset>
  );
}
