import { BookOpenText } from "lucide-react";
import { TopicLessonCard } from "@/components/theory/topic/topic-lesson-card";

export interface TopicLessonsListProps {
  topicSlug: string;
  lessons: readonly {
    id: string;
    slug: string;
    sortOrder: number;
    title: string;
    description: string | null;
    estimatedDurationMinutes: number | null;
    progressPercent: number;
    currentBlockIndex: number;
    completed: boolean;
  }[];
}

export function TopicLessonsList({
  topicSlug,
  lessons,
}: TopicLessonsListProps) {
  return (
    <section
      aria-labelledby="topic-lessons-title"
      className="rounded-[18px] border border-[#E5EAF2] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
            Lerninhalte
          </p>
          <h2
            id="topic-lessons-title"
            className="mt-1 text-[15px] font-extrabold text-[#081529]"
          >
            Lektionen
          </h2>
        </div>

        <span className="rounded-full bg-[#F2F5F9] px-2.5 py-1 text-[9px] font-extrabold text-[#66758A]">
          {lessons.length}
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="mt-4 rounded-[14px] border border-dashed border-[#D9E1EB] bg-[#F8FAFD] px-5 py-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7C8B9E] shadow-sm">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[11px] font-extrabold text-[#081529]">
            Noch keine veröffentlichten Lektionen.
          </p>
          <p className="mx-auto mt-1 max-w-[440px] text-[9px] leading-4 text-[#66758A]">
            Sobald Lektionen für dieses deutsche Theorieprogramm veröffentlicht sind, erscheinen sie automatisch hier.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {lessons.map((lesson) => (
            <TopicLessonCard
              key={lesson.id}
              topicSlug={topicSlug}
              lesson={lesson}
            />
          ))}
        </div>
      )}
    </section>
  );
}
