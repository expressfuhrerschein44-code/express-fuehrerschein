import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  Prisma,
} from "@prisma/client";

import {
  createAdminTheoryAudit,
  createAdminTheoryExamRepository,
  createAdminTheoryLessonRepository,
  createAdminTheoryProgramRepository,
  createAdminTheoryQuestionRepository,
  createAdminTheoryTopicRepository,
  findAdminSessionByTokenHashes,
  getAdminTheoryCandidate,
  getAdminTheoryExam,
  getAdminTheoryLesson,
  getAdminTheoryPageDataRepository,
  getAdminTheoryProgram,
  getAdminTheoryQuestion,
  getAdminTheoryReport,
  getAdminTheoryTopic,
  listAllowedStatusValues,
  resolveAdminTheoryReportRepository,
  touchAdminTheoryPresence,
  updateAdminTheoryExamRepository,
  updateAdminTheoryLessonRepository,
  updateAdminTheoryProgramRepository,
  updateAdminTheoryQuestionMediaPath,
  updateAdminTheoryQuestionRepository,
  updateAdminTheoryTopicRepository,
} from "@/lib/server/admin/theory/admin-theory-repository";

import {
  validateExamInput,
  validateLessonInput,
  validateProgramInput,
  validateQuestionInput,
  validateTopicInput,
  validateUuid,
} from "@/lib/server/admin/theory/admin-theory-validation";

import type {
  AdminTheoryCandidateView,
  AdminTheoryExamView,
  AdminTheoryLessonView,
  AdminTheoryPageData,
  AdminTheoryProgramView,
  AdminTheoryQuestionView,
  AdminTheoryReportView,
  AdminTheoryTopicView,
} from "@/types/admin-theory";

export class AdminTheoryServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
    public readonly allowedValues?: string[],
  ) {
    super(message);
    this.name = "AdminTheoryServiceError";
  }
}

export interface AdminTheoryActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function tokenHash(value: string): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

export async function requireAdminTheoryActor():
  Promise<AdminTheoryActor> {
  const cookieStore =
    await cookies();

  const configured =
    process.env.ADMIN_SESSION_COOKIE_NAME?.trim();

  const hashes: string[] =
    Array.from(
      new Set(
        cookieStore
          .getAll()
          .filter((cookie) => {
            const name =
              cookie.name.toLowerCase();

            return (
              Boolean(
                configured &&
                cookie.name === configured,
              ) ||
              (
                name.includes("admin") &&
                name.includes("session")
              )
            );
          })
          .map((cookie) => cookie.value.trim())
          .filter(Boolean)
          .map(tokenHash),
      ),
    );

  if (hashes.length === 0) {
    throw new AdminTheoryServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung wurde nicht gefunden.",
      401,
    );
  }

  const session =
    await findAdminSessionByTokenHashes(hashes);

  if (!session || !session.admin.is_active) {
    throw new AdminTheoryServiceError(
      "UNAUTHENTICATED",
      "Die Admin-Sitzung ist ungültig oder abgelaufen.",
      401,
    );
  }

  void touchAdminTheoryPresence(
    session.id,
    session.admin.id,
  );

  return {
    id: session.admin.id,
    email: session.admin.email,
    firstName: session.admin.first_name,
    lastName: session.admin.last_name,
    role: session.admin.role,
  };
}

function fieldsError(
  fields: Record<string, string> | undefined,
): never {
  throw new AdminTheoryServiceError(
    "VALIDATION_ERROR",
    "Bitte prüfe die markierten Angaben.",
    400,
    fields,
  );
}

function notFound(
  entity: string,
): never {
  throw new AdminTheoryServiceError(
    "NOT_FOUND",
    `${entity} wurde nicht gefunden.`,
    404,
  );
}

function isKnownPrismaError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function wrapDatabaseError(
  error: unknown,
  context: string,
): never {
  if (error instanceof AdminTheoryServiceError) {
    throw error;
  }

  if (isKnownPrismaError(error)) {
    if (error.code === "P2002") {
      throw new AdminTheoryServiceError(
        "DUPLICATE_VALUE",
        "Ein Eintrag mit diesen eindeutigen Angaben existiert bereits.",
        409,
      );
    }

    if (error.code === "P2025") {
      throw new AdminTheoryServiceError(
        "NOT_FOUND",
        "Der angeforderte Theorieeintrag wurde nicht gefunden.",
        404,
      );
    }
  }

  console.error(
    `[Express-Führerschein] ${context}`,
    error,
  );

  throw new AdminTheoryServiceError(
    "DATABASE_ERROR",
    "Die Theoriedaten konnten gerade nicht verarbeitet werden.",
    500,
  );
}

async function assertStatusAllowed(
  table:
    | "theory_programs"
    | "theory_lessons"
    | "theory_questions"
    | "exam_configurations"
    | "theory_question_reports",
  status: string,
): Promise<void> {
  const allowed =
    await listAllowedStatusValues(table);

  /*
   * No CHECK constraint means Prisma/PostgreSQL accepts ordinary string values.
   * If a CHECK exists, the Admin module never guesses around it.
   */
  if (
    allowed.length > 0 &&
    !allowed.includes(status)
  ) {
    throw new AdminTheoryServiceError(
      "STATUS_NOT_ALLOWED",
      `Der Status "${status}" ist für ${table} in PostgreSQL nicht erlaubt.`,
      409,
      undefined,
      allowed,
    );
  }
}

async function resolveDraftStatus(
  table:
    | "theory_programs"
    | "theory_lessons"
    | "theory_questions"
    | "exam_configurations",
  requested?: string,
): Promise<{
  status: string;
  forceInactive?: boolean;
}> {
  const preferred =
    requested?.trim();

  if (preferred) {
    await assertStatusAllowed(table, preferred);
    return { status: preferred };
  }

  const allowed =
    await listAllowedStatusValues(table);

  if (
    allowed.length === 0 ||
    allowed.includes("draft")
  ) {
    return { status: "draft" };
  }

  /*
   * Prisma's current question model historically defaults to "published".
   * If a legacy CHECK only permits "published", create it inactive so the
   * existing client query (status=published AND is_active=true) cannot expose
   * an unfinished question.
   */
  if (
    table === "theory_questions" &&
    allowed.includes("published")
  ) {
    return {
      status: "published",
      forceInactive: true,
    };
  }

  throw new AdminTheoryServiceError(
    "SAFE_DRAFT_STATUS_UNAVAILABLE",
    "PostgreSQL erlaubt aktuell keinen sicheren Entwurfsstatus für diesen Inhalt.",
    409,
    undefined,
    allowed,
  );
}

async function audit(
  actor: AdminTheoryActor,
  input: {
    action: string;
    entityType: string;
    entityId?: string | null;
    targetUserId?: string | null;
    metadata?: unknown;
  },
) {
  try {
    await createAdminTheoryAudit({
      adminId: actor.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      targetUserId: input.targetUserId,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error(
      "[Express-Führerschein] admin theory audit failed",
      error,
    );
  }
}

export async function getAdminTheoryPageData():
  Promise<AdminTheoryPageData> {
  await requireAdminTheoryActor();

  try {
    return await getAdminTheoryPageDataRepository();
  } catch (error) {
    wrapDatabaseError(
      error,
      "admin theory page loading failed",
    );
  }
}

export async function getAdminTheoryProgramDetail(
  id: string,
): Promise<AdminTheoryProgramView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Theorieprogramm");

  try {
    const row = await getAdminTheoryProgram(id);
    return row ?? notFound("Theorieprogramm");
  } catch (error) {
    wrapDatabaseError(error, "admin theory program loading failed");
  }
}

export async function getAdminTheoryTopicDetail(
  id: string,
): Promise<AdminTheoryTopicView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Thema");

  try {
    const row = await getAdminTheoryTopic(id);
    return row ?? notFound("Thema");
  } catch (error) {
    wrapDatabaseError(error, "admin theory topic loading failed");
  }
}

export async function getAdminTheoryLessonDetail(
  id: string,
): Promise<AdminTheoryLessonView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Lektion");

  try {
    const row = await getAdminTheoryLesson(id);
    return row ?? notFound("Lektion");
  } catch (error) {
    wrapDatabaseError(error, "admin theory lesson loading failed");
  }
}

export async function getAdminTheoryQuestionDetail(
  id: string,
): Promise<AdminTheoryQuestionView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Frage");

  try {
    const row = await getAdminTheoryQuestion(id);
    return row ?? notFound("Frage");
  } catch (error) {
    wrapDatabaseError(error, "admin theory question loading failed");
  }
}

export async function getAdminTheoryExamDetail(
  id: string,
): Promise<AdminTheoryExamView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Prüfungskonfiguration");

  try {
    const row = await getAdminTheoryExam(id);
    return row ?? notFound("Prüfungskonfiguration");
  } catch (error) {
    wrapDatabaseError(error, "admin theory exam loading failed");
  }
}

export async function getAdminTheoryReportDetail(
  id: string,
): Promise<AdminTheoryReportView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Meldung");

  try {
    const row = await getAdminTheoryReport(id);
    return row ?? notFound("Meldung");
  } catch (error) {
    wrapDatabaseError(error, "admin theory report loading failed");
  }
}

export async function getAdminTheoryCandidateDetail(
  id: string,
): Promise<AdminTheoryCandidateView> {
  await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Kandidat");

  try {
    const row = await getAdminTheoryCandidate(id);
    return row ?? notFound("Kandidat");
  } catch (error) {
    wrapDatabaseError(error, "admin theory candidate loading failed");
  }
}

export async function createAdminTheoryProgram(
  value: unknown,
): Promise<AdminTheoryProgramView> {
  const actor = await requireAdminTheoryActor();
  const validation = validateProgramInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const safe =
      await resolveDraftStatus(
        "theory_programs",
        validation.data.status,
      );

    const created =
      await createAdminTheoryProgramRepository({
        ...validation.data,
        status: safe.status,
      });

    await audit(actor, {
      action: "theory.program.created",
      entityType: "theory_program",
      entityId: created.id,
      metadata: {
        code: created.code,
        status: created.status,
      },
    });

    return created;
  } catch (error) {
    wrapDatabaseError(error, "admin theory program creation failed");
  }
}

export async function updateAdminTheoryProgram(
  id: string,
  value: unknown,
  action = "update",
): Promise<AdminTheoryProgramView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Theorieprogramm");

  const validation = validateProgramInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const current =
      await getAdminTheoryProgram(id);
    if (!current) notFound("Theorieprogramm");

    const desired =
      action === "publish"
        ? "published"
        : validation.data.status ?? current.status;

    await assertStatusAllowed(
      "theory_programs",
      desired,
    );

    const updated =
      await updateAdminTheoryProgramRepository(
        id,
        {
          ...validation.data,
          status: desired,
          isCurrent:
            action === "publish"
              ? true
              : validation.data.isCurrent,
        },
      );

    await audit(actor, {
      action:
        action === "publish"
          ? "theory.program.published"
          : "theory.program.updated",
      entityType: "theory_program",
      entityId: id,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory program update failed");
  }
}

export async function createAdminTheoryTopic(
  value: unknown,
): Promise<AdminTheoryTopicView> {
  const actor = await requireAdminTheoryActor();
  const validation = validateTopicInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const created =
      await createAdminTheoryTopicRepository(
        validation.data,
      );

    await audit(actor, {
      action: "theory.topic.created",
      entityType: "theory_topic",
      entityId: created.id,
      metadata: {
        programId: created.programId,
        slug: created.slug,
      },
    });

    return created;
  } catch (error) {
    wrapDatabaseError(error, "admin theory topic creation failed");
  }
}

export async function updateAdminTheoryTopic(
  id: string,
  value: unknown,
): Promise<AdminTheoryTopicView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Thema");

  const validation = validateTopicInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const updated =
      await updateAdminTheoryTopicRepository(
        id,
        validation.data,
      );

    await audit(actor, {
      action: "theory.topic.updated",
      entityType: "theory_topic",
      entityId: id,
      metadata: {
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory topic update failed");
  }
}

export async function createAdminTheoryLesson(
  value: unknown,
): Promise<AdminTheoryLessonView> {
  const actor = await requireAdminTheoryActor();
  const validation = validateLessonInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const safe =
      await resolveDraftStatus(
        "theory_lessons",
        validation.data.status,
      );

    const created =
      await createAdminTheoryLessonRepository({
        ...validation.data,
        status: safe.status,
      });

    await audit(actor, {
      action: "theory.lesson.created",
      entityType: "theory_lesson",
      entityId: created.id,
      metadata: {
        topicId: created.topicId,
        status: created.status,
      },
    });

    return created;
  } catch (error) {
    wrapDatabaseError(error, "admin theory lesson creation failed");
  }
}

export async function updateAdminTheoryLesson(
  id: string,
  value: unknown,
  action = "update",
): Promise<AdminTheoryLessonView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Lektion");

  const validation = validateLessonInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const current =
      await getAdminTheoryLesson(id);
    if (!current) notFound("Lektion");

    const desired =
      action === "publish"
        ? "published"
        : validation.data.status ?? current.status;

    await assertStatusAllowed(
      "theory_lessons",
      desired,
    );

    const updated =
      await updateAdminTheoryLessonRepository(
        id,
        {
          ...validation.data,
          status: desired,
        },
      );

    await audit(actor, {
      action:
        action === "publish"
          ? "theory.lesson.published"
          : "theory.lesson.updated",
      entityType: "theory_lesson",
      entityId: id,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
        version: updated.version,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory lesson update failed");
  }
}

export async function createAdminTheoryQuestion(
  value: unknown,
): Promise<AdminTheoryQuestionView> {
  const actor = await requireAdminTheoryActor();
  const validation = validateQuestionInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const safe =
      await resolveDraftStatus(
        "theory_questions",
        validation.data.status,
      );

    const created =
      await createAdminTheoryQuestionRepository({
        ...validation.data,
        status: safe.status,
        forceInactive: safe.forceInactive,
      });

    await audit(actor, {
      action: "theory.question.created",
      entityType: "theory_question",
      entityId: created.id,
      metadata: {
        topicId: created.topicId,
        status: created.status,
        isActive: created.isActive,
      },
    });

    return created;
  } catch (error) {
    wrapDatabaseError(error, "admin theory question creation failed");
  }
}

export async function updateAdminTheoryQuestion(
  id: string,
  value: unknown,
  action = "update",
): Promise<AdminTheoryQuestionView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Frage");

  const validation = validateQuestionInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const current =
      await getAdminTheoryQuestion(id);
    if (!current) notFound("Frage");

    const desired =
      action === "publish"
        ? "published"
        : validation.data.status ?? current.status;

    await assertStatusAllowed(
      "theory_questions",
      desired,
    );

    const updated =
      await updateAdminTheoryQuestionRepository(
        id,
        {
          ...validation.data,
          status: desired,
          isActive:
            action === "publish"
              ? true
              : action === "deactivate"
                ? false
                : validation.data.isActive,
        },
      );

    await audit(actor, {
      action:
        action === "publish"
          ? "theory.question.published"
          : action === "deactivate"
            ? "theory.question.deactivated"
            : "theory.question.updated",
      entityType: "theory_question",
      entityId: id,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
        version: updated.version,
        isActive: updated.isActive,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory question update failed");
  }
}

export async function setAdminTheoryQuestionMedia(
  id: string,
  path: string | null,
): Promise<AdminTheoryQuestionView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Frage");

  try {
    const current =
      await getAdminTheoryQuestion(id);
    if (!current) notFound("Frage");

    const updated =
      await updateAdminTheoryQuestionMediaPath(
        id,
        path,
      );

    await audit(actor, {
      action:
        path
          ? "theory.question.media.updated"
          : "theory.question.media.removed",
      entityType: "theory_question",
      entityId: id,
      metadata: {
        previousPath: current.mediaStoragePath,
        path,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory question media update failed");
  }
}

export async function createAdminTheoryExam(
  value: unknown,
): Promise<AdminTheoryExamView> {
  const actor = await requireAdminTheoryActor();
  const validation = validateExamInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const safe =
      await resolveDraftStatus(
        "exam_configurations",
        validation.data.status,
      );

    const created =
      await createAdminTheoryExamRepository({
        ...validation.data,
        status: safe.status,
      });

    await audit(actor, {
      action: "theory.exam.created",
      entityType: "exam_configuration",
      entityId: created.id,
      metadata: {
        programId: created.programId,
        status: created.status,
      },
    });

    return created;
  } catch (error) {
    wrapDatabaseError(error, "admin theory exam creation failed");
  }
}

export async function updateAdminTheoryExam(
  id: string,
  value: unknown,
  action = "update",
): Promise<AdminTheoryExamView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Prüfungskonfiguration");

  const validation = validateExamInput(value);
  if (!validation.ok || !validation.data) fieldsError(validation.fields);

  try {
    const current =
      await getAdminTheoryExam(id);
    if (!current) notFound("Prüfungskonfiguration");

    const desired =
      action === "publish"
        ? "published"
        : validation.data.status ?? current.status;

    await assertStatusAllowed(
      "exam_configurations",
      desired,
    );

    const updated =
      await updateAdminTheoryExamRepository(
        id,
        {
          ...validation.data,
          status: desired,
        },
      );

    await audit(actor, {
      action:
        action === "publish"
          ? "theory.exam.published"
          : "theory.exam.updated",
      entityType: "exam_configuration",
      entityId: id,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory exam update failed");
  }
}

export async function resolveAdminTheoryReport(
  id: string,
): Promise<AdminTheoryReportView> {
  const actor = await requireAdminTheoryActor();
  if (!validateUuid(id)) notFound("Meldung");

  try {
    const current =
      await getAdminTheoryReport(id);
    if (!current) notFound("Meldung");

    await assertStatusAllowed(
      "theory_question_reports",
      "resolved",
    );

    const updated =
      await resolveAdminTheoryReportRepository(
        id,
        actor.id,
        "resolved",
      );

    await audit(actor, {
      action: "theory.report.resolved",
      entityType: "theory_question_report",
      entityId: id,
      targetUserId: current.candidate.userId,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
        questionId: current.question.id,
      },
    });

    return updated;
  } catch (error) {
    wrapDatabaseError(error, "admin theory report resolution failed");
  }
}
