function LoadingBar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-white/10 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Express-Führerschein wird geladen"
      className="min-h-screen bg-[#020914] text-white"
    >
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-5 md:px-6 lg:h-[72px] lg:px-8 xl:px-10">
          <LoadingBar className="h-8 w-[190px]" />

          <div className="hidden gap-6 lg:flex">
            <LoadingBar className="h-3 w-24" />
            <LoadingBar className="h-3 w-20" />
            <LoadingBar className="h-3 w-20" />
            <LoadingBar className="h-3 w-20" />
          </div>

          <LoadingBar className="h-10 w-11 lg:w-28" />
        </div>
      </div>

      <div className="mx-auto min-h-[560px] max-w-[1440px] px-4 py-12 sm:px-5 md:px-6 lg:px-8 lg:py-16 xl:px-10">
        <div className="max-w-[650px]">
          <LoadingBar className="h-7 w-64" />

          <LoadingBar className="mt-6 h-12 w-full max-w-[580px]" />
          <LoadingBar className="mt-3 h-12 w-full max-w-[500px]" />

          <LoadingBar className="mt-6 h-4 w-full max-w-[520px]" />
          <LoadingBar className="mt-2 h-4 w-full max-w-[410px]" />

          <div className="mt-7 flex flex-wrap gap-3">
            <LoadingBar className="h-4 w-28" />
            <LoadingBar className="h-4 w-32" />
            <LoadingBar className="h-4 w-24" />
            <LoadingBar className="h-4 w-36" />
          </div>

          <div className="mt-8 flex gap-3">
            <LoadingBar className="h-12 w-40 rounded-[10px]" />
            <LoadingBar className="h-12 w-40 rounded-[10px]" />
          </div>
        </div>
      </div>

      <span className="sr-only">
        Seite wird geladen…
      </span>
    </div>
  );
}
