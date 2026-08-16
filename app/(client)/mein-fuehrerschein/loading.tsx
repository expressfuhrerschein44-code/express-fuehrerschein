/**
 * Express-Führerschein
 * Loading state for "Mein Führerschein".
 */

function SkeletonLine({
  className =
    "",
}: {
  className?:
    string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#E9EEF5] ${className}`}
    />
  );
}

export default function MeinFuehrerscheinLoading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] pb-6">
      <div className="mb-4">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonLine className="mt-3 h-5 w-72 max-w-[75%]" />
        <SkeletonLine className="mt-2 h-3 w-96 max-w-[90%]" />
      </div>

      <div className="mb-4 animate-pulse rounded-2xl border border-[#E3E9F1] bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <SkeletonLine className="h-10" />
          <SkeletonLine className="h-10" />
          <SkeletonLine className="h-10" />
          <SkeletonLine className="h-10" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="animate-pulse rounded-2xl border border-[#E6EBF1] bg-white p-4">
          <SkeletonLine className="h-4 w-56" />

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from(
              {
                length:
                  6,
              },
            ).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="space-y-2"
                >
                  <SkeletonLine className="h-3 w-16" />
                  <SkeletonLine className="h-4 w-full" />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="animate-pulse rounded-2xl border border-[#E6EBF1] bg-white p-4">
          <SkeletonLine className="h-4 w-64" />

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from(
              {
                length:
                  6,
              },
            ).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="rounded-xl border border-[#E7ECF2] p-3"
                >
                  <SkeletonLine className="mx-auto h-12 w-20" />
                  <SkeletonLine className="mx-auto mt-3 h-3 w-16" />
                  <SkeletonLine className="mx-auto mt-2 h-3 w-12" />
                  <SkeletonLine className="mx-auto mt-3 h-4 w-14" />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="animate-pulse rounded-2xl border border-[#E6EBF1] bg-white p-4">
            <SkeletonLine className="h-4 w-52" />
            <SkeletonLine className="mt-5 h-10 w-full" />
            <SkeletonLine className="mt-3 h-10 w-full" />
          </div>

          <div className="animate-pulse rounded-2xl border border-[#E6EBF1] bg-white p-4">
            <SkeletonLine className="h-4 w-44" />
            <SkeletonLine className="mt-5 h-12 w-full" />
            <SkeletonLine className="mt-2 h-12 w-full" />
            <SkeletonLine className="mt-2 h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
