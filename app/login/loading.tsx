function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[8px] ${className}`}
    />
  );
}

export default function LoginLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Anmeldeseite wird geladen"
      className="min-h-screen bg-[#020914]"
    >
      <div className="flex min-h-screen">
        <aside className="hidden min-h-screen w-1/2 bg-[#020914] px-10 py-8 lg:block">
          <Skeleton className="h-10 w-[270px] bg-white/10" />

          <div className="mt-24">
            <Skeleton className="h-10 w-[330px] bg-white/10" />
            <Skeleton className="mt-3 h-10 w-[285px] bg-white/10" />
            <Skeleton className="mt-3 h-10 w-[180px] bg-white/10" />

            <Skeleton className="mt-7 h-4 w-[390px] bg-white/10" />
            <Skeleton className="mt-2 h-4 w-[330px] bg-white/10" />

            <div className="mt-9 space-y-5">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <Skeleton className="h-11 w-11 rounded-full bg-white/10" />

                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 bg-white/10" />
                    <Skeleton className="mt-2 h-3 w-52 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="mt-24 h-[92px] w-full bg-white/10" />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#F4F6F8]">
          <div className="flex h-[76px] items-center justify-between bg-[#020914] px-4 lg:justify-end lg:bg-transparent lg:px-8">
            <Skeleton className="h-8 w-[190px] bg-white/10 lg:hidden" />
            <Skeleton className="h-8 w-16 bg-[#E7ECF2]" />
          </div>

          <div className="flex flex-1 items-center justify-center px-3 py-4 sm:px-5 lg:px-8">
            <div className="w-full max-w-[590px]">
              <section className="rounded-[16px] border border-[#E1E6ED] bg-white px-5 py-8 shadow-[0_18px_50px_rgba(7,20,38,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                <Skeleton className="mx-auto h-9 w-36 bg-[#E9EEF4]" />
                <Skeleton className="mx-auto mt-3 h-4 w-56 bg-[#E9EEF4]" />

                <div className="mt-9 space-y-5">
                  <Skeleton className="h-[70px] w-full bg-[#E9EEF4]" />
                  <Skeleton className="h-[70px] w-full bg-[#E9EEF4]" />
                  <Skeleton className="ml-auto h-4 w-32 bg-[#E9EEF4]" />
                  <Skeleton className="h-12 w-full bg-[#E9EEF4]" />
                  <Skeleton className="h-px w-full bg-[#E9EEF4]" />
                  <Skeleton className="h-12 w-full bg-[#E9EEF4]" />
                  <Skeleton className="h-12 w-full bg-[#E9EEF4]" />
                  <Skeleton className="mx-auto h-4 w-48 bg-[#E9EEF4]" />
                </div>
              </section>

              <Skeleton className="mt-5 h-[82px] w-full bg-[#DCE8F5]" />
            </div>
          </div>
        </main>
      </div>

      <span className="sr-only">
        Anmeldeseite wird geladen…
      </span>
    </div>
  );
}
