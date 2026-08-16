export interface AdminCustomersQuery {
  page: number;
  pageSize: number;
  search: string;
  country: string;
  accountStatus: string;
  licenseClass: string;
  applicationStatus: string;
}

export interface AdminCustomersPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminCustomersStats {
  total: number;
  active: number;
  pendingVerification: number;
  withApplications: number;
}

export interface AdminCustomersFilterOptions {
  countries: string[];
  accountStatuses: string[];
  licenseClasses: string[];
  applicationStatuses: string[];
}

export interface AdminCustomerLicenseListItem {
  code: string;
  status: string;
  isPrimary: boolean;
  readinessScore: number | null;
}

export interface AdminCustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  primaryLicenseClass: string | null;
  licenseClasses: AdminCustomerLicenseListItem[];
  applicationId: string | null;
  applicationReference: string | null;
  applicationStatus: string | null;
  readinessScore: number | null;
}

export interface AdminCustomersPageData {
  customers: AdminCustomerListItem[];
  query: AdminCustomersQuery;
  pagination: AdminCustomersPagination;
  stats: AdminCustomersStats;
  filters: AdminCustomersFilterOptions;
  generatedAt: string;
}

export interface AdminCustomerProfileView {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  status: string;
  acceptedTermsAt: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  preferredLocale: string | null;
  timezone: string | null;
  onboardingCompletedAt: string | null;
  lastSeenAt: string | null;
}

export interface AdminCustomerLicenseDetailView {
  id: string;
  code: string;
  status: string;
  isPrimary: boolean;
  startedAt: string;
  targetExamDate: string | null;
  completedAt: string | null;
  progress: {
    currentDay: number;
    completedDays: number;
    completedLessons: number;
    answeredQuestions: number;
    correctAnswers: number;
    readinessScore: number;
    totalStudyMinutes: number;
    lastActivityAt: string | null;
  } | null;
  theory: {
    completedExamAttempts: number;
    passedExamAttempts: number;
    averageExamScorePercent: number | null;
    completedTrainingSessions: number;
    trainingQuestionsAnswered: number;
    trainingCorrectAnswers: number;
    trainingIncorrectAnswers: number;
  };
}

export interface AdminCustomerApplicationView {
  id: string;
  reference: string | null;
  selectedClasses: string[];
  theoryPassed: boolean | null;
  practicalPassed: boolean | null;
  classesTotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  currency: string;
  signatureType: string | null;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomerTheorySummaryView {
  primaryLicenseClass: string | null;
  currentDay: number | null;
  completedDays: number;
  completedLessons: number;
  answeredQuestions: number;
  correctAnswers: number;
  readinessScore: number | null;
  totalStudyMinutes: number;
  completedExamAttempts: number;
  passedExamAttempts: number;
  averageExamScorePercent: number | null;
  completedTrainingSessions: number;
  lastActivityAt: string | null;
}

export interface AdminCustomerPraxisAppointmentView {
  id: string;
  licenseClassCode: string | null;
  type: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  managedBy: string | null;
}

export interface AdminCustomerPaymentView {
  id: string;
  applicationId: string | null;
  stage: string | null;
  stageOrder: number;
  reference: string | null;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  activatedAt: string | null;
  dueAt: string | null;
  proofSubmittedAt: string | null;
  reviewedAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface AdminCustomerDocumentView {
  id: string;
  source: "user" | "application";
  applicationId: string | null;
  type: string;
  title: string | null;
  filename: string;
  mimeType: string;
  status: string;
  rejectionReason: string | null;
  fileSizeBytes: number;
  uploadedAt: string;
  verifiedAt: string | null;
  rejectedAt: string | null;
  expiresOn: string | null;
}

export interface AdminCustomerDetailView {
  profile: AdminCustomerProfileView;
  licenses: AdminCustomerLicenseDetailView[];
  applications: AdminCustomerApplicationView[];
  theory: AdminCustomerTheorySummaryView;
  praxis: AdminCustomerPraxisAppointmentView[];
  payments: AdminCustomerPaymentView[];
  documents: AdminCustomerDocumentView[];
  generatedAt: string;
}

export type AdminCustomersApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      code: string;
      message: string;
      fields?: Record<string, string>;
    };
