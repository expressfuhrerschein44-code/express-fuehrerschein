import {
  PasswordResetLayout,
} from "@/components/auth/password-reset/password-reset-layout";

/* ==========================================================================
   LOADING SKELETON
   ========================================================================== */

export default function PasswordResetLoading() {
  return (
    <PasswordResetLayout>
      <div
        aria-busy="true"
        aria-live="polite"
        className="w-full"
      >
        <span className="sr-only">
          Seite wird geladen...
        </span>

        <section className="rounded-[22px] border border-[#E1E7EF] bg-white px-5 py-7 shadow-[0_20px_55px_rgba(8,24,44,0.09)] sm:px-8 sm:py-9">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-[14px] bg-[#EDF2F7]" />

          <div className="mx-auto mt-5 max-w-[420px]">
            <div className="mx-auto h-7 w-[72%] animate-pulse rounded-lg bg-[#E9EEF4]" />
            <div className="mx-auto mt-3 h-4 w-[88%] animate-pulse rounded-md bg-[#EFF3F7]" />
            <div className="mx-auto mt-2 h-4 w-[66%] animate-pulse rounded-md bg-[#EFF3F7]" />
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <div className="mb-2 h-3 w-28 animate-pulse rounded bg-[#E9EEF4]" />
              <div className="h-[50px] w-full animate-pulse rounded-[9px] bg-[#F0F3F7]" />
            </div>

            <div className="h-[50px] w-full animate-pulse rounded-[9px] bg-[#DDEBFA]" />

            <div className="mx-auto h-3 w-36 animate-pulse rounded bg-[#EDF1F5]" />
          </div>
        </section>

        <div className="mx-auto mt-5 flex max-w-[470px] items-start gap-3 px-2">
          <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#E7EEF6]" />

          <div className="w-full space-y-2 pt-1">
            <div className="h-3 w-[45%] animate-pulse rounded bg-[#E7EDF3]" />
            <div className="h-3 w-[88%] animate-pulse rounded bg-[#EEF2F6]" />
          </div>
        </div>
      </div>
    </PasswordResetLayout>
  );
}
