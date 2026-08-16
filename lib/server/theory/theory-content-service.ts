import "server-only";

import {
  getGermanTheoryLessonPageData,
} from "@/lib/server/theory/theory-lesson-service";
import type {
  ClientShellLocale,
} from "@/types/client-shell";

const PUBLIC_BLOCK_TYPES = new Set([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "INFO",
  "WARNING",
  "TIP",
  "EXAMPLE",
  "QUESTION",
]);

export async function getGermanTheoryLessonContent(
  input: {
    userId: string;
    locale: ClientShellLocale;
    topicSlug: string;
    lessonSlug: string;
  },
) {
  const lesson = await getGermanTheoryLessonPageData(
    input,
  );

  if (!lesson) {
    return null;
  }

  const blocks = lesson.blocks
    .filter((block) => PUBLIC_BLOCK_TYPES.has(block.type))
    .map((block) => ({
      id: block.id,
      type: block.type,
      sortOrder: block.sortOrder,
      title: block.title,
      text: block.text,
      content: block.content,
      mediaStoragePath: block.mediaStoragePath,
      questionId: block.questionId,
      config: block.config,
    }));

  return {
    lesson: {
      id: lesson.id,
      topicId: lesson.topicId,
      topicSlug: lesson.topicSlug,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      estimatedDurationMinutes:
        lesson.estimatedDurationMinutes,
      progressPercent: lesson.progressPercent,
      currentBlockIndex: lesson.currentBlockIndex,
      completed: lesson.completed,
      licenseClassCode: lesson.licenseClassCode,
      navigation: lesson.navigation,
    },
    blocks,
  };
}
