import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from "lucide-react";

export interface LessonHeaderProps {
  topicSlug: string;
  title: string;
  description?: string | null;
  licenseClassCode?: string | null;
  estimatedDurationMinutes?: number | null;
  completed?: boolean;
  lessonPosition?: number | null;
  lessonTotal?: number | null;
}

export function LessonHeader({
  topicSlug,
  title,
  description = null,
  licenseClassCode = null,
  estimatedDurationMinutes = null,
  completed = false,
  lessonPosition = null,
  lessonTotal = null,
}: LessonHeaderProps) {
  const topicHref = `/theorie/${encodeURIComponent(topicSlug)}`;

  return (
    <header className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.035)] sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={topicHref}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1 text-[10px] font-extrabold text-[#53647A] transition hover:text-[#0B63F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zum Thema
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {licenseClassCode ? (
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[#F4F7FB] px-2.5 text-[9px] font-extrabold text-[#465970]">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Klasse {licenseClassCode}
            </span>
          ) : null}

          {completed ? (
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[#EFFAF5] px-2.5 text-[9px] font-extrabold text-[#0B8B59]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Abgeschlossen
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 max-w-[760px]">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.09em] text-[#718094]">
          {lessonPosition && lessonTotal
            ? `Lektion ${lessonPosition} von ${lessonTotal}`
            : "Theorie-Lektion"}
        </p>

        <h1 className="mt-1.5 text-[22px] font-black leading-[1.2] tracking-[-0.02em] text-[#081529] sm:text-[25px] lg:text-[28px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-[680px] text-[11px] leading-5 text-[#66758A] sm:text-[12px] sm:leading-6">
            {description}
          </p>
        ) : null}

        {estimatedDurationMinutes && estimatedDurationMinutes > 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-bold text-[#718094]">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Ca. {estimatedDurationMinutes} Minuten
          </p>
        ) : null}
      </div>
    </header>
  );
}
