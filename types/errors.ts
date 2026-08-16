export type ErrorsPageStatus =
  | "ready"
  | "no_active_license_class"
  | "no_published_program";

export interface ErrorsOverviewView {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  needsReviewCount: number;
  masteredQuestions: number;
  accuracyPercent: number;
}

export interface ErrorQuestionView {
  id: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  prompt: string;
  penaltyPoints: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnswerCorrect: boolean | null;
  isMastered: boolean;
  needsReview: boolean;
  lastAnsweredAt: string | null;
}

export interface ErrorsPageData {
  status: ErrorsPageStatus;
  licenseClassCode: string | null;
  overview: ErrorsOverviewView;
  questions: ErrorQuestionView[];
}
