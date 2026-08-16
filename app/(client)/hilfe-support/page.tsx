import {
  Building2,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const dynamic =
  "force-dynamic";

const emails = [
  {
    label:
      "Allgemeiner Kontakt",
    value:
      "contact@express-fuhrerscheine.de",
    href:
      "mailto:contact@express-fuhrerscheine.de",
  },
  {
    label:
      "Kundenservice & Support",
    value:
      "support@express-führerscheine.de",
    href:
      "mailto:support@express-führerscheine.de",
  },
] as const;

const phones = [
  {
    label:
      "Kundenservice",
    value:
      "+49 1590 5493267",
    href:
      "tel:+4915905493267",
  },
  {
    label:
      "Support",
    value:
      "+49 178 5655220",
    href:
      "tel:+491785655220",
  },
] as const;

const locations = [
  {
    id:
      "berlin",
    title:
      "Express-Führerschein Berlin",
    address:
      "Ernststr. 57",
    city:
      "D-13509 Berlin",
  },
  {
    id:
      "dortmund",
    title:
      "123 FAHRSCHULE Dortmund-Zentrum",
    address:
      "Bornstraße 77",
    city:
      "44145 Dortmund",
  },
] as const;

export default function HilfeSupportPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      {/* HEADER */}
      <section className="overflow-hidden rounded-[22px] border border-[#E5EAF2] bg-white shadow-[0_12px_34px_rgba(17,40,70,0.05)]">
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.05em] text-[#0B63F6]">
              <Headphones
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Hilfe & Support
            </span>

            <h1 className="mt-4 text-[24px] font-black tracking-[-0.03em] text-[#081529] sm:text-[28px]">
              Wir sind für dich da
            </h1>

            <p className="mt-2 max-w-[650px] text-[11px] font-medium leading-5 text-[#66758A] sm:text-[12px]">
              Kontaktiere unser Team bei Fragen zu deinem
              Führerschein, deinem Antrag oder deinem
              Kundenbereich.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-[16px] border border-[#E7EDF5] bg-[#F8FAFD] px-4 py-3.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B63F6] shadow-[0_4px_14px_rgba(17,40,70,0.06)]">
              <ShieldCheck
                className="h-4.5 w-4.5"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#718096]">
                Express-Führerschein
              </p>

              <p className="mt-0.5 text-[10px] font-extrabold text-[#081529]">
                Persönlicher Kundenservice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* EMAIL */}
        <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
              <Mail
                className="h-4.5 w-4.5"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
                E-Mail
              </p>

              <h2 className="mt-1 text-[16px] font-black text-[#081529]">
                Schreib uns eine Nachricht
              </h2>

              <p className="mt-1 text-[9px] font-medium leading-4 text-[#718096]">
                Nutze die passende E-Mail-Adresse für dein Anliegen.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {emails.map(
              (
                email,
              ) => (
                <a
                  key={
                    email.value
                  }
                  href={
                    email.href
                  }
                  className="group flex items-center justify-between gap-4 rounded-[14px] border border-[#E7ECF3] bg-[#FAFBFD] px-4 py-3.5 transition hover:border-[#BCD0EE] hover:bg-[#F5F9FF]"
                >
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-[#7A899C]">
                      {email.label}
                    </p>

                    <p className="mt-1 break-all text-[10px] font-extrabold text-[#223248] group-hover:text-[#0B63F6]">
                      {email.value}
                    </p>
                  </div>

                  <Mail
                    className="h-4 w-4 shrink-0 text-[#A0ADBC] group-hover:text-[#0B63F6]"
                    aria-hidden="true"
                  />
                </a>
              ),
            )}
          </div>
        </section>

        {/* PHONE */}
        <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
              <Phone
                className="h-4.5 w-4.5"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
                Telefon
              </p>

              <h2 className="mt-1 text-[16px] font-black text-[#081529]">
                Direkter Kontakt
              </h2>

              <p className="mt-1 text-[9px] font-medium leading-4 text-[#718096]">
                Auf dem Smartphone kannst du die Nummer direkt antippen.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {phones.map(
              (
                phone,
              ) => (
                <a
                  key={
                    phone.value
                  }
                  href={
                    phone.href
                  }
                  className="group flex items-center justify-between gap-4 rounded-[14px] border border-[#E7ECF3] bg-[#FAFBFD] px-4 py-3.5 transition hover:border-[#BCD0EE] hover:bg-[#F5F9FF]"
                >
                  <div>
                    <p className="text-[8px] font-bold text-[#7A899C]">
                      {phone.label}
                    </p>

                    <p className="mt-1 text-[11px] font-black text-[#223248] group-hover:text-[#0B63F6]">
                      {phone.value}
                    </p>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0B63F6] shadow-[0_3px_10px_rgba(17,40,70,0.05)]">
                    <Phone
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </span>
                </a>
              ),
            )}
          </div>
        </section>
      </div>

      {/* LOCATIONS */}
      <section className="mt-4 rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
            <Building2
              className="h-4.5 w-4.5"
              aria-hidden="true"
            />
          </span>

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
              Standorte
            </p>

            <h2 className="mt-1 text-[16px] font-black text-[#081529]">
              Unsere Anlaufstellen
            </h2>

            <p className="mt-1 text-[9px] font-medium leading-4 text-[#718096]">
              Hier findest du unsere angegebenen Standorte in Berlin und Dortmund.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {locations.map(
            (
              location,
              index,
            ) => (
              <article
                key={
                  location.id
                }
                className="rounded-[16px] border border-[#E7ECF3] bg-[#FAFBFD] p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B63F6] shadow-[0_4px_12px_rgba(17,40,70,0.05)]">
                    <MapPin
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <span className="text-[7px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
                      Standort {index + 1}
                    </span>

                    <h3 className="mt-1 text-[11px] font-black text-[#081529]">
                      {location.title}
                    </h3>

                    <address className="mt-2 not-italic text-[9px] font-medium leading-4 text-[#66758A]">
                      {location.address}
                      <br />
                      {location.city}
                    </address>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      {/* FOOT INFO */}
      <section className="mt-4 rounded-[16px] border border-[#DCE7F7] bg-[#F5F9FF] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <Headphones
            className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div>
            <p className="text-[9px] font-extrabold text-[#223248]">
              Fragen zu deinem Führerschein?
            </p>

            <p className="mt-1 text-[8px] font-medium leading-4 text-[#66758A]">
              Halte bei einer Anfrage nach Möglichkeit deine Angaben zum
              Führerscheinantrag bereit, damit unser Team dein Anliegen
              schneller zuordnen kann.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}