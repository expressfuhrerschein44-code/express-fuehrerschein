"use client";

/**
 * Express-Führerschein
 * Mobile accordion composition for "Mein Führerschein".
 */

import {
  useState,
} from "react";

import {
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

import {
  ApplicationMobileSection,
} from "@/components/driving-license-application/application-mobile-section";

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

export interface ApplicationMobileProps {
  data:
    DrivingLicenseApplicationPageData;

  controller:
    UseDrivingLicenseApplicationResult;
}

export function ApplicationMobile({
  data,

  controller,
}: ApplicationMobileProps) {
  const [
    openStep,
    setOpenStep,
  ] =
    useState(
      2,
    );

  const documentCount =
    [
      "id_front",
      "id_back",
      "portrait_photo",
    ].filter(
      (
        type,
      ) =>
        controller
          .application
          .documents
          .some(
            (
              document,
            ) =>
              document.documentType ===
              type,
          ),
    ).length;

  const examsComplete =
    typeof controller
      .theoryPassed ===
      "boolean" &&
    typeof controller
      .practicalPassed ===
      "boolean";

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
    examsComplete &&
    documentCount ===
      3 &&
    signatureComplete;

  function toggle(
    step:
      number,
  ) {
    setOpenStep(
      (
        current,
      ) =>
        current ===
          step
          ? 0
          : step,
    );
  }

  return (
    <div className="mx-auto w-full max-w-[560px] pb-5">
      <div className="mb-4">
        <h1 className="text-[18px] font-black tracking-[-0.015em] text-[#0E1A2D]">
          Neuen Führerschein beantragen
        </h1>

        <p className="mt-1 text-[11px] leading-5 text-[#58697E]">
          Wähle deine Kategorien und lade die erforderlichen Dokumente hoch.
        </p>
      </div>

      <ApplicationTrustStrip
        compact
        className="mb-3"
      />

      {controller.error ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#F3CACA] bg-[#FFF7F7] px-3 py-2.5 text-[10px] font-semibold text-[#B03D3D]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {
              controller.error
            }
          </span>
        </div>
      ) : null}

      <div className="space-y-2">
        <ApplicationMobileSection
          step={
            1
          }
          title="Persönliche Informationen"
          meta={
            data
              .personalInformation
              .profileComplete
              ? "✓"
              : "Offen"
          }
          complete={
            data
              .personalInformation
              .profileComplete
          }
          open={
            openStep ===
            1
          }
          onToggle={
            () =>
              toggle(
                1,
              )
          }
        >
          <PersonalInformationSection
            compact
            personalInformation={
              data
                .personalInformation
            }
          />
        </ApplicationMobileSection>

        <ApplicationMobileSection
          step={
            2
          }
          title="Führerscheinkategorie(n) wählen"
          meta={
            controller
              .selectedClasses
              .length >
            0
              ? `${controller.selectedClasses.length} ausgewählt`
              : "Auswählen"
          }
          complete={
            controller
              .selectedClasses
              .length >
            0
          }
          open={
            openStep ===
            2
          }
          onToggle={
            () =>
              toggle(
                2,
              )
          }
        >
          <LicenseClassSelection
            compact
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

          <div className="mt-3">
            <ApplicationPriceSummary
              compact
              pricing={
                controller
                  .pricing
              }
            />
          </div>
        </ApplicationMobileSection>

        <ApplicationMobileSection
          step={
            3
          }
          title="Informationen zu deiner Prüfung"
          meta={
            examsComplete
              ? "✓"
              : "Offen"
          }
          complete={
            examsComplete
          }
          open={
            openStep ===
            3
          }
          onToggle={
            () =>
              toggle(
                3,
              )
          }
        >
          <ExamInformationSection
            compact
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
        </ApplicationMobileSection>

        <ApplicationMobileSection
          step={
            4
          }
          title="Dokumente hochladen"
          meta={`${documentCount}/3`}
          complete={
            documentCount ===
            3
          }
          open={
            openStep ===
            4
          }
          onToggle={
            () =>
              toggle(
                4,
              )
          }
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
        </ApplicationMobileSection>

        <ApplicationMobileSection
          step={
            5
          }
          title="Unterschrift"
          meta={
            signatureComplete
              ? "✓"
              : "Hinzufügen"
          }
          complete={
            signatureComplete
          }
          open={
            openStep ===
            5
          }
          onToggle={
            () =>
              toggle(
                5,
              )
          }
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
        </ApplicationMobileSection>
      </div>

      <div className="mt-4">
        <ApplicationSubmitButton
          compact
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

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-[#728196]">
          <LockKeyhole className="h-3 w-3" />
          Deine Daten sind sicher und werden vertraulich behandelt.
        </div>
      </div>
    </div>
  );
}
