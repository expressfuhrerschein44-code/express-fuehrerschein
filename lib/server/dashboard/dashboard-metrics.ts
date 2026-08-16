/**
 * Express-Führerschein
 * Pure dashboard metric helpers.
 *
 * No database access belongs in this file.
 */

import {
  DASHBOARD_PROGRAM_DAYS,
  DASHBOARD_READINESS_LABELS,
} from "@/data/dashboard";

import type {
  DashboardReadiness,
  DashboardReadinessLevel,
} from "@/types/dashboard";

/* ==========================================================================
   GENERIC NUMERIC HELPERS
   ========================================================================== */

export function clampNumber(
  value:
    number,

  min:
    number,

  max:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return min;
  }

  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

export function roundPercent(
  value:
    number,
): number {
  return Math.round(
    clampNumber(
      value,
      0,
      100,
    ),
  );
}

export function percent(
  numerator:
    number,

  denominator:
    number,
): number {
  if (
    denominator <=
    0
  ) {
    return 0;
  }

  return roundPercent(
    (
      numerator /
      denominator
    ) *
      100,
  );
}

/* ==========================================================================
   PROGRESS
   ========================================================================== */

export function calculateRemainingProgramDays(
  currentDay:
    number,
): number {
  const safeCurrentDay =
    Math.round(
      clampNumber(
        currentDay,
        1,
        DASHBOARD_PROGRAM_DAYS,
      ),
    );

  return Math.max(
    0,
    DASHBOARD_PROGRAM_DAYS -
      safeCurrentDay,
  );
}

export function calculateOverallProgressPercent(
  completedDays:
    number,

  topicProgress:
    readonly number[],
): number {
  const validTopicProgress =
    topicProgress.filter(
      (value) =>
        Number.isFinite(
          value,
        ),
    );

  if (
    validTopicProgress.length >
    0
  ) {
    const total =
      validTopicProgress.reduce(
        (
          sum,
          value,
        ) =>
          sum +
          clampNumber(
            value,
            0,
            100,
          ),
        0,
      );

    return roundPercent(
      total /
        validTopicProgress.length,
    );
  }

  return percent(
    completedDays,
    DASHBOARD_PROGRAM_DAYS,
  );
}

/* ==========================================================================
   ANSWERS / EXAMS
   ========================================================================== */

export function calculateAccuracyPercent(
  correct:
    number,

  answered:
    number,
): number {
  return percent(
    correct,
    answered,
  );
}

export function calculateExamPassRatePercent(
  passed:
    number,

  completed:
    number,
): number {
  return percent(
    passed,
    completed,
  );
}

/* ==========================================================================
   READINESS
   ========================================================================== */

export function readinessLevelFromPercent(
  readinessPercent:
    number,
): DashboardReadinessLevel {
  const value =
    roundPercent(
      readinessPercent,
    );

  if (
    value >=
    85
  ) {
    return "almost_ready";
  }

  if (
    value >=
    70
  ) {
    return "well_prepared";
  }

  if (
    value >=
    50
  ) {
    return "progressing";
  }

  return "not_ready";
}

export function buildReadiness(
  readinessPercent:
    number,
): DashboardReadiness {
  const safePercent =
    roundPercent(
      readinessPercent,
    );

  const level =
    readinessLevelFromPercent(
      safePercent,
    );

  return {
    percent:
      safePercent,

    level,

    label:
      DASHBOARD_READINESS_LABELS[
        level
      ],
  };
}

/**
 * Fallback readiness used only if no persisted learning_progress row exists.
 *
 * It derives readiness from real platform activity:
 * - answer accuracy;
 * - average topic mastery;
 * - completed exam pass rate.
 *
 * With no activity, all components are 0 and readiness is 0.
 */
export function calculateDerivedReadinessPercent(
  accuracyPercent:
    number,

  topicMasteryScores:
    readonly number[],

  examPassRatePercent:
    number,
): number {
  const mastery =
    topicMasteryScores.length >
    0
      ? topicMasteryScores.reduce(
          (
            sum,
            value,
          ) =>
            sum +
            clampNumber(
              value,
              0,
              100,
            ),
          0,
        ) /
        topicMasteryScores.length
      : 0;

  const weighted =
    (
      clampNumber(
        accuracyPercent,
        0,
        100,
      ) *
      0.45
    ) +
    (
      mastery *
      0.35
    ) +
    (
      clampNumber(
        examPassRatePercent,
        0,
        100,
      ) *
      0.20
    );

  return roundPercent(
    weighted,
  );
}
