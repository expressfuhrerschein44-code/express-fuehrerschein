import type {
  ReactNode,
} from "react";

import { RegistrationHeader } from "@/components/auth/registration/registration-header";
import { RegistrationSidePanel } from "@/components/auth/registration/registration-side-panel";
import { RegistrationStepper } from "@/components/auth/registration/registration-stepper";
import { cn } from "@/lib/utils";
import type {
  RegistrationStepId,
} from "@/types/registration";

export interface RegistrationLayoutProps {
  children: ReactNode;
  currentStep: RegistrationStepId;

  title: string;
  subtitle?: string;

  className?: string;
  contentClassName?: string;

  showMobileBackButton?: boolean;
}

export function RegistrationLayout({
  children,
  currentStep,
  title,
  subtitle,
  className,
  contentClassName,
  showMobileBackButton = true,
}: RegistrationLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#020914]",
        className,
      )}
    >
      <RegistrationHeader
        showBackButton={
          showMobileBackButton
        }
      />

      <div className="flex min-h-[calc(100vh-72px)] lg:min-h-screen">
        <RegistrationSidePanel />

        <main
          id="main-content"
          className="flex min-w-0 flex-1 bg-[#F4F6F8] p-0 lg:p-3 xl:p-4"
        >
          <div
            className={cn(
              "flex min-h-full w-full flex-col bg-white px-4 py-7 sm:px-6 sm:py-9 lg:rounded-[18px] lg:border lg:border-[#E2E8F0] lg:px-10 lg:py-10 lg:shadow-[0_14px_40px_rgba(7,20,38,0.07)] xl:px-12",
              contentClassName,
            )}
          >
            <RegistrationStepper
              currentStep={
                currentStep
              }
            />

            <div className="mx-auto mt-8 w-full max-w-[610px] sm:mt-10">
              <div className="text-center">
                <h1 className="text-[24px] font-extrabold tracking-[-0.035em] text-[#071426] sm:text-[28px]">
                  {title}
                </h1>

                {subtitle ? (
                  <p className="mt-2 text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="mt-7 sm:mt-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
