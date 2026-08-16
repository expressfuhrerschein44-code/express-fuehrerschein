import "server-only";

import type {
  ExamReadinessBreakdown,
} from "@/lib/server/theory/exam-readiness-service";

import type {
  TheoryLearningProgressResult,
} from "@/lib/server/theory/learning-progress-service";

import type {
  TheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

export type TheoryRecommendationKind =
  | "continue_topic"
  | "review_errors"
  | "weak_topic"
  | "mock_exam"
  | "start_learning";

export interface TheoryRecommendation {
  id: string;
  kind: TheoryRecommendationKind;
  title: string;
  description: string;
  href: string;
  priority: number;
}

export function buildTheoryRecommendations(
  snapshot: TheoryOverviewRepositorySnapshot,
  progress: TheoryLearningProgressResult,
  readiness: ExamReadinessBreakdown,
): readonly TheoryRecommendation[] {
  const result: TheoryRecommendation[] = [];

  if (
    snapshot.questionStats.uniqueQuestionsAnswered === 0
    && snapshot.lessonStats.startedLessons === 0
  ) {
    result.push({
      id: "start-learning",
      kind: "start_learning",
      title: "Deine Lernreise beginnt hier",
      description: "Starte mit deinem ersten veröffentlichten Theorie-Thema.",
      href: "/theorie",
      priority: 100,
    });
  }

  if (snapshot.questionStats.questionsToReview > 0) {
    result.push({
      id: "review-errors",
      kind: "review_errors",
      title: "Fehler wiederholen",
      description: `${snapshot.questionStats.questionsToReview} ${
        snapshot.questionStats.questionsToReview === 1
          ? "Frage wartet"
          : "Fragen warten"
      } auf Wiederholung.`,
      href: "/theorie/fehler",
      priority: 95,
    });
  }

  const weakTopic = [...snapshot.topics]
    .filter((topic) => topic.answeredQuestions > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)[0];

  if (weakTopic && weakTopic.masteryScore < 70) {
    result.push({
      id: `weak-topic-${weakTopic.id}`,
      kind: "weak_topic",
      title: `${weakTopic.title} wiederholen`,
      description:
        `Dein aktueller Meisterungswert liegt bei ${weakTopic.masteryScore} %.`,
      href: `/theorie/${encodeURIComponent(weakTopic.slug)}`,
      priority: 90,
    });
  }

  const continueTopic = [...snapshot.topics]
    .filter((topic) => topic.progressPercent < 100)
    .sort(
      (a, b) =>
        (b.lastTrainedAt?.getTime() ?? 0)
        - (a.lastTrainedAt?.getTime() ?? 0),
    )[0];

  if (continueTopic) {
    result.push({
      id: `continue-topic-${continueTopic.id}`,
      kind: "continue_topic",
      title: "Weiterlernen",
      description:
        `${continueTopic.title}: ${continueTopic.progressPercent} % abgeschlossen.`,
      href: `/theorie/${encodeURIComponent(continueTopic.slug)}`,
      priority: 80,
    });
  }

  if (progress.overallPercent >= 40 && readiness.readinessPercent >= 45) {
    result.push({
      id: "mock-exam",
      kind: "mock_exam",
      title: "Prüfungssimulation",
      description:
        "Teste deinen aktuellen Stand unter den für dein Programm konfigurierten Prüfungsbedingungen.",
      href: "/theorie/pruefungssimulation",
      priority: 70,
    });
  }

  return result.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
