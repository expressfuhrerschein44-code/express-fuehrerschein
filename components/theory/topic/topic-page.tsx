import { TopicHeader } from "@/components/theory/topic/topic-header";
import { TopicLessonsList } from "@/components/theory/topic/topic-lessons-list";
import { TopicPracticeCard } from "@/components/theory/topic/topic-practice-card";
import { TopicProgress } from "@/components/theory/topic/topic-progress";
import { TopicReviewCard } from "@/components/theory/topic/topic-review-card";

export interface TopicPageProps {
  topic: {
    id: string;
    slug: string;
    sortOrder: number;
    title: string;
    description: string | null;
    countryCode: "DE";
    licenseClassCode: string;
    questionCount: number;
    lessonCount: number;
    reviewQuestions: number;
    masteredQuestions: number;
    progress: {
      answeredQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      progressPercent: number;
      masteryScore: number;
      lastTrainedAt: string | null;
    };
    lessons: readonly {
      id: string;
      topicId: string;
      slug: string;
      sortOrder: number;
      title: string;
      description: string | null;
      estimatedDurationMinutes: number | null;
      progressPercent: number;
      currentBlockIndex: number;
      completed: boolean;
      lastActivityAt: string | null;
    }[];
  };
}

export function TopicPage({ topic }: TopicPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 lg:px-7 lg:py-7">
      <TopicHeader
        sortOrder={topic.sortOrder}
        title={topic.title}
        description={topic.description}
        licenseClassCode={topic.licenseClassCode}
        lessonCount={topic.lessonCount}
        questionCount={topic.questionCount}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0 space-y-4">
          <TopicProgress
            progressPercent={topic.progress.progressPercent}
            masteryScore={topic.progress.masteryScore}
            answeredQuestions={topic.progress.answeredQuestions}
            questionCount={topic.questionCount}
            correctAnswers={topic.progress.correctAnswers}
            reviewQuestions={topic.reviewQuestions}
            masteredQuestions={topic.masteredQuestions}
          />

          <TopicLessonsList
            topicSlug={topic.slug}
            lessons={topic.lessons}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <TopicPracticeCard
            topicId={topic.id}
            title={topic.title}
            questionCount={topic.questionCount}
          />

          <TopicReviewCard
            topicId={topic.id}
            reviewQuestions={topic.reviewQuestions}
            masteryScore={topic.progress.masteryScore}
          />
        </aside>
      </div>
    </div>
  );
}
