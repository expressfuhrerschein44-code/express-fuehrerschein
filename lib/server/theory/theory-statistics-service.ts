import "server-only";

import type {
  TheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

export interface TheoryStatistics {
  activeQuestions: number;
  uniqueQuestionsLearned: number;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyPercent: number;
  questionsToReview: number;
  masteredQuestions: number;
  totalLessons: number;
  startedLessons: number;
  completedLessons: number;
  totalStudyMinutes: number;
  completedExamCount: number;
  passedExamCount: number;
  averageExamScorePercent: number;
}

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

export function buildTheoryStatistics(
  snapshot: TheoryOverviewRepositorySnapshot,
): TheoryStatistics {
  const completedExams = snapshot.recentExams.filter(
    (exam) => exam.status === "completed",
  );
  const scoredExams = completedExams.filter(
    (exam) => exam.scorePercent !== null,
  );

  const activeStudyMinutes = Math.floor(snapshot.lessonStats.activeStudySeconds / 60);
  const practiceMinutes = Math.floor(
    snapshot.recentTraining.reduce(
      (sum, session) => sum + Math.max(0, session.durationSeconds),
      0,
    ) / 60,
  );

  return {
    activeQuestions: snapshot.questionStats.activeQuestions,
    uniqueQuestionsLearned: snapshot.questionStats.uniqueQuestionsAnswered,
    totalAttempts: snapshot.questionStats.totalAttempts,
    correctAttempts: snapshot.questionStats.correctAttempts,
    incorrectAttempts: snapshot.questionStats.incorrectAttempts,
    accuracyPercent: percent(
      snapshot.questionStats.correctAttempts,
      snapshot.questionStats.totalAttempts,
    ),
    questionsToReview: snapshot.questionStats.questionsToReview,
    masteredQuestions: snapshot.questionStats.masteredQuestions,
    totalLessons: snapshot.lessonStats.totalLessons,
    startedLessons: snapshot.lessonStats.startedLessons,
    completedLessons: snapshot.lessonStats.completedLessons,
    totalStudyMinutes: Math.max(
      snapshot.learningProgress?.totalStudyMinutes ?? 0,
      activeStudyMinutes + practiceMinutes,
    ),
    completedExamCount: completedExams.length,
    passedExamCount: completedExams.filter((exam) => exam.passed === true).length,
    averageExamScorePercent: scoredExams.length
      ? Math.round(
          scoredExams.reduce(
            (sum, exam) => sum + (exam.scorePercent ?? 0),
            0,
          ) / scoredExams.length,
        )
      : 0,
  };
}
