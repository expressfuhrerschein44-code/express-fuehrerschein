import Link from "next/link";

import {
  FileText,
} from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <section className="rounded-[20px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7E8DA1] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
        <FileText
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <h2 className="mt-4 text-[14px] font-black text-[#34445A]">
        Noch keine Dokumente
      </h2>

      <p className="mx-auto mt-1.5 max-w-[390px] text-[9px] font-medium leading-4 text-[#8491A3]">
        Deine eingereichten und freigegebenen Unterlagen erscheinen automatisch hier.
      </p>

      <Link
        href="/mein-fuehrerschein"
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white"
      >
        Zum Führerscheinantrag
      </Link>
    </section>
  );
}
