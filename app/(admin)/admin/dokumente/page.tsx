import Link from "next/link";

import {
  ArrowRight,
  FileCheck2,
  FilePlus2,
  Files,
  ShieldCheck,
} from "lucide-react";

export const dynamic =
  "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-5 lg:px-7 lg:py-7">
      {/* ===============================================================
          HEADER
          =============================================================== */}

      <section className="rounded-[19px] border border-[#E3E8F0] bg-white p-5 shadow-[0_8px_26px_rgba(17,40,70,0.04)] sm:p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
          <ShieldCheck
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />

          Admin-Bereich
        </span>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[22px] font-black tracking-[-0.03em] text-[#081529] sm:text-[25px]">
              Dokumente
            </h1>

            <p className="mt-2 max-w-[760px] text-[10px] font-medium leading-5 text-[#718096] sm:text-[11px]">
              Dokumente verwalten und professionelle
              Fahrerlaubnis-Unterlagen für Kandidaten
              erstellen.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#DCE7F7] bg-[#F7FAFF] px-3 py-2 text-[9px] font-bold text-[#47617F]">
            <Files
              className="h-4 w-4 text-[#0B63F6]"
              aria-hidden="true"
            />

            Express-Führerschein Dokumentverwaltung
          </div>
        </div>
      </section>

      {/* ===============================================================
          DOCUMENT MODULES
          =============================================================== */}

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* =============================================================
            DRIVER LICENCE DOCUMENT GENERATOR
            ============================================================= */}

        <article className="group relative overflow-hidden rounded-[19px] border border-[#CFE1FF] bg-white shadow-[0_10px_32px_rgba(11,99,246,0.07)]">
          <div
            aria-hidden="true"
            className="absolute right-[-45px] top-[-55px] h-[180px] w-[180px] rounded-full bg-[#0B63F6]/[0.055]"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[-70px] left-[18%] h-[160px] w-[160px] rounded-full bg-[#1684FF]/[0.035]"
          />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#0B63F6] text-white shadow-[0_10px_24px_rgba(11,99,246,0.23)]">
                <FilePlus2
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <span className="rounded-full border border-[#CFE1FF] bg-[#EEF5FF] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.07em] text-[#0B63F6]">
                Neu
              </span>
            </div>

            <div className="mt-5">
              <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
                Dokumentgenerator
              </p>

              <h2 className="mt-2 text-[18px] font-black tracking-[-0.025em] text-[#081529] sm:text-[20px]">
                Fahrerlaubnis-Dokument erstellen
              </h2>

              <p className="mt-3 max-w-[620px] text-[10px] font-medium leading-[1.8] text-[#718096]">
                Persönliche Angaben, Lichtbild,
                Führerscheinklasse und die Unterschrift des
                Antragstellers erfassen und als sauber
                gestaltetes A4-Dokument vorbereiten.
              </p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                "Kandidatendaten",
                "Lichtbild",
                "Unterschrift",
                "A4 / PDF-Ausgabe",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-[10px] border border-[#E5ECF5] bg-[#FAFCFF] px-3 py-2.5 text-[9px] font-bold text-[#455A73]"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0B63F6]" />

                    {item}
                  </div>
                ),
              )}
            </div>

            <Link
              href="/admin/dokumente/fuehrerscheinantrag"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#0B63F6] px-5 text-[10px] font-black text-white shadow-[0_8px_22px_rgba(11,99,246,0.2)] outline-none transition-all hover:bg-[#0757D6] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
            >
              Dokument erstellen

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </article>

        {/* =============================================================
            EXISTING DOCUMENT MANAGEMENT
            ============================================================= */}

        <article className="rounded-[19px] border border-[#E3E8F0] bg-white p-5 shadow-[0_8px_26px_rgba(17,40,70,0.04)] sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EDF2F7] text-[#52667E]">
            <FileCheck2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div className="mt-5">
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[#718096]">
              Dokumentverwaltung
            </p>

            <h2 className="mt-2 text-[18px] font-black tracking-[-0.025em] text-[#081529] sm:text-[20px]">
              Kundendokumente prüfen
            </h2>

            <p className="mt-3 max-w-[620px] text-[10px] font-medium leading-[1.8] text-[#718096]">
              Hochgeladene Dokumente kontrollieren,
              bestätigen oder ablehnen. Die bestehende
              sichere Datenbasis bleibt dabei unverändert.
            </p>
          </div>

          <div className="mt-5 rounded-[14px] border border-[#E5EAF2] bg-[#F8FAFD] px-4 py-4">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.05em] text-[#718096]">
              Datenquelle
            </p>

            <p className="mt-1.5 text-[10px] font-black text-[#26374D]">
              user_documents / application_documents
            </p>

            <p className="mt-2 text-[9px] font-medium leading-5 text-[#7D8A9B]">
              Die bestehende Admin-Grundlage bleibt aktiv.
              Weitere Verwaltungsaktionen können später
              direkt an diese Datenquelle angeschlossen
              werden.
            </p>
          </div>
        </article>
      </section>

      {/* ===============================================================
          INFORMATION
          =============================================================== */}

      <section className="mt-5 rounded-[16px] border border-[#E0E8F3] bg-[#F8FBFF] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF2FF] text-[#0B63F6]">
            <ShieldCheck
              className="h-4 w-4"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[9px] font-black text-[#26374D]">
              Geschützter Administrationsbereich
            </p>

            <p className="mt-1 text-[8px] font-medium leading-4 text-[#718096]">
              Die Erstellung und Verwaltung dieser
              Dokumente erfolgt ausschließlich innerhalb
              des geschützten Express-Führerschein
              Admin-Bereichs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}