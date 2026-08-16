import { SectionContainer } from "@/components/layout/section-container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="6" width="19" height="14" rx="2" />
      <path d="M8 25h9M12.5 20v5" />
      <rect x="23.5" y="10" width="5.5" height="14" rx="1.4" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.1 9A7 7 0 0 1 18.7 7M17.9 15A7 7 0 0 1 5.3 17" />
    </svg>
  );
}

export function PlatformSection() {
  return (
    <SectionContainer
      tone="dark"
      spacing="default"
      className="overflow-hidden"
    >
      <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#07182B] px-5 py-7 sm:px-7 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[#0878FF]/10 blur-3xl"
        />

        <div className="relative flex max-w-2xl items-start gap-4">
          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[#15426F] bg-[#092442] text-[#1684FF]">
            <DeviceIcon />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#56A5FF]">
              WEB & MOBILE
            </p>

            <h2 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.03em] text-white sm:text-[26px]">
              Lerne überall. Auf jedem Gerät.
            </h2>

            <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/68 sm:text-[14px]">
              Dein Lernfortschritt bleibt automatisch synchronisiert – klar, schnell und ohne Unterbrechung.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-[#62ACFF]">
              <SyncIcon />
              <span>Ein Konto. Ein Fortschritt. Überall.</span>
            </div>
          </div>
        </div>

        <div className="relative mt-6 lg:mt-0">
          <Button
            href={ROUTES.register}
            size="lg"
            className="w-full sm:w-auto"
          >
            Jetzt starten
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
