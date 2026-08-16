/**
 * Express-Führerschein
 * Theorie route skeleton.
 */

export default function TheorieLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 py-5 lg:px-7 lg:py-7">
      <div className="animate-pulse">
        <div className="h-6 w-44 rounded bg-[#E9EEF5]" />
        <div className="mt-2 h-3 w-[420px] max-w-full rounded bg-[#EEF2F7]" />

        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          {Array.from({
            length:
              4,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="h-[190px] rounded-[16px] border border-[#E5EAF2] bg-white p-4"
              >
                <div className="h-3 w-28 rounded bg-[#E9EEF5]" />
                <div className="mt-5 h-20 rounded-xl bg-[#F1F4F8]" />
                <div className="mt-4 h-9 rounded-lg bg-[#EEF2F7]" />
              </div>
            ),
          )}
        </div>

        <div className="mt-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4">
          <div className="h-3 w-32 rounded bg-[#E9EEF5]" />

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length:
                6,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-28 rounded-[14px] bg-[#F3F6FA]"
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
