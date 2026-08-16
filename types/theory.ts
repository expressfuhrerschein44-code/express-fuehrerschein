/**
 * Express-Führerschein
 * Serializable client contracts for the Theorie experience.
 *
 * IMPORTANT:
 * - no Prisma types here;
 * - no server-only imports here;
 * - safe to cross the Server Component -> Client Component boundary;
 * - no correct-answer payload is included in public question data.
 */

export type TheoryOverviewStatus =
  | "ready"
  | "license_class_required"
  | "country_program_unavailable";

export type TheoryTopicState =
  | "not_started"
  | "in_progress"
  | "completed"
  | "review";

export type TheoryReadinessLabel =
  | "weiter_ueben"
  | "fast_bereit"
  | "sehr_gut";

export interface TheoryProgressView {
  overallPercent: number;
  questionCoveragePercent: number;
  averageTopicProgressPercent: number;
  completedTopics: number;
  totalTopics: number;
  completedLessons: number;
  currentDay: number;
  completedDays: number;
  lastActivityAt: string | null;
}

export interface TheoryStatisticsView {
  activeQuestions: number;
  uniqueQuestionsLearned: number;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyPercent: number;
  questionsToReview: number;
  masteredQuestions: number;
  totalStudyMinutes: number;
  completedExamCount: number;
  passedExamCount: number;
  averageExamScorePercent: number;
}

export interface TheoryReadinessView {
  readinessPercent: number;
  label: TheoryReadinessLabel;
  topicMasteryPercent: number;
  recentPerformancePercent: number;
  mockExamPercent: number;
  errorReductionPercent: number;
  courseCompletionPercent: number;
}

export interface TheoryTopicView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  progressPercent: number;
  masteryScore: number;
  state: TheoryTopicState;
  lastTrainedAt: string | null;
}

export interface TheoryContinueLearningView {
  topicId: string;
  title: string;
  href: string;
  progressPercent: number;
  lastActivityAt: string | null;
}

export type TheoryRecommendationKind =
  | "continue_topic"
  | "review_errors"
  | "weak_topic"
  | "mock_exam"
  | "start_learning";

export interface TheoryRecommendationView {
  id: string;
  kind: TheoryRecommendationKind;
  title: string;
  description: string;
  href: string;
  priority: number;
}

export interface TheoryRecentExamView {
  id: string;
  passed: boolean | null;
  scorePercent: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface TheoryNextExamRecommendation {
  recommendedAt: string | null;
  label: string;
  href: string;
}

export interface TheoryOverviewData {
  status: TheoryOverviewStatus;
  countryCode: string;
  licenseClassCode: string | null;
  progress: TheoryProgressView;
  statistics: TheoryStatisticsView;
  readiness: TheoryReadinessView;
  topics: readonly TheoryTopicView[];
  continueLearning: TheoryContinueLearningView | null;
  recommendations: readonly TheoryRecommendationView[];
  recentExams: readonly TheoryRecentExamView[];
  nextExamRecommendation?: TheoryNextExamRecommendation | null;
}

export type LessonContentBlockType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "INFO"
  | "WARNING"
  | "TIP"
  | "EXAMPLE"
  | "QUESTION";

export interface LessonContentBlockView {
  id: string;
  type: LessonContentBlockType;
  title?: string | null;
  text?: string | null;
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  questionId?: string | null;
}

export interface TheoryLessonView {
  id: string;
  topicSlug: string;
  title: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  progressPercent: number;
  currentBlockIndex: number;
  blocks: readonly LessonContentBlockView[];
}

export type TheoryQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "IMAGE_CHOICE"
  | "VIDEO"
  | "NUMERIC";

export interface TheoryQuestionOptionView {
  id: string;
  label: string;
  imageUrl?: string | null;
}

export interface TheoryQuestionView {
  id: string;
  topicId: string;
  questionType: TheoryQuestionType | string;
  penaltyPoints: number;
  mediaUrl?: string | null;
  prompt: string;
  options: readonly TheoryQuestionOptionView[];
  position?: number;
  totalQuestions?: number;
  favorite?: boolean;
}

export interface TheoryQuestionResultView {
  correct: boolean;
  explanation: string | null;
  correctOptionIds?: readonly string[];
}

export interface TheoryPracticeSessionView {
  id: string;
  title: string;
  mode: "random" | "topic" | "errors" | "quick";
  questionIds: readonly string[];
  currentIndex: number;
  answeredCount: number;
  correctCount: number;
  completed: boolean;
}

export interface TheoryExamRuleView {
  label: string;
  value: string;
}

export interface TheoryExamSessionView {
  id: string;
  title: string;
  questionIds: readonly string[];
  currentIndex: number;
  answeredCount: number;
  durationSeconds: number;
  remainingSeconds: number;
  completed: boolean;
  rules: readonly TheoryExamRuleView[];
}

export interface TheoryExamResultView {
  attemptId: string;
  passed: boolean;
  scorePercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
}
