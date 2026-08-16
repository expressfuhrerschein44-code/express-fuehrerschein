"use client";

/**
 * Express-Führerschein
 * Main client controller + responsive composition.
 */

import {
  useEffect,
  useRef,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
} from "lucide-react";

import {
  ApplicationDesktop,
} from "@/components/driving-license-application/application-desktop";

import {
  ApplicationMobile,
} from "@/components/driving-license-application/application-mobile";

import {
  useDrivingLicenseApplication,
} from "@/hooks/use-driving-license-application";

import type {
  DrivingLicenseApplicationPageData,
} from "@/types/driving-license-application";

export interface DrivingLicenseApplicationPageProps {
  initialData:
    DrivingLicenseApplicationPageData;
}

export function DrivingLicenseApplicationPage({
  initialData,
}: DrivingLicenseApplicationPageProps) {
  const controller =
    useDrivingLicenseApplication(
      initialData,
    );

  const firstAutosaveRender =
    useRef(
      true,
    );

  const selectedClassesKey =
    controller
      .selectedClasses
      .join(
        "|",
      );

  /**
   * Destructure the exact values used by the autosave effect.
   *
   * This keeps the dependency list precise and avoids depending on the whole
   * controller object, which is recreated whenever the hook returns a new
   * object shape.
   */
  const applicationStatus =
    controller
      .application
      .status;

  const practicalPassed =
    controller
      .practicalPassed;

  const theoryPassed =
    controller
      .theoryPassed;

  const save =
    controller
      .save;

  useEffect(
    () => {
      if (
        applicationStatus !==
        "draft"
      ) {
        return;
      }

      if (
        firstAutosaveRender
          .current
      ) {
        firstAutosaveRender.current =
          false;

        return;
      }

      const timer =
        window.setTimeout(
          () => {
            void save();
          },
          850,
        );

      return () => {
        window.clearTimeout(
          timer,
        );
      };
    },
    [
      applicationStatus,
      practicalPassed,
      save,
      selectedClassesKey,
      theoryPassed,
    ],
  );

  if (
    controller
      .application
      .status !==
    "draft"
  ) {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-[760px] items-center justify-center px-2">
        <div className="w-full rounded-2xl border border-[#D7ECDD] bg-white p-7 text-center shadow-[0_12px_36px_rgba(20,35,55,0.05)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E9F8EF] text-[#159257]">
            <CheckCircle2 className="h-8 w-8" />
          </span>

          <h1 className="mt-5 text-[21px] font-black text-[#132239]">
            Deine Anfrage wurde erfolgreich übermittelt.
          </h1>

          <p className="mx-auto mt-2 max-w-[520px] text-[12px] leading-6 text-[#65758A]">
            Vielen Dank. Deine Angaben, Dokumente und deine Unterschrift wurden sicher gespeichert und an Express-Führerschein übermittelt.
          </p>

          <div className="mt-5 inline-flex rounded-full bg-[#EEF5FF] px-3 py-1.5 text-[10px] font-extrabold text-[#0B63F6]">
            Status: Eingereicht
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B63F6] px-5 text-[11px] font-extrabold text-white transition hover:bg-[#0757D8]"
            >
              Zum Dashboard
            </Link>

            <Link
              href="/mein-fuehrerschein"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DCE5EF] bg-white px-5 text-[11px] font-extrabold text-[#34465A] transition hover:bg-[#F8FAFC]"
            >
              Mein Führerschein
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <ApplicationDesktop
          data={
            initialData
          }
          controller={
            controller
          }
        />
      </div>

      <div className="lg:hidden">
        <ApplicationMobile
          data={
            initialData
          }
          controller={
            controller
          }
        />
      </div>
    </>
  );
}
