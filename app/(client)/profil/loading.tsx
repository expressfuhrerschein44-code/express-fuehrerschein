/**
 * Express-Führerschein
 * Profile loading state.
 *
 * The skeleton mirrors the final desktop/mobile Profile architecture.
 * It contains no fake personal data.
 */

function Skeleton({
  className =
    "",
}: {
  className?:
    string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[#E8EDF3] ${className}`}
    />
  );
}

/* ==========================================================================
   DESKTOP
   ========================================================================== */

function DesktopTrustSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <div
        className="grid grid-cols-[1.2fr_repeat(3,1fr)] items-center gap-6"
      >
        <div>
          <Skeleton
            className="h-3 w-44"
          />

          <Skeleton
            className="mt-3 h-2.5 w-52"
          />
        </div>

        {Array.from(
          {
            length:
              3,
          },
          (
            _,
            index,
          ) => (
            <div
              key={
                index
              }
            >
              <Skeleton
                className="h-8 w-24"
              />

              <Skeleton
                className="mt-2 h-2.5 w-20"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DesktopSummarySkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <Skeleton
        className="mx-auto h-28 w-28 rounded-full"
      />

      <Skeleton
        className="mx-auto mt-5 h-4 w-40"
      />

      <Skeleton
        className="mx-auto mt-3 h-2.5 w-32"
      />

      <Skeleton
        className="mx-auto mt-4 h-7 w-24"
      />

      <div
        className="mt-5 flex justify-center gap-2"
      >
        <Skeleton
          className="h-8 w-24"
        />

        <Skeleton
          className="h-8 w-20"
        />
      </div>
    </div>
  );
}

function DesktopActionSkeleton({
  rows =
    2,
}: {
  rows?:
    number;
}) {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <Skeleton
        className="mx-2 h-3 w-20"
      />

      <div
        className="mt-3 space-y-2"
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
              className="flex items-center gap-3 px-2 py-2"
            >
              <Skeleton
                className="h-9 w-9 shrink-0"
              />

              <Skeleton
                className="h-3 flex-1"
              />

              <Skeleton
                className="h-3 w-12"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DesktopPersonalSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <div
        className="flex items-center justify-between"
      >
        <Skeleton
          className="h-4 w-44"
        />

        <Skeleton
          className="h-8 w-20"
        />
      </div>

      <div
        className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5"
      >
        {Array.from(
          {
            length:
              8,
          },
          (
            _,
            index,
          ) => (
            <div
              key={
                index
              }
              className="border-b border-[#E8EDF3] pb-3"
            >
              <Skeleton
                className="h-2.5 w-20"
              />

              <Skeleton
                className="mt-3 h-3 w-4/5"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DesktopAdditionalSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
    >
      <Skeleton
        className="h-4 w-48"
      />

      <div
        className="mt-5 space-y-1"
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
            <div
              key={
                index
              }
              className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-3 border-b border-[#E9EDF2] py-3 last:border-b-0"
            >
              <Skeleton
                className="h-8 w-8"
              />

              <div
                className="grid grid-cols-2 gap-6"
              >
                <Skeleton
                  className="h-3 w-32"
                />

                <Skeleton
                  className="h-3 w-28"
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ProfileDesktopLoading() {
  return (
    <div
      className="hidden lg:block"
    >
      <div
        className="mx-auto w-full max-w-[1440px] px-6 py-6 xl:px-7"
      >
        <Skeleton
          className="h-2.5 w-32"
        />

        <Skeleton
          className="mt-5 h-7 w-36"
        />

        <Skeleton
          className="mt-3 h-2.5 w-80"
        />

        <div
          className="mt-6"
        >
          <DesktopTrustSkeleton />
        </div>

        <div
          className="mt-5 grid grid-cols-[300px_minmax(0,1fr)] gap-4"
        >
          <aside
            className="space-y-4"
          >
            <DesktopSummarySkeleton />

            <DesktopActionSkeleton />

            <DesktopActionSkeleton />
          </aside>

          <main
            className="space-y-4"
          >
            <DesktopPersonalSkeleton />

            <DesktopAdditionalSkeleton />
          </main>
        </div>

        <Skeleton
          className="mx-auto mt-10 h-2.5 w-72"
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   MOBILE
   ========================================================================== */

function MobileCardSkeleton({
  height =
    "h-40",
}: {
  height?:
    string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E3E8EF] bg-white p-4 ${height}`}
    >
      <Skeleton
        className="h-3 w-36"
      />

      <Skeleton
        className="mt-4 h-3 w-4/5"
      />

      <Skeleton
        className="mt-3 h-3 w-3/5"
      />
    </div>
  );
}

function ProfileMobileLoading() {
  return (
    <div
      className="lg:hidden"
    >
      <div
        className="space-y-3 px-3 py-4"
      >
        <header
          className="px-1 py-2"
        >
          <Skeleton
            className="h-6 w-28"
          />

          <Skeleton
            className="mt-3 h-2.5 w-64"
          />

          <Skeleton
            className="mt-2 h-2.5 w-48"
          />
        </header>

        <MobileCardSkeleton
          height="h-28"
        />

        <div
          className="rounded-2xl border border-[#E3E8EF] bg-white p-4 text-center"
        >
          <Skeleton
            className="mx-auto h-20 w-20 rounded-full"
          />

          <Skeleton
            className="mx-auto mt-4 h-4 w-36"
          />

          <Skeleton
            className="mx-auto mt-3 h-2.5 w-28"
          />

          <Skeleton
            className="mx-auto mt-4 h-7 w-24"
          />
        </div>

        <MobileCardSkeleton
          height="h-40"
        />

        <MobileCardSkeleton
          height="h-[420px]"
        />

        <MobileCardSkeleton
          height="h-64"
        />

        <MobileCardSkeleton
          height="h-40"
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   EXPORT
   ========================================================================== */

export default function ProfileLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Profil wird geladen"
    >
      <ProfileDesktopLoading />
      <ProfileMobileLoading />
    </div>
  );
}
