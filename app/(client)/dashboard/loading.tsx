/**
 * Express-Führerschein
 * Dashboard loading state.
 *
 * Mirrors the final PC/mobile architecture instead of showing
 * a disconnected full-page spinner.
 */

function SkeletonBlock({
  className =
    "",
}: {
  className?:
    string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-[#E9EEF4] ${className}`}
    />
  );
}

function DesktopStatCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <SkeletonBlock
        className="h-3 w-28"
      />

      <SkeletonBlock
        className="mt-5 h-9 w-20"
      />

      <SkeletonBlock
        className="mt-5 h-2.5 w-full rounded-full"
      />

      <div
        className="mt-3 flex justify-between"
      >
        <SkeletonBlock
          className="h-2.5 w-16"
        />

        <SkeletonBlock
          className="h-2.5 w-14"
        />
      </div>
    </div>
  );
}

function DesktopWideCardSkeleton({
  rows =
    3,
}: {
  rows?:
    number;
}) {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <div
        className="flex items-center justify-between gap-4"
      >
        <SkeletonBlock
          className="h-3.5 w-36"
        />

        <SkeletonBlock
          className="h-2.5 w-16"
        />
      </div>

      <div
        className="mt-5 space-y-3"
      >
        {Array.from(
          {
            length:
              rows,
          },
          (
            _,
            index,
          ) => (
            <div
              key={
                index
              }
              className="flex items-center gap-3"
            >
              <SkeletonBlock
                className="h-9 w-9 shrink-0 rounded-full"
              />

              <SkeletonBlock
                className="h-2.5 flex-1"
              />

              <SkeletonBlock
                className="h-8 w-20"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DesktopSideCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <SkeletonBlock
        className="h-3.5 w-28"
      />

      <div
        className="mt-5 flex gap-3"
      >
        <SkeletonBlock
          className="h-10 w-10 shrink-0"
        />

        <div
          className="flex-1 space-y-2"
        >
          <SkeletonBlock
            className="h-2.5 w-4/5"
          />

          <SkeletonBlock
            className="h-2.5 w-3/5"
          />

          <SkeletonBlock
            className="h-2.5 w-2/5"
          />
        </div>
      </div>

      <SkeletonBlock
        className="mt-5 h-9 w-full"
      />
    </div>
  );
}

function DashboardDesktopLoading() {
  return (
    <div
      className="hidden lg:block"
    >
      <div
        className="mx-auto w-full max-w-[1440px] px-6 py-6 xl:px-7"
      >
        <div
          className="grid grid-cols-4 gap-4"
        >
          {Array.from(
            {
              length:
                4,
            },
            (
              _,
              index,
            ) => (
              <DesktopStatCardSkeleton
                key={
                  index
                }
              />
            ),
          )}
        </div>

        <div
          className="mt-5 grid grid-cols-[minmax(0,2fr)_minmax(280px,0.8fr)] gap-4"
        >
          <div
            className="space-y-4"
          >
            <DesktopWideCardSkeleton
              rows={
                5
              }
            />

            <DesktopWideCardSkeleton
              rows={
                3
              }
            />

            <DesktopWideCardSkeleton
              rows={
                5
              }
            />

            <DesktopWideCardSkeleton
              rows={
                3
              }
            />
          </div>

          <div
            className="space-y-4"
          >
            <DesktopSideCardSkeleton />
            <DesktopWideCardSkeleton
              rows={
                2
              }
            />
            <DesktopSideCardSkeleton />
          </div>
        </div>

        <div
          className="mt-4 rounded-2xl border border-[#E3E8EF] bg-white px-5 py-4"
        >
          <div
            className="flex items-center justify-between gap-6"
          >
            <div
              className="space-y-2"
            >
              <SkeletonBlock
                className="h-3 w-48"
              />

              <SkeletonBlock
                className="h-2.5 w-64"
              />
            </div>

            <div
              className="flex gap-4"
            >
              <SkeletonBlock
                className="h-7 w-16"
              />

              <SkeletonBlock
                className="h-7 w-16"
              />

              <SkeletonBlock
                className="h-7 w-16"
              />

              <SkeletonBlock
                className="h-8 w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileCardSkeleton({
  height =
    "h-36",
}: {
  height?:
    string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E3E8EF] bg-white p-4 ${height}`}
    >
      <SkeletonBlock
        className="h-3 w-28"
      />

      <SkeletonBlock
        className="mt-4 h-7 w-20"
      />

      <SkeletonBlock
        className="mt-4 h-2 w-full rounded-full"
      />

      <SkeletonBlock
        className="mt-3 h-2.5 w-2/3"
      />
    </div>
  );
}

function DashboardMobileLoading() {
  return (
    <div
      className="lg:hidden"
    >
      <div
        className="space-y-3 px-3 py-4"
      >
        <MobileCardSkeleton />

        <div
          className="grid grid-cols-2 gap-3"
        >
          <MobileCardSkeleton
            height="h-40"
          />

          <MobileCardSkeleton
            height="h-40"
          />
        </div>

        {Array.from(
          {
            length:
              7,
          },
          (
            _,
            index,
          ) => (
            <MobileCardSkeleton
              key={
                index
              }
              height={
                index ===
                0
                  ? "h-32"
                  : "h-44"
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Dashboard wird geladen"
    >
      <DashboardDesktopLoading />
      <DashboardMobileLoading />
    </div>
  );
}
