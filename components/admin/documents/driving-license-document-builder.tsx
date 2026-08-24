"use client";

import Image from "next/image";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  Printer,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import {
  OfficialSignature,
} from "@/components/shared/official-signature";

/* ==========================================================================
   CONFIG
   ========================================================================== */

const SCHOOL_NAME =
  "Express-Führerschein";

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES =
  new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
  ]);

/* ==========================================================================
   TYPES
   ========================================================================== */

interface DocumentForm {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;

  street: string;
  postalCode: string;
  city: string;

  drivingClasses: string;

  documentPlace: string;
  documentDate: string;
}

type UploadType =
  | "photo"
  | "signature";

/* ==========================================================================
   INITIAL STATE
   ========================================================================== */

const INITIAL_FORM:
  DocumentForm = {
  firstName: "",
  lastName: "",
  birthDate: "",
  birthPlace: "",

  street: "",
  postalCode: "",
  city: "",

  drivingClasses: "B",

  documentPlace: "",
  documentDate: "",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function displayValue(
  value: string,
): string {
  const normalized =
    value.trim();

  return normalized || "—";
}

function formatGermanDate(
  value: string,
): string {
  if (!value) {
    return "—";
  }

  const parts =
    value.split("-");

  if (
    parts.length !== 3
  ) {
    return value;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

function readImageFile(
  file: File,
): Promise<string> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(
              reader.result,
            );
            return;
          }

          reject(
            new Error(
              "Die Bilddatei konnte nicht gelesen werden.",
            ),
          );
        };

      reader.onerror =
        () => {
          reject(
            new Error(
              "Die Bilddatei konnte nicht gelesen werden.",
            ),
          );
        };

      reader.readAsDataURL(
        file,
      );
    },
  );
}

function safeFileNamePart(
  value: string,
): string {
  return (
    value
      .trim()
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) || "Antragsteller"
  );
}

/* ==========================================================================
   SMALL COMPONENTS
   ========================================================================== */

function FieldLabel({
  children,
  required = false,
}: {
  children:
    React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
      {children}

      {required ? (
        <span className="ml-1 text-red-500">
          *
        </span>
      ) : null}
    </label>
  );
}

function DocumentValue({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={
        className
      }
    >
      <div className="mb-[5px] text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#677489]">
        {label}
      </div>

      <div className="min-h-[25px] border-b border-[#bcc8d8] pb-[5px] text-[11.5px] font-semibold text-[#071426]">
        {displayValue(
          value,
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export function DrivingLicenseDocumentBuilder() {
  const [
    form,
    setForm,
  ] =
    useState<DocumentForm>(
      INITIAL_FORM,
    );

  const [
    photoDataUrl,
    setPhotoDataUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    applicantSignatureDataUrl,
    setApplicantSignatureDataUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    uploadError,
    setUploadError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    printError,
    setPrintError,
  ] =
    useState<string | null>(
      null,
    );

  function updateField<
    K extends keyof DocumentForm,
  >(
    field: K,
    value:
      DocumentForm[K],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );

    setPrintError(
      null,
    );
  }

  async function handleUpload(
    file:
      File | undefined,
    type:
      UploadType,
  ) {
    setUploadError(
      null,
    );

    if (!file) {
      return;
    }

    if (
      !ACCEPTED_IMAGE_TYPES.has(
        file.type,
      )
    ) {
      setUploadError(
        "Bitte verwende eine PNG-, JPG-, JPEG- oder WEBP-Datei.",
      );
      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setUploadError(
        "Die Bilddatei darf maximal 8 MB groß sein.",
      );
      return;
    }

    try {
      const dataUrl =
        await readImageFile(
          file,
        );

      if (
        type ===
        "photo"
      ) {
        setPhotoDataUrl(
          dataUrl,
        );
      } else {
        setApplicantSignatureDataUrl(
          dataUrl,
        );
      }

      setPrintError(
        null,
      );
    } catch (
      error
    ) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Die Datei konnte nicht verarbeitet werden.",
      );
    }
  }

  function resetDocument() {
    setForm(
      INITIAL_FORM,
    );

    setPhotoDataUrl(
      null,
    );

    setApplicantSignatureDataUrl(
      null,
    );

    setUploadError(
      null,
    );

    setPrintError(
      null,
    );
  }

  function validateForPdf():
    boolean {
    const requiredValues = [
      form.firstName,
      form.lastName,
      form.birthDate,
      form.birthPlace,
      form.street,
      form.postalCode,
      form.city,
      form.drivingClasses,
      form.documentPlace,
      form.documentDate,
    ];

    if (
      requiredValues.some(
        (
          value,
        ) =>
          !value.trim(),
      )
    ) {
      setPrintError(
        "Bitte fülle alle Pflichtfelder aus.",
      );
      return false;
    }

    if (
      !photoDataUrl
    ) {
      setPrintError(
        "Bitte lade das Foto des Antragstellers hoch.",
      );
      return false;
    }

    if (
      !applicantSignatureDataUrl
    ) {
      setPrintError(
        "Bitte lade die Unterschrift des Antragstellers hoch.",
      );
      return false;
    }

    setPrintError(
      null,
    );

    return true;
  }

  function createPdf() {
    if (
      !validateForPdf()
    ) {
      return;
    }

    const previousTitle =
      document.title;

    document.title =
      [
        "Fahrerlaubnis",
        safeFileNamePart(
          form.lastName,
        ),
        safeFileNamePart(
          form.firstName,
        ),
      ].join("_");

    window.print();

    document.title =
      previousTitle;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* =============================================================
            PAGE HEADER
            ============================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0878ff]">
                <FileText
                  className="h-4 w-4"
                />

                Dokumentgenerator
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Fahrerlaubnis-Dokument erstellen
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Kandidatendaten,
                Lichtbild und
                Unterschrift erfassen
                und anschließend als
                sauber formatiertes
                A4-Dokument ausgeben.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  resetDocument
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />

                Zurücksetzen
              </button>

              <button
                type="button"
                onClick={
                  createPdf
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0878ff] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#006eea]"
              >
                <Printer className="h-4 w-4" />

                PDF erstellen
              </button>
            </div>
          </div>

          {printError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {printError}
            </div>
          ) : null}

          {uploadError ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {uploadError}
            </div>
          ) : null}
        </section>

        {/* =============================================================
            WORKSPACE
            ============================================================= */}

        <div className="grid items-start gap-6 2xl:grid-cols-[minmax(420px,0.8fr)_minmax(760px,1.2fr)]">
          {/* ===========================================================
              FORM
              =========================================================== */}

          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Dokumentdaten
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Die Vorschau wird
                automatisch aktualisiert.
              </p>
            </div>

            {/* SCHOOL */}

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <FieldLabel>
                Fahrschule
              </FieldLabel>

              <div className="rounded-lg border border-blue-100 bg-white px-3.5 py-3 text-sm font-bold text-[#082d6b]">
                {SCHOOL_NAME}
              </div>
            </div>

            {/* PERSONAL DATA */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Persönliche Daten
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel
                    required
                  >
                    Vorname
                  </FieldLabel>

                  <input
                    value={
                      form.firstName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "firstName",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>

                <div>
                  <FieldLabel
                    required
                  >
                    Nachname
                  </FieldLabel>

                  <input
                    value={
                      form.lastName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "lastName",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>

                <div>
                  <FieldLabel
                    required
                  >
                    Geburtsdatum
                  </FieldLabel>

                  <input
                    type="date"
                    value={
                      form.birthDate
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "birthDate",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>

                <div>
                  <FieldLabel
                    required
                  >
                    Geburtsort
                  </FieldLabel>

                  <input
                    value={
                      form.birthPlace
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "birthPlace",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>
              </div>
            </div>

            {/* ADDRESS */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Wohnanschrift
              </h3>

              <div className="grid gap-4">
                <div>
                  <FieldLabel
                    required
                  >
                    Straße / Hausnummer
                  </FieldLabel>

                  <input
                    value={
                      form.street
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "street",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="z. B. Musterstraße 12"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  <div>
                    <FieldLabel
                      required
                    >
                      PLZ
                    </FieldLabel>

                    <input
                      value={
                        form.postalCode
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "postalCode",
                          event
                            .target
                            .value,
                        )
                      }
                      inputMode="numeric"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                    />
                  </div>

                  <div>
                    <FieldLabel
                      required
                    >
                      Wohnort
                    </FieldLabel>

                    <input
                      value={
                        form.city
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "city",
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LICENCE */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Fahrerlaubnis
              </h3>

              <FieldLabel
                required
              >
                Beantragte
                Führerscheinklasse(n)
              </FieldLabel>

              <input
                value={
                  form.drivingClasses
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "drivingClasses",
                    event
                      .target
                      .value,
                  )
                }
                placeholder="z. B. B oder B, BE"
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold uppercase outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
              />
            </div>

            {/* PHOTO */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Lichtbild
              </h3>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-[126px] w-[98px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {photoDataUrl ? (
                      <Image
                        src={
                          photoDataUrl
                        }
                        alt="Lichtbild des Antragstellers"
                        width={350}
                        height={450}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs font-semibold text-slate-400">
                        Kein Foto
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">
                      Foto des
                      Antragstellers
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      PNG, JPG, JPEG
                      oder WEBP · maximal
                      8 MB.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0878ff] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#006eea]">
                        <Upload className="h-4 w-4" />

                        Foto auswählen

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(
                            event,
                          ) =>
                            void handleUpload(
                              event
                                .target
                                .files?.[0],
                              "photo",
                            )
                          }
                        />
                      </label>

                      {photoDataUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoDataUrl(
                              null,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />

                          Entfernen
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* APPLICANT SIGNATURE */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Unterschrift des
                Antragstellers
              </h3>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="min-h-[110px] rounded-lg border border-slate-200 bg-white p-3">
                  {applicantSignatureDataUrl ? (
                    <div className="flex min-h-[82px] items-center justify-center">
                      <Image
                        src={
                          applicantSignatureDataUrl
                        }
                        alt="Unterschrift des Antragstellers"
                        width={800}
                        height={300}
                        unoptimized
                        className="max-h-[82px] w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[82px] items-center justify-center text-center text-xs font-semibold text-slate-400">
                      Noch keine
                      Unterschrift
                      hochgeladen
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#082d6b] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#061f4d]">
                    <Upload className="h-4 w-4" />

                    Unterschrift
                    hochladen

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(
                        event,
                      ) =>
                        void handleUpload(
                          event
                            .target
                            .files?.[0],
                          "signature",
                        )
                      }
                    />
                  </label>

                  {applicantSignatureDataUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setApplicantSignatureDataUrl(
                          null,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />

                      Entfernen
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* PLACE / DATE */}

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
                Ausstellung
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel
                    required
                  >
                    Ort
                  </FieldLabel>

                  <input
                    value={
                      form.documentPlace
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "documentPlace",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>

                <div>
                  <FieldLabel
                    required
                  >
                    Datum
                  </FieldLabel>

                  <input
                    type="date"
                    value={
                      form.documentDate
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "documentDate",
                        event
                          .target
                          .value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#0878ff] focus:ring-2 focus:ring-[#0878ff]/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-xs leading-5 text-emerald-900">
                Foto und
                Unterschrift werden nur
                für die aktuelle
                Dokumentvorschau im
                Browser verwendet. Diese
                Version speichert keine
                Dateien in der
                Datenbank.
              </p>
            </div>
          </section>

          {/* ===========================================================
              A4 PREVIEW
              =========================================================== */}

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-[#e9eef5] p-3 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  A4-Vorschau
                </h2>

                <p className="text-xs text-slate-500">
                  Ausgabeformat
                  210 × 297 mm
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                Druckansicht
              </div>
            </div>

            <div className="overflow-auto rounded-xl">
              {/* =======================================================
                  PRINT DOCUMENT
                  ======================================================= */}

              <article
                id="license-application-print"
                className="relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden bg-white text-[#071426] shadow-[0_12px_45px_rgba(15,23,42,0.16)]"
              >
                {/* WATERMARK */}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
                >
                  <div className="-rotate-[31deg] whitespace-nowrap text-[46px] font-black tracking-[0.15em] text-[#0878ff]/[0.045]">
                    Express-Führerschein
                  </div>
                </div>

                {/* TOP ACCENT */}

                <div className="absolute inset-x-0 top-0 z-10 h-[6px] bg-[#0878ff]" />

                <div className="relative z-10 flex min-h-[297mm] flex-col px-[15mm] pb-[11mm] pt-[14mm]">
                  {/* HEADER */}

                  <header className="border-b-2 border-[#0b2d62] pb-[6mm]">
                    {/* BRAND */}

                    <div className="text-center">
                      <div className="text-[22px] font-black tracking-[-0.04em] text-[#071426]">
                        Express-
                        <span className="text-[#0878ff]">
                          Führerschein
                        </span>
                      </div>

                      <div className="mt-[1.5mm] text-[7.5px] font-black uppercase tracking-[0.22em] text-[#718096]">
                        Fahrschule
                      </div>
                    </div>

                    {/* DOCUMENT TITLE */}

                    <div className="mt-[4.5mm] text-center">
                      <h1 className="text-[17px] font-black leading-[1.2] tracking-[-0.025em] text-[#071426]">
                        Unterlage zur
                        Fahrerlaubnisbeantragung
                      </h1>

                      <p className="mx-auto mt-[1.5mm] max-w-[132mm] text-[8px] font-medium leading-[1.5] text-[#68778c]">
                        Zusammenstellung
                        der persönlichen
                        Angaben des
                        Antragstellers zur
                        Vorbereitung der
                        Fahrerlaubnisbeantragung.
                      </p>
                    </div>

                    {/* APPLICANT PHOTO */}

                    <div className="mt-[4.5mm] flex flex-col items-center">
                      <div className="mb-[1.5mm] text-center text-[6.5px] font-black uppercase tracking-[0.16em] text-[#718096]">
                        Lichtbild des
                        Antragstellers
                      </div>

                      <div className="flex h-[36mm] w-[28mm] items-center justify-center overflow-hidden rounded-[2mm] border border-[#aebccd] bg-[#f7f9fc] shadow-[0_2px_8px_rgba(15,35,65,0.06)]">
                        {photoDataUrl ? (
                          <Image
                            src={
                              photoDataUrl
                            }
                            alt="Lichtbild des Antragstellers"
                            width={350}
                            height={450}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="px-[2mm] text-center text-[7px] font-semibold leading-[1.4] text-[#9aa8ba]">
                            Lichtbild
                          </span>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* PERSONAL */}

                  <section className="mt-[6mm]">
                    <div className="mb-[4mm] flex items-center gap-[3mm]">
                      <div className="h-[4mm] w-[1.2mm] rounded-full bg-[#0878ff]" />

                      <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0b2d62]">
                        Persönliche Daten
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-x-[9mm] gap-y-[5mm]">
                      <DocumentValue
                        label="Vorname"
                        value={
                          form.firstName
                        }
                      />

                      <DocumentValue
                        label="Nachname"
                        value={
                          form.lastName
                        }
                      />

                      <DocumentValue
                        label="Geburtsdatum"
                        value={
                          formatGermanDate(
                            form.birthDate,
                          )
                        }
                      />

                      <DocumentValue
                        label="Geburtsort"
                        value={
                          form.birthPlace
                        }
                      />
                    </div>
                  </section>

                  {/* ADDRESS */}

                  <section className="mt-[6mm]">
                    <div className="mb-[4mm] flex items-center gap-[3mm]">
                      <div className="h-[4mm] w-[1.2mm] rounded-full bg-[#0878ff]" />

                      <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0b2d62]">
                        Wohnanschrift
                      </h2>
                    </div>

                    <div className="grid grid-cols-[1.4fr_0.55fr_1fr] gap-x-[7mm] gap-y-[5mm]">
                      <DocumentValue
                        label="Straße / Hausnummer"
                        value={
                          form.street
                        }
                      />

                      <DocumentValue
                        label="PLZ"
                        value={
                          form.postalCode
                        }
                      />

                      <DocumentValue
                        label="Wohnort"
                        value={
                          form.city
                        }
                      />
                    </div>
                  </section>

                  {/* LICENCE */}

                  <section className="mt-[6mm] rounded-[3mm] border border-[#d8e3ef] bg-[#f7faff] px-[5mm] py-[4mm]">
                    <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#66778d]">
                      Beantragte
                      Führerscheinklasse(n)
                    </div>

                    <div className="mt-[1.5mm] text-[18px] font-black uppercase tracking-[0.04em] text-[#0878ff]">
                      {displayValue(
                        form.drivingClasses,
                      )}
                    </div>
                  </section>

                  {/* SCHOOL */}

                  <section className="mt-[6mm]">
                    <div className="mb-[4mm] flex items-center gap-[3mm]">
                      <div className="h-[4mm] w-[1.2mm] rounded-full bg-[#0878ff]" />

                      <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0b2d62]">
                        Fahrschule
                      </h2>
                    </div>

                    <div className="rounded-[3mm] border border-[#d8e3ef] px-[5mm] py-[4mm]">
                      <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#718096]">
                        Name der
                        Fahrschule
                      </div>

                      <div className="mt-[1mm] text-[13px] font-black text-[#071426]">
                        {SCHOOL_NAME}
                      </div>
                    </div>
                  </section>

                  {/* DECLARATION */}

                  <section className="mt-[5mm] rounded-[3mm] bg-[#f8fafc] px-[5mm] py-[3.5mm]">
                    <p className="text-[8.5px] leading-[1.65] text-[#58687c]">
                      Die vorstehenden
                      Angaben wurden für
                      die Unterlagen zur
                      Fahrerlaubnisbeantragung
                      zusammengestellt.
                      Die eingefügte
                      Unterschrift des
                      Antragstellers
                      entspricht der vom
                      Antragsteller
                      bereitgestellten
                      Signaturdatei.
                    </p>
                  </section>

                  {/* PLACE / DATE */}

                  <section className="mt-[5mm] grid grid-cols-2 gap-x-[12mm]">
                    <DocumentValue
                      label="Ort"
                      value={
                        form.documentPlace
                      }
                    />

                    <DocumentValue
                      label="Datum"
                      value={
                        formatGermanDate(
                          form.documentDate,
                        )
                      }
                    />
                  </section>

                  {/* SIGNATURES */}

                  <section className="mt-[6mm] grid grid-cols-2 gap-[12mm]">
                    {/* APPLICANT */}

                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#526177]">
                        Unterschrift des
                        Antragstellers
                      </div>

                      <div className="mt-[2mm] flex h-[27mm] items-center justify-center overflow-hidden">
                        {applicantSignatureDataUrl ? (
                          <Image
                            src={
                              applicantSignatureDataUrl
                            }
                            alt="Unterschrift des Antragstellers"
                            width={800}
                            height={300}
                            unoptimized
                            className="max-h-[24mm] w-auto max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[8px] text-[#a0adbd]">
                            Unterschrift
                            einfügen
                          </span>
                        )}
                      </div>

                      <div className="border-t border-[#8696aa] pt-[2mm] text-[7.5px] text-[#68778c]">
                        Antragsteller/in
                      </div>
                    </div>

                    {/* SCHOOL */}

                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.13em] text-[#526177]">
                        Bestätigung der
                        Fahrschule
                      </div>

                      <div className="mt-[1mm] flex h-[28mm] items-center justify-center overflow-hidden">
                        <OfficialSignature className="max-h-[27mm] w-[62mm] object-contain" />
                      </div>

                      <div className="border-t border-[#8696aa] pt-[2mm] text-[7.5px] font-semibold text-[#68778c]">
                        {SCHOOL_NAME}
                      </div>
                    </div>
                  </section>

                  {/* FOOTER */}

                  <footer className="mt-auto border-t border-[#dce4ee] pt-[4mm]">
                    <div className="flex items-end justify-between gap-[8mm]">
                      <div>
                        <div className="text-[8px] font-black text-[#0b2d62]">
                          Express-Führerschein
                        </div>

                        <div className="mt-[1mm] max-w-[125mm] text-[6.8px] leading-[1.5] text-[#8a97a8]">
                          Von der
                          Fahrschule
                          erstellte
                          Unterlage zur
                          Vorbereitung und
                          Vorlage im
                          Zusammenhang mit
                          einer
                          Fahrerlaubnisbeantragung.
                          Kein amtliches
                          Behördenformular.
                        </div>
                      </div>

                      <div className="shrink-0 text-right text-[6.8px] font-bold uppercase tracking-[0.12em] text-[#0878ff]">
                        Express-
                        Führerschein
                      </div>
                    </div>
                  </footer>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      {/* ===============================================================
          PRINT CSS
          =============================================================== */}

      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          #license-application-print,
          #license-application-print * {
            visibility: visible !important;
          }

          #license-application-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            min-width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-shadow: none !important;
          }

          #license-application-print,
          #license-application-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}