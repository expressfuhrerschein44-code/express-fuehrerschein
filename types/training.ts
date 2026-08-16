export type TrainingPageStatus =
  | "ready"
  | "no_active_license_class"
  | "no_published_program";

export interface TrainingOverviewView {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  needsReviewCount: number;
  accuracyPercent: number;
  completedSessions: number;
  lastTrainingAt: string | null;
}

export interface TrainingTopicView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
  answeredQuestions: number;
  progressPercent: number;
}

export interface TrainingPageData {
  status: TrainingPageStatus;
  licenseClassCode: string | null;
  overview: TrainingOverviewView;
  topics: TrainingTopicView[];
}
