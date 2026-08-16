import { cn } from "@/lib/utils";
import type { HomeReview } from "@/types/review";

export interface ReviewCardProps {
  review: HomeReview;
}

function Stars({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const safeMax = Math.max(1, Math.round(max));
  const active = Math.round(value);

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value} von ${max} Sternen`}
    >
      {Array.from({ length: safeMax }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            index < active
              ? "text-[#FFB21A]"
              : "text-[#D8DEE8]",
          )}
          fill="currentColor"
        >
          <path d="m10 1.9 2.45 4.96 5.48.8-3.96 3.86.94 5.45L10 14.39l-4.91 2.58.94-5.45-3.96-3.86 5.48-.8L10 1.9Z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCard({
  review,
}: ReviewCardProps) {
  const displayName = review.author.lastNameInitial
    ? `${review.author.firstName} ${review.author.lastNameInitial}`
    : review.author.firstName;

  return (
    <article className="flex h-full min-w-[280px] flex-col rounded-[16px] border border-[#E1E7EF] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.05)] sm:min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-extrabold text-[#071426]">
            {displayName}
          </p>

          <p className="mt-0.5 text-[10px] text-[#7A889B]">
            {review.licenseClassLabel ?? review.licenseClassCode ?? ""}
          </p>
        </div>

        {review.verified ? (
          <span className="rounded-full bg-[#EAF9F3] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.04em] text-[#087B57]">
            Verifiziert
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <Stars
          value={review.rating.value}
          max={review.rating.max}
        />
      </div>

      <p className="mt-4 flex-1 text-[12px] leading-5 text-[#5F6E82]">
        “{review.comment}”
      </p>
    </article>
  );
}
