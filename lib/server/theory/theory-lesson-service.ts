import "server-only";

import {
  getTheoryContextForUser,
  getTheoryLessonDetail,
  listTheoryLessons,
} from "@/lib/server/theory/theory-repository";
import type { ClientShellLocale } from "@/types/client-shell";

export async function listGermanTheoryLessonsForTopic(input: {
  userId: string;
  locale: ClientShellLocale;
  topicSlug: string;
}) {
  const context = await getTheoryContextForUser(
    input.userId,
    input.locale,
  );

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId ||
    !context.programId
  ) {
    return [];
  }

  const lessons = await listTheoryLessons(
    context,
    input.topicSlug,
  );

  return lessons.map((lesson) => ({
    ...lesson,
    lastActivityAt: lesson.lastActivityAt?.toISOString() ?? null,
  }));
}

export async function getGermanTheoryLessonPageData(input: {
  userId: string;
  locale: ClientShellLocale;
  topicSlug: string;
  lessonSlug: string;
}) {
  const context = await getTheoryContextForUser(
    input.userId,
    input.locale,
  );

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId ||
    !context.programId ||
    !context.licenseClassCode
  ) {
    return null;
  }

  const [lesson, lessons] = await Promise.all([
    getTheoryLessonDetail(
      context,
      input.topicSlug,
      input.lessonSlug,
    ),
    listTheoryLessons(
      context,
      input.topicSlug,
    ),
  ]);

  if (!lesson) return null;

  const index = lessons.findIndex(
    (item) => item.id === lesson.id,
  );
  const previous = index > 0 ? lessons[index - 1] : null;
  const next =
    index >= 0 && index < lessons.length - 1
      ? lessons[index + 1]
      : null;

  return {
    ...lesson,
    countryCode: "DE" as const,
    licenseClassCode: context.licenseClassCode,
    navigation: {
      previous: previous
        ? { slug: previous.slug, title: previous.title }
        : null,
      next: next
        ? { slug: next.slug, title: next.title }
        : null,
      position: index >= 0 ? index + 1 : 1,
      total: lessons.length,
    },
  };
}
