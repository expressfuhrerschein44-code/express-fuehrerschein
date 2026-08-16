import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  findAdminCustomerDetailRepository,
  getAdminCustomersFilterRowsRepository,
  getAdminCustomersStatsRepository,
  listAdminCustomersRepository,
  type AdminCustomerDetailRow,
  type AdminCustomerListRow,
} from "@/lib/server/admin/customers/admin-customers-repository";

import {
  isAdminCustomerUuid,
  parseAdminCustomersQuery,
} from "@/lib/server/admin/customers/admin-customers-validation";

import type {
  AdminCustomerDetailView,
  AdminCustomerDocumentView,
  AdminCustomerLicenseDetailView,
  AdminCustomerListItem,
  AdminCustomersPageData,
  AdminCustomersQuery,
} from "@/types/admin-customers";

export type AdminCustomersServiceErrorCode =
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DATABASE_ERROR";

export class AdminCustomersServiceError extends Error {
  readonly code: AdminCustomersServiceErrorCode;
  readonly status: number;
  readonly fields: Record<string, string> | undefined;

  constructor(
    code: AdminCustomersServiceErrorCode,
    message: string,
    status: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminCustomersServiceError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

function hashToken(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

async function requireAdminActor(): Promise<void> {
  const cookieStore = await cookies();
  const configuredName =
    process.env.ADMIN_SESSION_COOKIE_NAME?.trim();

  const candidateCookies = cookieStore
    .getAll()
    .filter((cookie) => {
      const name = cookie.name.toLowerCase();

      return Boolean(
        (configuredName && cookie.name === configuredName) ||
          (name.includes("admin") && name.includes("session")),
      );
    });

  const tokenHashes = Array.from(
    new Set(
      candidateCookies
        .map((cookie) => cookie.value.trim())
        .filter(Boolean)
        .map(hashToken),
    ),
  );

  if (tokenHashes.length === 0) {
    throw new AdminCustomersServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung wurde nicht gefunden.",
      401,
    );
  }

  const session = await prisma.admin_sessions.findFirst({
    where: {
      token_hash: {
        in: tokenHashes,
      },
      revoked_at: null,
      expires_at: {
        gt: new Date(),
      },
      admin: {
        is: {
          is_active: true,
        },
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!session) {
    throw new AdminCustomersServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung ist ungültig oder abgelaufen.",
      401,
    );
  }
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function maxIso(
  values: Array<Date | null | undefined>,
): string | null {
  let latest: Date | null = null;

  for (const value of values) {
    if (!value) continue;
    if (!latest || value.getTime() > latest.getTime()) {
      latest = value;
    }
  }

  return latest?.toISOString() ?? null;
}

function toSafeNumber(value: bigint): number {
  const numeric = Number(value);
  return Number.isSafeInteger(numeric)
    ? numeric
    : Number.MAX_SAFE_INTEGER;
}

function mapListCustomer(
  row: AdminCustomerListRow,
): AdminCustomerListItem {
  const primary =
    row.user_license_classes.find(
      (licenseClass) => licenseClass.is_primary,
    ) ?? row.user_license_classes[0] ?? null;

  const latestApplication =
    row.driving_license_applications[0] ?? null;

  const lastSeenAt = maxIso([
    row.user_profile?.last_seen_at,
    ...row.user_license_classes.map(
      (licenseClass) =>
        licenseClass.learning_progress?.last_activity_at,
    ),
  ]);

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: row.phone_e164,
    countryCode: row.country_code,
    status: row.status,
    emailVerified: Boolean(row.email_verified_at),
    createdAt: row.created_at.toISOString(),
    lastSeenAt,
    primaryLicenseClass:
      primary?.license_class_code ?? null,
    licenseClasses: row.user_license_classes.map(
      (licenseClass) => ({
        code: licenseClass.license_class_code,
        status: licenseClass.status,
        isPrimary: licenseClass.is_primary,
        readinessScore:
          licenseClass.learning_progress?.readiness_score ?? null,
      }),
    ),
    applicationId: latestApplication?.id ?? null,
    applicationReference:
      latestApplication?.application_reference ?? null,
    applicationStatus: latestApplication?.status ?? null,
    readinessScore:
      primary?.learning_progress?.readiness_score ?? null,
  };
}

function mapLicenseDetail(
  licenseClass: AdminCustomerDetailRow["user_license_classes"][number],
): AdminCustomerLicenseDetailView {
  const completedAttempts = licenseClass.exam_attempts;
  const scores = completedAttempts
    .map((attempt) => attempt.score_percent)
    .filter((score): score is number => score !== null);

  const averageExamScorePercent =
    scores.length > 0
      ? Math.round(
          scores.reduce((total, score) => total + score, 0) /
            scores.length,
        )
      : null;

  return {
    id: licenseClass.id,
    code: licenseClass.license_class_code,
    status: licenseClass.status,
    isPrimary: licenseClass.is_primary,
    startedAt: licenseClass.started_at.toISOString(),
    targetExamDate: iso(licenseClass.target_exam_date),
    completedAt: iso(licenseClass.completed_at),
    progress: licenseClass.learning_progress
      ? {
          currentDay: licenseClass.learning_progress.current_day,
          completedDays:
            licenseClass.learning_progress.completed_days,
          completedLessons:
            licenseClass.learning_progress.completed_lessons,
          answeredQuestions:
            licenseClass.learning_progress.answered_questions,
          correctAnswers:
            licenseClass.learning_progress.correct_answers,
          readinessScore:
            licenseClass.learning_progress.readiness_score,
          totalStudyMinutes:
            licenseClass.learning_progress.total_study_minutes,
          lastActivityAt: iso(
            licenseClass.learning_progress.last_activity_at,
          ),
        }
      : null,
    theory: {
      completedExamAttempts: completedAttempts.length,
      passedExamAttempts: completedAttempts.filter(
        (attempt) => attempt.passed === true,
      ).length,
      averageExamScorePercent,
      completedTrainingSessions:
        licenseClass.training_sessions.length,
      trainingQuestionsAnswered:
        licenseClass.training_sessions.reduce(
          (total, session) => total + session.questions_answered,
          0,
        ),
      trainingCorrectAnswers:
        licenseClass.training_sessions.reduce(
          (total, session) => total + session.correct_answers,
          0,
        ),
      trainingIncorrectAnswers:
        licenseClass.training_sessions.reduce(
          (total, session) => total + session.incorrect_answers,
          0,
        ),
    },
  };
}

function mapDocuments(
  row: AdminCustomerDetailRow,
): AdminCustomerDocumentView[] {
  const userDocuments: AdminCustomerDocumentView[] =
    row.user_documents.map((document) => ({
      id: document.id,
      source: "user",
      applicationId: null,
      type: document.document_type,
      title: document.title,
      filename: document.original_filename,
      mimeType: document.mime_type,
      status: document.status,
      rejectionReason: document.rejection_reason,
      fileSizeBytes: toSafeNumber(document.file_size_bytes),
      uploadedAt: document.uploaded_at.toISOString(),
      verifiedAt: iso(document.verified_at),
      rejectedAt: iso(document.rejected_at),
      expiresOn: iso(document.expires_on),
    }));

  const applicationDocuments: AdminCustomerDocumentView[] =
    row.application_documents.map((document) => ({
      id: document.id,
      source: "application",
      applicationId: document.application_id,
      type: document.document_type,
      title: null,
      filename: document.original_filename,
      mimeType: document.mime_type,
      status: "application",
      rejectionReason: null,
      fileSizeBytes: toSafeNumber(document.file_size_bytes),
      uploadedAt: document.created_at.toISOString(),
      verifiedAt: null,
      rejectedAt: null,
      expiresOn: null,
    }));

  return [...userDocuments, ...applicationDocuments]
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() -
        new Date(a.uploadedAt).getTime(),
    )
    .slice(0, 60);
}

function mapDetail(
  row: AdminCustomerDetailRow,
): AdminCustomerDetailView {
  const licenses = row.user_license_classes.map(mapLicenseDetail);
  const primaryLicense =
    licenses.find((licenseClass) => licenseClass.isPrimary) ??
    licenses[0] ??
    null;

  const allScores = row.user_license_classes.flatMap(
    (licenseClass) =>
      licenseClass.exam_attempts
        .map((attempt) => attempt.score_percent)
        .filter((score): score is number => score !== null),
  );

  const theoryLastActivityAt = maxIso([
    ...row.user_license_classes.map(
      (licenseClass) =>
        licenseClass.learning_progress?.last_activity_at,
    ),
    ...row.user_license_classes.flatMap((licenseClass) =>
      licenseClass.exam_attempts.map(
        (attempt) => attempt.completed_at ?? attempt.started_at,
      ),
    ),
    ...row.user_license_classes.flatMap((licenseClass) =>
      licenseClass.training_sessions.map(
        (session) => session.completed_at ?? session.started_at,
      ),
    ),
  ]);

  const totalCompletedExamAttempts =
    row.user_license_classes.reduce(
      (total, licenseClass) =>
        total + licenseClass.exam_attempts.length,
      0,
    );

  const totalPassedExamAttempts =
    row.user_license_classes.reduce(
      (total, licenseClass) =>
        total +
        licenseClass.exam_attempts.filter(
          (attempt) => attempt.passed === true,
        ).length,
      0,
    );

  const totalTrainingSessions =
    row.user_license_classes.reduce(
      (total, licenseClass) =>
        total + licenseClass.training_sessions.length,
      0,
    );

  return {
    profile: {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      phone: row.phone_e164,
      countryCode: row.country_code,
      status: row.status,
      acceptedTermsAt: row.accepted_terms_at.toISOString(),
      emailVerifiedAt: iso(row.email_verified_at),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      preferredLocale: row.user_profile?.preferred_locale ?? null,
      timezone: row.user_profile?.timezone ?? null,
      onboardingCompletedAt: iso(
        row.user_profile?.onboarding_completed_at,
      ),
      lastSeenAt: row.user_profile?.last_seen_at
        ? row.user_profile.last_seen_at.toISOString()
        : theoryLastActivityAt,
    },
    licenses,
    applications: row.driving_license_applications.map(
      (application) => ({
        id: application.id,
        reference: application.application_reference,
        selectedClasses: [...application.selected_classes],
        theoryPassed: application.theory_passed,
        practicalPassed: application.practical_passed,
        classesTotalCents: application.classes_total_cents,
        processingFeeCents: application.processing_fee_cents,
        totalCents: application.total_cents,
        currency: application.currency,
        signatureType: application.signature_type,
        status: application.status,
        submittedAt: iso(application.submitted_at),
        reviewedAt: iso(application.reviewed_at),
        approvedAt: iso(application.approved_at),
        rejectedAt: iso(application.rejected_at),
        rejectionReason: application.rejection_reason,
        createdAt: application.created_at.toISOString(),
        updatedAt: application.updated_at.toISOString(),
      }),
    ),
    theory: {
      primaryLicenseClass: primaryLicense?.code ?? null,
      currentDay: primaryLicense?.progress?.currentDay ?? null,
      completedDays: row.user_license_classes.reduce(
        (total, licenseClass) =>
          total + (licenseClass.learning_progress?.completed_days ?? 0),
        0,
      ),
      completedLessons: row.user_license_classes.reduce(
        (total, licenseClass) =>
          total + (licenseClass.learning_progress?.completed_lessons ?? 0),
        0,
      ),
      answeredQuestions: row.user_license_classes.reduce(
        (total, licenseClass) =>
          total + (licenseClass.learning_progress?.answered_questions ?? 0),
        0,
      ),
      correctAnswers: row.user_license_classes.reduce(
        (total, licenseClass) =>
          total + (licenseClass.learning_progress?.correct_answers ?? 0),
        0,
      ),
      readinessScore: primaryLicense?.progress?.readinessScore ?? null,
      totalStudyMinutes: row.user_license_classes.reduce(
        (total, licenseClass) =>
          total + (licenseClass.learning_progress?.total_study_minutes ?? 0),
        0,
      ),
      completedExamAttempts: totalCompletedExamAttempts,
      passedExamAttempts: totalPassedExamAttempts,
      averageExamScorePercent:
        allScores.length > 0
          ? Math.round(
              allScores.reduce((total, score) => total + score, 0) /
                allScores.length,
            )
          : null,
      completedTrainingSessions: totalTrainingSessions,
      lastActivityAt: theoryLastActivityAt,
    },
    praxis: row.user_appointments.map((appointment) => ({
      id: appointment.id,
      licenseClassCode:
        appointment.user_license_classes?.license_class_code ?? null,
      type: appointment.appointment_type,
      title: appointment.title,
      location: appointment.location,
      startsAt: appointment.starts_at.toISOString(),
      endsAt: iso(appointment.ends_at),
      status: appointment.status,
      confirmedAt: iso(appointment.confirmed_at),
      cancelledAt: iso(appointment.cancelled_at),
      managedBy: appointment.managed_by_admin
        ? `${appointment.managed_by_admin.first_name} ${appointment.managed_by_admin.last_name}`.trim()
        : null,
    })),
    payments: row.payments.map((payment) => ({
      id: payment.id,
      applicationId: payment.application_id,
      stage: payment.payment_stage,
      stageOrder: payment.stage_order,
      reference: payment.payment_reference,
      amountCents: payment.amount_cents,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      activatedAt: iso(payment.activated_at),
      dueAt: iso(payment.due_at),
      proofSubmittedAt: iso(payment.proof_submitted_at),
      reviewedAt: iso(payment.reviewed_at),
      paidAt: iso(payment.paid_at),
      refundedAt: iso(payment.refunded_at),
      rejectionReason: payment.rejection_reason,
      createdAt: payment.created_at.toISOString(),
    })),
    documents: mapDocuments(row),
    generatedAt: new Date().toISOString(),
  };
}

function wrapDatabaseError(
  error: unknown,
  context: string,
): never {
  if (error instanceof AdminCustomersServiceError) {
    throw error;
  }

  console.error(
    `[Express-Führerschein] ${context}`,
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack:
            process.env.NODE_ENV === "development"
              ? error.stack
              : undefined,
        }
      : error,
  );

  throw new AdminCustomersServiceError(
    "DATABASE_ERROR",
    "Die Kundendaten konnten gerade nicht verarbeitet werden.",
    500,
  );
}

export async function getAdminCustomersPageData(
  rawQuery:
    | Record<string, string | string[] | undefined>
    | URLSearchParams,
): Promise<AdminCustomersPageData> {
  await requireAdminActor();
  const query: AdminCustomersQuery =
    parseAdminCustomersQuery(rawQuery);

  try {
    const list = await listAdminCustomersRepository(query);
    const stats = await getAdminCustomersStatsRepository();
    const filterRows = await getAdminCustomersFilterRowsRepository();

    const totalPages = Math.max(
      1,
      Math.ceil(list.total / query.pageSize),
    );

    return {
      customers: list.rows.map(mapListCustomer),
      query,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: list.total,
        totalPages,
        hasPreviousPage: query.page > 1,
        hasNextPage: query.page < totalPages,
      },
      stats,
      filters: {
        countries: uniqueSorted(filterRows.countries),
        accountStatuses: uniqueSorted(filterRows.accountStatuses),
        licenseClasses: uniqueSorted(filterRows.licenseClasses),
        applicationStatuses: uniqueSorted(
          filterRows.applicationStatuses,
        ),
      },
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    wrapDatabaseError(error, "admin customers page loading failed");
  }
}

export async function getAdminCustomerDetail(
  userId: string,
): Promise<AdminCustomerDetailView> {
  await requireAdminActor();

  if (!isAdminCustomerUuid(userId)) {
    throw new AdminCustomersServiceError(
      "NOT_FOUND",
      "Der Kunde wurde nicht gefunden.",
      404,
    );
  }

  try {
    const row = await findAdminCustomerDetailRepository(userId);

    if (!row) {
      throw new AdminCustomersServiceError(
        "NOT_FOUND",
        "Der Kunde wurde nicht gefunden.",
        404,
      );
    }

    return mapDetail(row);
  } catch (error) {
    wrapDatabaseError(error, "admin customer detail loading failed");
  }
}
