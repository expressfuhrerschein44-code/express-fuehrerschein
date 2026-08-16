import Link from "next/link";

import {
  CreditCard,
  FilePlus2,
} from "lucide-react";

export interface PaymentsEmptyStateProps {
  hasApplication:
    boolean;
}

export function PaymentsEmptyState({
  hasApplication,
}: PaymentsEmptyStateProps) {
  return (
    <section className="rounded-[20px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0B63F6] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
        {hasApplication ? (
          <CreditCard
            className="h-5 w-5"
            aria-hidden="true"
          />
        ) : (
          <FilePlus2
            className="h-5 w-5"
            aria-hidden="true"
          />
        )}
      </span>

      <h2 className="mt-4 text-[14px] font-black text-[#34445A]">
        {hasApplication
          ? "Aktuell ist keine Zahlung fällig"
          : "Noch kein eingereichter Führerscheinantrag"}
      </h2>

      <p className="mx-auto mt-1.5 max-w-[440px] text-[9px] font-medium leading-4 text-[#8491A3]">
        {hasApplication
          ? "Sobald die Verwaltung eine Zahlung für dich freischaltet, erscheint sie automatisch auf dieser Seite."
          : "Zahlungsinformationen werden erst angezeigt, nachdem du deinen Führerscheinantrag eingereicht hast."}
      </p>

      {!hasApplication ? (
        <Link
          href="/mein-fuehrerschein"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white"
        >
          Zum Führerscheinantrag
        </Link>
      ) : null}
    </section>
  );
}
