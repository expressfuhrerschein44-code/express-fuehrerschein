"use client";

/**
 * Express-Führerschein
 * Desktop composition for "Mein Führerschein".
 */

import {
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

import {
  ApplicationPriceSummary,
} from "@/components/driving-license-application/application-price-summary";

import {
  ApplicationSubmitButton,
} from "@/components/driving-license-application/application-submit-button";

import {
  ApplicationTrustStrip,
} from "@/components/driving-license-application/application-trust-strip";

import {
  DocumentUploadSection,
} from "@/components/driving-license-application/document-upload-section";

import {
  ExamInformationSection,
} from "@/components/driving-license-application/exam-information-section";

import {
  LicenseClassSelection,
} from "@/components/driving-license-application/license-class-selection";

import {
  PersonalInformationSection,
} from "@/components/driving-license-application/personal-information-section";

import {
  SignatureSection,
} from "@/components/driving-license-application/signature-section";

import type {
  UseDrivingLicenseApplicationResult,
} from "@/hooks/use-driving-license-application";

import type {
  DrivingLicenseApplicationPageData,
} from "@/types/driving-license-application";

export interface ApplicationDesktopProps {
  data:
    DrivingLicenseApplicationPageData;

  controller:
    UseDrivingLicenseApplicationResult;
}

function Section({
  step,

  title,

  children,
}: {
  step:
    number;

  title:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E6EBF1] bg-white p-4 shadow-[0_3px_14px_rgba(20,35,55,0.025)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63F6] text-[10px] font-black text-white">
          {
            step
          }
        </span>

        <h2 className="text-[12px] font-extrabold text-[#122039]">
          {
            title
          }
        </h2>
      </div>

      {
        children
      }
    </section>
  );
}

function formatMoney(
  cents:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  ).format(
    cents /
    100,
  );
}

export function ApplicationDesktop({
  data,

  controller,
}: ApplicationDesktopProps) {
  const documentsComplete =
    controller
      .application
      .documents
      .some(
        (
          item,
        ) =>
          item.documentType ===
          "id_front",
      ) &&
    controller
      .application
      .documents
      .some(
        (
          item,
        ) =>
          item.documentType ===
          "id_back",
      ) &&
    controller
      .application
      .documents
      .some(
        (
          item,
        ) =>
          item.documentType ===
          "portrait_photo",
      );

  const signatureComplete =
    Boolean(
      controller
        .application
        .signatureType &&
      controller
        .application
        .signaturePath,
    );

  const canSubmit =
    data
      .personalInformation
      .profileComplete &&
    controller
      .selectedClasses
      .length >
      0 &&
    typeof controller
      .theoryPassed ===
      "boolean" &&
    typeof controller
      .practicalPassed ===
      "boolean" &&
    documentsComplete &&
    signatureComplete;

  return (
    <div className="mx-auto w-full max-w-[1240px] pb-5">
      <div className="mb-4">
        <div className="text-[10px] font-medium text-[#708096]">
          Mein Führerschein
          <span className="mx-2 text-[#A6B1BE]">
            ›
          </span>
          Neue Anfrage
        </div>

        <h1 className="mt-2 text-[17px] font-black tracking-[-0.015em] text-[#0E1A2D]">
          Neuen Führerschein beantragen
        </h1>

        <p className="mt-1 text-[11px] text-[#58697E]">
          Wähle deine Kategorien und lade die erforderlichen Dokumente hoch.
        </p>
      </div>

      <ApplicationTrustStrip className="mb-4" />

      {controller.error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#F3CACA] bg-[#FFF7F7] px-4 py-3 text-[11px] font-semibold text-[#B03D3D]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {
              controller.error
            }
          </span>
        </div>
      ) : null}

      <div className="space-y-3">
        <Section
          step={
            1
          }
          title="Persönliche Informationen"
        >
          <PersonalInformationSection
            personalInformation={
              data
                .personalInformation
            }
          />
        </Section>

        <Section
          step={
            2
          }
          title="Führerscheinkategorie(n) wählen"
        >
          <LicenseClassSelection
            items={
              data
                .licenseClasses
            }
            selectedClasses={
              controller
                .selectedClasses
            }
            onToggle={
              controller
                .toggleClass
            }
          />

          {controller
            .selectedClasses
            .length >
          0 ? (
            <div className="mt-1 flex justify-end text-[10px] font-semibold text-[#55667B]">
              Zwischensumme:
              <strong className="ml-1.5 text-[#16253B]">
                {
                  formatMoney(
                    controller
                      .pricing
                      .classesSubtotalCents,
                  )
                }
              </strong>
            </div>
          ) : null}

          <ApplicationPriceSummary
            pricing={
              controller
                .pricing
            }
          />
        </Section>

        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <Section
            step={
              3
            }
            title="Informationen zu deiner Prüfung"
          >
            <ExamInformationSection
              theoryPassed={
                controller
                  .theoryPassed
              }
              practicalPassed={
                controller
                  .practicalPassed
              }
              onTheoryChange={
                controller
                  .setTheoryPassed
              }
              onPracticalChange={
                controller
                  .setPracticalPassed
              }
            />
          </Section>

          <Section
            step={
              4
            }
            title="Dokumente hochladen"
          >
            <DocumentUploadSection
              documents={
                controller
                  .application
                  .documents
              }
              busy={
                controller
                  .uploadBusy
              }
              onUpload={
                controller
                  .uploadDocument
              }
              onDelete={
                controller
                  .deleteDocument
              }
            />
          </Section>
        </div>

        <Section
          step={
            5
          }
          title="Unterschrift"
        >
          <SignatureSection
            signatureType={
              controller
                .application
                .signatureType
            }
            signaturePath={
              controller
                .application
                .signaturePath
            }
            busy={
              controller
                .uploadBusy
            }
            onUpload={
              controller
                .uploadSignature
            }
            onDelete={
              controller
                .deleteSignature
            }
          />
        </Section>
      </div>

      <div className="mt-3 grid grid-cols-[120px_1fr] gap-3">
        <button
          type="button"
          onClick={
            () =>
              history.back()
          }
          className="min-h-11 rounded-xl border border-[#DDE5EE] bg-white px-4 text-[11px] font-extrabold text-[#34465A] transition hover:bg-[#F8FAFC]"
        >
          ‹ Zurück
        </button>

        <ApplicationSubmitButton
          disabled={
            !canSubmit
          }
          submitting={
            controller
              .submitting
          }
          onSubmit={
            async () => {
              await controller
                .submit();
            }
          }
        />
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-[#728196]">
        <LockKeyhole className="h-3 w-3" />
        Deine Daten sind sicher und werden vertraulich behandelt.
      </div>
    </div>
  );
}
