/**
 * Express-Führerschein
 * Dashboard contracts.
 *
 * These types are serializable and can safely cross the
 * Server Component -> Client Component boundary.
 */

import type {
  ClientNavigationIcon,
} from "@/types/client-navigation";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import type {
  DrivingLicenseApplication,
} from "@/types/driving-license-application";

/* ==========================================================================
   GENERIC
   ========================================================================== */

export type DashboardReadinessLevel =
  | "not_ready"
  | "progressing"
  | "well_prepared"
  | "almost_ready";

export type DashboardProgramDayStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "skipped";

export type DashboardTaskKind =
  | "continue_theory"
  | "review_errors"
  | "training"
  | "exam_simulation";

export type DashboardDocumentStatus =
  | "uploaded"
  | "processing"
  | "verified"
  | "rejected"
  | "deleted";

/* ==========================================================================
   USER / LICENSE CLASS
   ========================================================================== */

export interface DashboardUser {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  displayName:
    string;

  locale:
    ClientShellLocale;

  timezone:
    string;
}

export interface DashboardLicenseClass {
  id:
    string;

  code:
    string;

  status:
    string;

  isPrimary:
    boolean;

  startedAt:
    string;

  targetExamDate:
    string | null;
}

/* ==========================================================================
   OVERVIEW
   ========================================================================== */

export interface DashboardProgressOverview {
  overallProgressPercent:
    number;

  currentDay:
    number;

  completedDays:
    number;

  totalDays:
    number;

  remainingDays:
    number;

  totalStudyMinutes:
    number;

  lastActivityAt:
    string | null;
}

export interface DashboardReadiness {
  percent:
    number;

  level:
    DashboardReadinessLevel;

  label:
    string;
}

export interface DashboardAnswerStats {
  totalAnswered:
    number;

  correct:
    number;

  incorrect:
    number;

  open:
    number;

  uniqueQuestionsAnswered:
    number;

  questionsToReview:
    number;

  accuracyPercent:
    number;
}

export interface DashboardExamStats {
  completed:
    number;

  passed:
    number;

  failed:
    number;

  passRatePercent:
    number;

  averageScorePercent:
    number;
}

export interface DashboardOverview {
  progress:
    DashboardProgressOverview;

  readiness:
    DashboardReadiness;

  answers:
    DashboardAnswerStats;

  exams:
    DashboardExamStats;
}

/* ==========================================================================
   21-DAY PROGRAM
   ========================================================================== */

export interface DashboardProgramDay {
  dayNumber:
    number;

  status:
    DashboardProgramDayStatus;

  isCurrent:
    boolean;

  plannedDate:
    string | null;

  startedAt:
    string | null;

  completedAt:
    string | null;

  studyMinutes:
    number;

  score:
    number | null;
}

export interface DashboardProgram {
  currentDay:
    number;

  totalDays:
    number;

  days:
    readonly DashboardProgramDay[];
}

/* ==========================================================================
   TODAY
   ========================================================================== */

export interface DashboardTodayTask {
  id:
    string;

  kind:
    DashboardTaskKind;

  title:
    string;

  description:
    string;

  meta:
    string | null;

  href:
    string;

  actionLabel:
    string;

  icon:
    ClientNavigationIcon;
}

/* ==========================================================================
   TOPICS / TRAINING
   ========================================================================== */

export interface DashboardTopicProgress {
  id:
    string;

  slug:
    string;

  title:
    string;

  sortOrder:
    number;

  answeredQuestions:
    number;

  correctAnswers:
    number;

  incorrectAnswers:
    number;

  progressPercent:
    number;

  masteryScore:
    number;

  lastTrainedAt:
    string | null;
}

export interface DashboardRecentTraining {
  id:
    string;

  topicId:
    string | null;

  topicTitle:
    string;

  sessionType:
    string;

  questionsAnswered:
    number;

  correctAnswers:
    number;

  incorrectAnswers:
    number;

  scorePercent:
    number | null;

  durationSeconds:
    number;

  startedAt:
    string;

  completedAt:
    string | null;
}

/* ==========================================================================
   APPOINTMENT
   ========================================================================== */

export interface DashboardAppointment {
  id:
    string;

  type:
    string;

  title:
    string;

  location:
    string | null;

  startsAt:
    string;

  endsAt:
    string | null;

  status:
    string;
}

/* ==========================================================================
   QUICK ACCESS
   ========================================================================== */

export interface DashboardQuickAccessItem {
  id:
    string;

  label:
    string;

  href:
    string;

  icon:
    ClientNavigationIcon;
}

/* ==========================================================================
   NOTIFICATIONS / DOCUMENTS
   ========================================================================== */

export interface DashboardNotificationSummary {
  unreadNotifications:
    number;

  unreadMessages:
    number;
}

export interface DashboardDocumentSummary {
  total:
    number;

  uploaded:
    number;

  processing:
    number;

  verified:
    number;

  rejected:
    number;
}

/* ==========================================================================
   COMPLETE DASHBOARD DATA
   ========================================================================== */

export interface DashboardData {
  generatedAt:
    string;

  /**
   * Latest real driving-license application for the authenticated client.
   * Null means the client has not created an application yet.
   */
  drivingLicenseApplication:
    DrivingLicenseApplication | null;

  user:
    DashboardUser;

  primaryLicenseClass:
    DashboardLicenseClass | null;

  overview:
    DashboardOverview;

  program:
    DashboardProgram;

  today:
    readonly DashboardTodayTask[];

  topics:
    readonly DashboardTopicProgress[];

  recentTraining:
    readonly DashboardRecentTraining[];

  nextAppointment:
    DashboardAppointment | null;

  quickAccess:
    readonly DashboardQuickAccessItem[];

  notifications:
    DashboardNotificationSummary;

  documents:
    DashboardDocumentSummary;

  /**
   * True when the client has no active driving-license class yet.
   * The UI can show a professional onboarding/empty state instead of demo data.
   */
  requiresLicenseClassSetup:
    boolean;
}

/* ==========================================================================
   SERVICE ERRORS
   ========================================================================== */

export type DashboardServiceErrorCode =
  | "UNAUTHENTICATED"
  | "DATABASE_ERROR";

export class DashboardServiceError
  extends Error {
  readonly code:
    DashboardServiceErrorCode;

  constructor(
    code:
      DashboardServiceErrorCode,

    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "DashboardServiceError";

    this.code =
      code;
  }
}
