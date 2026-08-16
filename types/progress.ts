export type ProgressPageStatus =
  | "ready"
  | "no_active_license_class"
  | "no_published_program";

export type ProgressDayStatus =
  | "completed"
  | "in_progress"
  | "available"
  | "locked";

export interface ProgressOverviewView {
  currentDay: number;
  totalDays: number;
  completedDays: number;
  totalStudyMinutes: number;
  answeredQuestions: number;
  readinessScore: number;
  lastActivityAt: string | null;
}

export interface ProgressDayView {
  dayNumber: number;
  status: ProgressDayStatus;
  plannedDate: string | null;
  studyMinutes: number;
  score: number | null;
}

export interface ProgressTheoryView {
  totalLessons: number;
  completedLessons: number;
  lessonCompletionPercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  questionCoveragePercent: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyPercent: number;
  needsReviewCount: number;
}

export interface ProgressTrainingView {
  completedSessions: number;
  totalQuestionsAnswered: number;
  totalDurationMinutes: number;
  averageScorePercent: number | null;
  lastTrainingAt: string | null;
  lastScorePercent: number | null;
}

export interface ProgressExamView {
  completedAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passRatePercent: number | null;
  averageScorePercent: number | null;
  lastAttemptAt: string | null;
  lastScorePercent: number | null;
  lastAttemptPassed: boolean | null;
}

export interface ProgressTopicView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  progressPercent: number;
  masteryScore: number;
  lastTrainedAt: string | null;
}

export interface ProgressPageData {
  status: ProgressPageStatus;
  licenseClassCode: string | null;
  overview: ProgressOverviewView;
  days: ProgressDayView[];
  theory: ProgressTheoryView;
  training: ProgressTrainingView;
  exam: ProgressExamView;
  topics: ProgressTopicView[];
}
