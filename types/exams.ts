export type ExamsPageStatus =
  | "ready"
  | "no_active_license_class"
  | "no_published_program"
  | "no_exam_configuration";

export interface ExamPassingRuleView {
  requireAllAnswered: boolean;
  minimumScorePercent: number | null;
  maximumPenaltyPoints: number | null;
  failOnTwoFivePointErrors: boolean;
  trainingOnly: boolean;
  officialTheoryExamRequired: boolean | null;
}

export interface ExamConfigurationView {
  id: string;
  version: string;
  questionCount: number;
  durationSeconds: number;
  durationMinutes: number;
  scoringMethod: string;
  passingRule: ExamPassingRuleView;
  trainingOnly: boolean;
}

export interface ExamHistoryItemView {
  id: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  scorePercent: number | null;
  passed: boolean | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ExamsOverviewView {
  completedAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passRatePercent: number | null;
  averageScorePercent: number | null;
  readinessScore: number;
}

export interface ExamsPageData {
  status: ExamsPageStatus;
  licenseClassCode: string | null;
  configuration: ExamConfigurationView | null;
  overview: ExamsOverviewView;
  history: ExamHistoryItemView[];
  activeAttemptId: string | null;
}

export type ExamQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "IMAGE_CHOICE"
  | "VIDEO"
  | "NUMERIC";

export interface ExamQuestionOptionView {
  id: string;
  label: string;
  imageUrl: string | null;
}

export interface ExamQuestionView {
  id: string;
  position: number;
  totalQuestions: number;
  questionType: ExamQuestionType;
  penaltyPoints: number;
  prompt: string;
  mediaUrl: string | null;
  options: ExamQuestionOptionView[];
  answerPayload: unknown;
  answered: boolean;
}

export interface ExamAttemptProgressView {
  id: string;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  startedAt: string;
  completedAt: string | null;
}

export interface ExamResultQuestionView {
  id: string;
  position: number;
  prompt: string;
  penaltyPoints: number;
  isCorrect: boolean | null;
  selectedAnswerLabels: string[];
  correctAnswerLabels: string[];
  explanation: string | null;
}

export interface ExamResultView {
  attemptId: string;
  trainingOnly: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  scorePercent: number;
  passed: boolean | null;
  startedAt: string;
  completedAt: string | null;
  review: ExamResultQuestionView[];
}

export interface ExamAttemptPageData {
  licenseClassCode: string;
  configuration: ExamConfigurationView;
  attempt: ExamAttemptProgressView;
  remainingSeconds: number;
  questions: ExamQuestionView[];
  result: ExamResultView | null;
}

export interface ExamApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ExamApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type ExamApiResponse<T> =
  | ExamApiSuccess<T>
  | ExamApiError;
