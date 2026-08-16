/**
 * Express-Führerschein
 * Theory lesson route.
 *
 * Loads the real published lesson for the authenticated user's
 * active German driving-license class and renders the interactive
 * lesson player.
 */

import {
  notFound,
} from "next/navigation";

import {
  LessonPlayer,
} from "@/components/theory/lesson/lesson-player";

import {
  TheoryPage,
} from "@/components/theory/theory-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getGermanTheoryLessonPageData,
} from "@/lib/server/theory/theory-lesson-service";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export default async function TheoryLessonPage({
  params,
}: {
  params:
    Promise<{
      topic:
        string;

      lesson:
        string;
    }>;
}) {
  const {
    topic:
      rawTopic,

    lesson:
      rawLesson,
  } =
    await params;

  const topicSlug =
    decodeURIComponent(
      rawTopic,
    ).trim();

  const lessonSlug =
    decodeURIComponent(
      rawLesson,
    ).trim();

  if (
    !topicSlug ||
    !lessonSlug
  ) {
    notFound();
  }

  /**
   * Keep exactly the same readiness behavior as the working
   * /theorie/[topic] route.
   *
   * If the user has no active class/program, TheoryPage handles
   * the existing safe state instead of fabricating lesson data.
   */
  const overview =
    await getTheoryOverviewData();

  if (
    overview.status !==
    "ready"
  ) {
    return (
      <TheoryPage
        data={overview}
      />
    );
  }

  /**
   * Use the existing authenticated client session.
   * The locale comes from the user's real profile/session.
   */
  const session =
    await requireClientSession();

  /**
   * Loads:
   * - active DE license class
   * - current published theory program
   * - requested topic
   * - requested lesson
   * - localized lesson translation
   * - active content blocks
   * - existing user lesson progress
   * - previous/next lesson navigation
   */
  const lesson =
    await getGermanTheoryLessonPageData({
      userId:
        session.user.id,

      locale:
        session.user
          .preferredLocale,

      topicSlug,

      lessonSlug,
    });

  if (
    !lesson
  ) {
    notFound();
  }

  return (
    <LessonPlayer
      lesson={lesson}
    />
  );
}