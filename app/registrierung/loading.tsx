function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[8px] bg-[#E9EEF4] ${className}`}
    />
  );
}

export default function RegistrationLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Registrierung wird geladen"
      className="min-h-screen bg-[#F4F6F8]"
    >
      <div className="flex min-h-screen">
        {/* Desktop side panel */}

        <aside className="relative hidden min-h-screen w-[40%] overflow-hidden bg-[#020914] lg:block xl:w-[38%]">
          <div className="px-9 py-8">
            <Skeleton className="h-9 w-[225px] bg-white/10" />

            <div className="mt-24">
              <Skeleton className="h-10 w-[310px] bg-white/10" />
              <Skeleton className="mt-3 h-10 w-[260px] bg-white/10" />

              <Skeleton className="mt-6 h-4 w-[360px] bg-white/10" />
              <Skeleton className="mt-2 h-4 w-[310px] bg-white/10" />

              <div className="mt-9 space-y-5">
                {Array.from(
                  { length: 4 },
                ).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4"
                  >
                    <Skeleton className="h-11 w-11 rounded-full bg-white/10" />

                    <div className="flex-1">
                      <Skeleton className="h-4 w-36 bg-white/10" />
                      <Skeleton className="mt-2 h-3 w-48 bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main form */}

        <main className="min-w-0 flex-1 p-0 lg:p-3 xl:p-4">
          <div className="min-h-screen bg-white px-4 py-7 sm:px-6 lg:rounded-[18px] lg:border lg:border-[#E2E8F0] lg:px-10 lg:py-10 xl:px-12">
            <div className="mx-auto max-w-[560px]">
              <div className="flex justify-between">
                {Array.from(
                  { length: 3 },
                ).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                  >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-10 w-full max-w-[610px]">
              <div className="text-center">
                <Skeleton className="mx-auto h-8 w-52" />
                <Skeleton className="mx-auto mt-3 h-4 w-64" />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-[70px] w-full" />
                <Skeleton className="h-[70px] w-full" />
              </div>

              <div className="mt-4 space-y-4">
                <Skeleton className="h-[70px] w-full" />
                <Skeleton className="h-[70px] w-full" />
                <Skeleton className="h-[82px] w-full" />
                <Skeleton className="h-[98px] w-full" />
                <Skeleton className="h-[48px] w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <span className="sr-only">
        Registrierung wird geladen…
      </span>
    </div>
  );
}
