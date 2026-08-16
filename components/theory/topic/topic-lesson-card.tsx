import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  PlayCircle,
} from "lucide-react";

export interface TopicLessonCardProps {
  topicSlug: string;
  lesson: {
    id: string;
    slug: string;
    sortOrder: number;
    title: string;
    description: string | null;
    estimatedDurationMinutes: number | null;
    progressPercent: number;
    currentBlockIndex: number;
    completed: boolean;
  };
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function TopicLessonCard({
  topicSlug,
  lesson,
}: TopicLessonCardProps) {
  const progress = clampPercent(lesson.progressPercent);
  const started = progress > 0 && !lesson.completed;

  return (
    <Link
      href={`/theorie/${encodeURIComponent(topicSlug)}/${encodeURIComponent(lesson.slug)}`}
      className="group block rounded-[15px] border border-[#E5EAF2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C8DCF8] hover:shadow-[0_10px_28px_rgba(17,40,70,0.06)]"
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            lesson.completed
              ? "bg-[#EAF8F2] text-[#10A36A]"
              : "bg-[#EEF5FF] text-[#0B63F6]"
          }`}
        >
          {lesson.completed ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#7B899B]">
                Lektion {lesson.sortOrder}
              </p>
              <h3 className="mt-1 text-[12px] font-extrabold leading-5 text-[#081529] group-hover:text-[#0B63F6]">
                {lesson.title}
              </h3>
            </div>

            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#9AA7B7] transition group-hover:translate-x-0.5 group-hover:text-[#0B63F6]" aria-hidden="true" />
          </div>

          {lesson.description ? (
            <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#66758A]">
              {lesson.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-semibold text-[#748397]">
            {lesson.estimatedDurationMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" aria-hidden="true" />
                ca. {lesson.estimatedDurationMinutes} Min.
              </span>
            ) : null}

            <span>
              {lesson.completed
                ? "Abgeschlossen"
                : started
                  ? `${progress}% bearbeitet`
                  : "Noch nicht begonnen"}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                lesson.completed ? "bg-[#10A36A]" : "bg-[#0B63F6]"
              }`}
              style={{ width: `${lesson.completed ? 100 : progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
