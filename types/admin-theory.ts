/**
 * Express-Führerschein
 * Shared view/API contracts for the Admin Theorie module.
 *
 * Application-layer types only. Prisma models remain the source of truth.
 */

export type AdminTheoryEntityStatus = string;

export interface AdminTheoryTranslationView {
  locale: string;
  title: string;
  description: string | null;
}

export interface AdminTheoryProgramView {
  id: string;
  countryCode: string;
  licenseClassCode: string;
  code: string;
  version: string;
  status: AdminTheoryEntityStatus;
  isCurrent: boolean;
  validFrom: string | null;
  validUntil: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    topics: number;
    lessons: number;
    questions: number;
    exams: number;
  };
}

export interface AdminTheoryTopicView {
  id: string;
  programId: string;
  countryCode: string;
  licenseClassCode: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  title: string;
  description: string | null;
  translations: AdminTheoryTranslationView[];
  createdAt: string;
  updatedAt: string;
  counts: {
    lessons: number;
    questions: number;
  };
}

export interface AdminTheoryLessonBlockTranslationView {
  locale: string;
  title: string | null;
  bodyText: string | null;
  contentJson: unknown | null;
}

export interface AdminTheoryLessonBlockView {
  id: string;
  blockType: string;
  sortOrder: number;
  mediaStoragePath: string | null;
  questionId: string | null;
  configJson: unknown | null;
  isActive: boolean;
  translations: AdminTheoryLessonBlockTranslationView[];
}

export interface AdminTheoryLessonView {
  id: string;
  topicId: string;
  programId: string;
  programCode: string;
  topicTitle: string;
  slug: string;
  sortOrder: number;
  estimatedDurationMinutes: number | null;
  status: AdminTheoryEntityStatus;
  version: number;
  validFrom: string | null;
  validUntil: string | null;
  publishedAt: string | null;
  title: string;
  description: string | null;
  translations: AdminTheoryTranslationView[];
  contentBlocks: AdminTheoryLessonBlockView[];
  createdAt: string;
  updatedAt: string;
  counts: {
    blocks: number;
    learners: number;
  };
}

export interface AdminTheoryQuestionTranslationView {
  locale: string;
  prompt: string;
  explanation: string | null;
  answerOptions: unknown | null;
  correctAnswer: unknown | null;
}

export interface AdminTheoryQuestionView {
  id: string;
  topicId: string;
  programId: string;
  programCode: string;
  topicTitle: string;
  externalRef: string | null;
  questionType: string;
  penaltyPoints: number;
  mediaStoragePath: string | null;
  isActive: boolean;
  status: AdminTheoryEntityStatus;
  version: number;
  difficulty: string;
  validFrom: string | null;
  validUntil: string | null;
  publishedAt: string | null;
  prompt: string;
  explanation: string | null;
  translations: AdminTheoryQuestionTranslationView[];
  createdAt: string;
  updatedAt: string;
  counts: {
    answers: number;
    reports: number;
  };
}

export interface AdminTheoryExamView {
  id: string;
  programId: string;
  programCode: string;
  countryCode: string;
  licenseClassCode: string;
  version: string;
  questionCount: number;
  durationSeconds: number;
  scoringMethod: string;
  passingRule: unknown;
  status: AdminTheoryEntityStatus;
  activeFrom: string | null;
  activeUntil: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: number;
}

export interface AdminTheoryReportView {
  id: string;
  reason: string;
  message: string | null;
  status: AdminTheoryEntityStatus;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  question: {
    id: string;
    prompt: string;
    topicTitle: string;
  };
  candidate: {
    userLicenseClassId: string;
    userId: string;
    fullName: string;
    email: string;
    licenseClassCode: string;
  };
  resolvedBy: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface AdminTheoryCandidateView {
  userLicenseClassId: string;
  userId: string;
  fullName: string;
  email: string;
  countryCode: string;
  licenseClassCode: string;
  classStatus: string;
  isPrimary: boolean;
  startedAt: string;
  targetExamDate: string | null;
  progress: {
    currentDay: number | null;
    completedDays: number;
    completedLessons: number;
    answeredQuestions: number;
    correctAnswers: number;
    readinessScore: number;
    totalStudyMinutes: number;
    lastActivityAt: string | null;
  };
  metrics: {
    topicsStarted: number;
    lessonsStarted: number;
    lessonsCompleted: number;
    questionRows: number;
    questionsNeedsReview: number;
    masteredQuestions: number;
    simulations: number;
    simulationsPassed: number;
    activeStudySeconds: number;
  };
}

export interface AdminTheoryStatsView {
  programs: number;
  currentPrograms: number;
  activeTopics: number;
  lessons: number;
  publishedLessons: number;
  questions: number;
  publishedQuestions: number;
  openReports: number;
  candidates: number;
}

export interface AdminTheoryPageData {
  programs: AdminTheoryProgramView[];
  topics: AdminTheoryTopicView[];
  lessons: AdminTheoryLessonView[];
  questions: AdminTheoryQuestionView[];
  exams: AdminTheoryExamView[];
  reports: AdminTheoryReportView[];
  candidates: AdminTheoryCandidateView[];
  stats: AdminTheoryStatsView;
  generatedAt: string;
}

export interface AdminTheoryProgramInput {
  countryCode: string;
  licenseClassCode: string;
  code: string;
  version: string;
  status?: string;
  isCurrent: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export interface AdminTheoryTranslationInput {
  locale: string;
  title: string;
  description: string | null;
}

export interface AdminTheoryTopicInput {
  programId: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  translations: AdminTheoryTranslationInput[];
}

export interface AdminTheoryLessonBlockTranslationInput {
  locale: string;
  title: string | null;
  bodyText: string | null;
  contentJson: unknown | null;
}

export interface AdminTheoryLessonBlockInput {
  id?: string | null;
  blockType: string;
  sortOrder: number;
  mediaStoragePath: string | null;
  questionId: string | null;
  configJson: unknown | null;
  isActive: boolean;
  translations: AdminTheoryLessonBlockTranslationInput[];
}

export interface AdminTheoryLessonInput {
  topicId: string;
  slug: string;
  sortOrder: number;
  estimatedDurationMinutes: number | null;
  status?: string;
  validFrom: string | null;
  validUntil: string | null;
  translations: AdminTheoryTranslationInput[];
  contentBlocks: AdminTheoryLessonBlockInput[];
}

export interface AdminTheoryQuestionTranslationInput {
  locale: string;
  prompt: string;
  explanation: string | null;
  answerOptions: unknown | null;
  correctAnswer: unknown | null;
}

export interface AdminTheoryQuestionInput {
  topicId: string;
  externalRef: string | null;
  questionType: string;
  penaltyPoints: number;
  difficulty: string;
  status?: string;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  translations: AdminTheoryQuestionTranslationInput[];
}

export interface AdminTheoryExamInput {
  programId: string;
  version: string;
  questionCount: number;
  durationSeconds: number;
  scoringMethod: string;
  passingRule: unknown;
  status?: string;
  activeFrom: string | null;
  activeUntil: string | null;
}

export type AdminTheoryEntityAction =
  | "update"
  | "publish"
  | "deactivate";

export interface AdminTheoryApiSuccess<T> {
  ok: true;
  data: T;
}

export interface AdminTheoryApiError {
  ok: false;
  code: string;
  message: string;
  fields?: Record<string, string>;
  allowedValues?: string[];
}

export type AdminTheoryApiResponse<T> =
  | AdminTheoryApiSuccess<T>
  | AdminTheoryApiError;
