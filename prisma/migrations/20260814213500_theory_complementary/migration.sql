-- ============================================================================
-- Express-Führerschein
-- Migration: theory_complementary
-- Date: 2026-08-14
--
-- PURPOSE
-- -------
-- Completes the existing Theorie persistence foundation without deleting user
-- data or replacing existing tables.
--
-- Existing Theorie tables preserved:
--   learning_progress
--   theory_topics
--   theory_topic_translations
--   theory_questions
--   theory_question_translations
--   user_topic_progress
--   user_question_progress
--   training_sessions
--   exam_attempts
--   exam_attempt_answers
--
-- Added foundation:
--   - country/program scoping
--   - lessons + localized lesson content blocks
--   - lesson progress
--   - persistent favorites
--   - personal notes
--   - question reports
--   - active study sessions
--   - exam configurations
--   - question publication/version metadata + immutable version snapshots
--   - exam configuration snapshot on attempts
--
-- IMPORTANT
-- ---------
-- Existing theory_topics are safely backfilled into a DE legacy programme.
-- No existing rows are deleted.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. THEORY PROGRAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_programs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "country_code" CHAR(2) NOT NULL,
  "license_class_code" VARCHAR(8) NOT NULL,
  "code" VARCHAR(96) NOT NULL,
  "version" VARCHAR(32) NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'draft',
  "is_current" BOOLEAN NOT NULL DEFAULT false,
  "valid_from" DATE,
  "valid_until" DATE,
  "published_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_programs_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_programs_code"
    UNIQUE ("code"),

  CONSTRAINT "uq_theory_programs_country_class_version"
    UNIQUE ("country_code", "license_class_code", "version"),

  CONSTRAINT "chk_theory_programs_country"
    CHECK ("country_code" IN ('DE', 'AT', 'CH', 'BE', 'ES')),

  CONSTRAINT "chk_theory_programs_status"
    CHECK ("status" IN ('draft', 'review', 'published', 'archived')),

  CONSTRAINT "chk_theory_programs_dates"
    CHECK (
      "valid_until" IS NULL
      OR "valid_from" IS NULL
      OR "valid_until" >= "valid_from"
    )
);

CREATE INDEX IF NOT EXISTS "idx_theory_programs_country_class_status"
  ON "theory_programs" ("country_code", "license_class_code", "status");

CREATE INDEX IF NOT EXISTS "idx_theory_programs_current"
  ON "theory_programs" ("country_code", "license_class_code", "is_current")
  WHERE "is_current" = true;

-- Backfill one published DE programme for each class already present.
INSERT INTO "theory_programs" (
  "country_code",
  "license_class_code",
  "code",
  "version",
  "status",
  "is_current",
  "published_at"
)
SELECT DISTINCT
  'DE',
  tt."license_class_code",
  'DE-' || tt."license_class_code" || '-legacy-1',
  'legacy-1',
  'published',
  true,
  CURRENT_TIMESTAMP
FROM "theory_topics" tt
ON CONFLICT ("country_code", "license_class_code", "version")
DO NOTHING;

-- ============================================================================
-- 2. SCOPE EXISTING THEORY TOPICS BY COUNTRY + PROGRAM
-- ============================================================================

ALTER TABLE "theory_topics"
  ADD COLUMN IF NOT EXISTS "country_code" CHAR(2);

ALTER TABLE "theory_topics"
  ADD COLUMN IF NOT EXISTS "program_id" UUID;

UPDATE "theory_topics"
SET "country_code" = 'DE'
WHERE "country_code" IS NULL;

UPDATE "theory_topics" tt
SET "program_id" = tp."id"
FROM "theory_programs" tp
WHERE tt."program_id" IS NULL
  AND tp."country_code" = tt."country_code"
  AND tp."license_class_code" = tt."license_class_code"
  AND tp."is_current" = true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "theory_topics"
    WHERE "country_code" IS NULL
       OR "program_id" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Theory complementary migration cannot continue: theory_topics backfill incomplete.';
  END IF;
END
$$;

ALTER TABLE "theory_topics"
  ALTER COLUMN "country_code" SET NOT NULL;

ALTER TABLE "theory_topics"
  ALTER COLUMN "program_id" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_theory_topics_program'
  ) THEN
    ALTER TABLE "theory_topics"
      ADD CONSTRAINT "fk_theory_topics_program"
      FOREIGN KEY ("program_id")
      REFERENCES "theory_programs"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_theory_topics_country'
  ) THEN
    ALTER TABLE "theory_topics"
      ADD CONSTRAINT "chk_theory_topics_country"
      CHECK ("country_code" IN ('DE', 'AT', 'CH', 'BE', 'ES'));
  END IF;
END
$$;

-- The old constraint prevents the same slug from existing in two programme
-- versions. Replace only the UNIQUE constraint; no rows are deleted.
ALTER TABLE "theory_topics"
  DROP CONSTRAINT IF EXISTS "uq_theory_topics_class_slug";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_theory_topics_program_slug'
  ) THEN
    ALTER TABLE "theory_topics"
      ADD CONSTRAINT "uq_theory_topics_program_slug"
      UNIQUE ("program_id", "slug");
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "idx_theory_topics_program_active_order"
  ON "theory_topics" ("program_id", "is_active", "sort_order");

CREATE INDEX IF NOT EXISTS "idx_theory_topics_country_class_active_order"
  ON "theory_topics" (
    "country_code",
    "license_class_code",
    "is_active",
    "sort_order"
  );

-- ============================================================================
-- 3. QUESTION PUBLICATION + VERSION METADATA
-- ============================================================================

ALTER TABLE "theory_questions"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(24) NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "difficulty" VARCHAR(24) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS "valid_from" DATE,
  ADD COLUMN IF NOT EXISTS "valid_until" DATE,
  ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ(6);

UPDATE "theory_questions"
SET "published_at" = "created_at"
WHERE "status" = 'published'
  AND "published_at" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_theory_questions_status'
  ) THEN
    ALTER TABLE "theory_questions"
      ADD CONSTRAINT "chk_theory_questions_status"
      CHECK ("status" IN ('draft', 'review', 'published', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_theory_questions_version'
  ) THEN
    ALTER TABLE "theory_questions"
      ADD CONSTRAINT "chk_theory_questions_version"
      CHECK ("version" >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_theory_questions_penalty_points'
  ) THEN
    ALTER TABLE "theory_questions"
      ADD CONSTRAINT "chk_theory_questions_penalty_points"
      CHECK ("penalty_points" >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_theory_questions_dates'
  ) THEN
    ALTER TABLE "theory_questions"
      ADD CONSTRAINT "chk_theory_questions_dates"
      CHECK (
        "valid_until" IS NULL
        OR "valid_from" IS NULL
        OR "valid_until" >= "valid_from"
      );
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "idx_theory_questions_status_active"
  ON "theory_questions" ("status", "is_active");

CREATE INDEX IF NOT EXISTS "idx_theory_questions_validity"
  ON "theory_questions" ("valid_from", "valid_until");

-- Immutable question snapshots for audit/history.
CREATE TABLE IF NOT EXISTS "theory_question_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "question_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_question_versions_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_question_versions_question_version"
    UNIQUE ("question_id", "version"),

  CONSTRAINT "fk_theory_question_versions_question"
    FOREIGN KEY ("question_id")
    REFERENCES "theory_questions"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_question_versions_version"
    CHECK ("version" >= 1)
);

CREATE INDEX IF NOT EXISTS "idx_theory_question_versions_question_created"
  ON "theory_question_versions" ("question_id", "created_at" DESC);

-- ============================================================================
-- 4. LESSONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_lessons" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "topic_id" UUID NOT NULL,
  "slug" VARCHAR(96) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "estimated_duration_minutes" SMALLINT,
  "status" VARCHAR(24) NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "valid_from" DATE,
  "valid_until" DATE,
  "published_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_lessons_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_lessons_topic_slug"
    UNIQUE ("topic_id", "slug"),

  CONSTRAINT "fk_theory_lessons_topic"
    FOREIGN KEY ("topic_id")
    REFERENCES "theory_topics"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_lessons_status"
    CHECK ("status" IN ('draft', 'review', 'published', 'archived')),

  CONSTRAINT "chk_theory_lessons_version"
    CHECK ("version" >= 1),

  CONSTRAINT "chk_theory_lessons_duration"
    CHECK (
      "estimated_duration_minutes" IS NULL
      OR "estimated_duration_minutes" >= 0
    ),

  CONSTRAINT "chk_theory_lessons_dates"
    CHECK (
      "valid_until" IS NULL
      OR "valid_from" IS NULL
      OR "valid_until" >= "valid_from"
    )
);

CREATE INDEX IF NOT EXISTS "idx_theory_lessons_topic_status_order"
  ON "theory_lessons" ("topic_id", "status", "sort_order");

CREATE TABLE IF NOT EXISTS "theory_lesson_translations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "lesson_id" UUID NOT NULL,
  "locale" VARCHAR(8) NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_lesson_translations_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_lesson_translations_lesson_locale"
    UNIQUE ("lesson_id", "locale"),

  CONSTRAINT "fk_theory_lesson_translations_lesson"
    FOREIGN KEY ("lesson_id")
    REFERENCES "theory_lessons"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_theory_lesson_translations_locale"
  ON "theory_lesson_translations" ("locale");

CREATE TABLE IF NOT EXISTS "theory_lesson_content_blocks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "lesson_id" UUID NOT NULL,
  "block_type" VARCHAR(32) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "media_storage_path" VARCHAR(768),
  "question_id" UUID,
  "config_json" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_lesson_content_blocks_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "fk_theory_lesson_content_blocks_lesson"
    FOREIGN KEY ("lesson_id")
    REFERENCES "theory_lessons"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_lesson_content_blocks_question"
    FOREIGN KEY ("question_id")
    REFERENCES "theory_questions"("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_lesson_content_blocks_type"
    CHECK (
      "block_type" IN (
        'TEXT',
        'IMAGE',
        'VIDEO',
        'INFO',
        'WARNING',
        'TIP',
        'EXAMPLE',
        'QUESTION'
      )
    )
);

CREATE INDEX IF NOT EXISTS "idx_theory_lesson_content_blocks_lesson_order"
  ON "theory_lesson_content_blocks" ("lesson_id", "is_active", "sort_order");

CREATE INDEX IF NOT EXISTS "idx_theory_lesson_content_blocks_question"
  ON "theory_lesson_content_blocks" ("question_id");

CREATE TABLE IF NOT EXISTS "theory_lesson_content_block_translations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "block_id" UUID NOT NULL,
  "locale" VARCHAR(8) NOT NULL,
  "title" VARCHAR(180),
  "body_text" TEXT,
  "content_json" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_lesson_content_block_translations_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_lesson_block_translations_block_locale"
    UNIQUE ("block_id", "locale"),

  CONSTRAINT "fk_theory_lesson_block_translations_block"
    FOREIGN KEY ("block_id")
    REFERENCES "theory_lesson_content_blocks"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_theory_lesson_block_translations_locale"
  ON "theory_lesson_content_block_translations" ("locale");

-- ============================================================================
-- 5. USER LESSON PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user_lesson_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_license_class_id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  "progress_percent" SMALLINT NOT NULL DEFAULT 0,
  "current_block_index" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "started_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "last_activity_at" TIMESTAMPTZ(6),
  "total_active_seconds" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_lesson_progress_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_user_lesson_progress_user_class_lesson"
    UNIQUE ("user_license_class_id", "lesson_id"),

  CONSTRAINT "fk_user_lesson_progress_user_license_class"
    FOREIGN KEY ("user_license_class_id")
    REFERENCES "user_license_classes"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_user_lesson_progress_lesson"
    FOREIGN KEY ("lesson_id")
    REFERENCES "theory_lessons"("id")
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_user_lesson_progress_percent"
    CHECK ("progress_percent" BETWEEN 0 AND 100),

  CONSTRAINT "chk_user_lesson_progress_block"
    CHECK ("current_block_index" >= 0),

  CONSTRAINT "chk_user_lesson_progress_active_seconds"
    CHECK ("total_active_seconds" >= 0)
);

CREATE INDEX IF NOT EXISTS "idx_user_lesson_progress_user_class_activity"
  ON "user_lesson_progress" ("user_license_class_id", "last_activity_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_user_lesson_progress_lesson"
  ON "user_lesson_progress" ("lesson_id");

-- ============================================================================
-- 6. FAVORITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_question_favorites" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_license_class_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_question_favorites_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_theory_question_favorites_user_class_question"
    UNIQUE ("user_license_class_id", "question_id"),

  CONSTRAINT "fk_theory_question_favorites_user_license_class"
    FOREIGN KEY ("user_license_class_id")
    REFERENCES "user_license_classes"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_question_favorites_question"
    FOREIGN KEY ("question_id")
    REFERENCES "theory_questions"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_theory_question_favorites_user_class_created"
  ON "theory_question_favorites" ("user_license_class_id", "created_at" DESC);

-- ============================================================================
-- 7. PERSONAL THEORY NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_question_notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_license_class_id" UUID NOT NULL,
  "question_id" UUID,
  "lesson_id" UUID,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_question_notes_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "fk_theory_question_notes_user_license_class"
    FOREIGN KEY ("user_license_class_id")
    REFERENCES "user_license_classes"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_question_notes_question"
    FOREIGN KEY ("question_id")
    REFERENCES "theory_questions"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_question_notes_lesson"
    FOREIGN KEY ("lesson_id")
    REFERENCES "theory_lessons"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_question_notes_target"
    CHECK ("question_id" IS NOT NULL OR "lesson_id" IS NOT NULL),

  CONSTRAINT "chk_theory_question_notes_body"
    CHECK (length(btrim("body")) > 0)
);

CREATE INDEX IF NOT EXISTS "idx_theory_question_notes_user_class_created"
  ON "theory_question_notes" ("user_license_class_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_theory_question_notes_question"
  ON "theory_question_notes" ("question_id");

CREATE INDEX IF NOT EXISTS "idx_theory_question_notes_lesson"
  ON "theory_question_notes" ("lesson_id");

-- ============================================================================
-- 8. QUESTION REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_question_reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_license_class_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "reason" VARCHAR(32) NOT NULL,
  "message" TEXT,
  "status" VARCHAR(24) NOT NULL DEFAULT 'open',
  "resolved_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_question_reports_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "fk_theory_question_reports_user_license_class"
    FOREIGN KEY ("user_license_class_id")
    REFERENCES "user_license_classes"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_question_reports_question"
    FOREIGN KEY ("question_id")
    REFERENCES "theory_questions"("id")
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_question_reports_reason"
    CHECK (
      "reason" IN (
        'incorrect_question',
        'incorrect_media',
        'translation',
        'technical',
        'other'
      )
    ),

  CONSTRAINT "chk_theory_question_reports_status"
    CHECK ("status" IN ('open', 'in_review', 'resolved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS "idx_theory_question_reports_user_class_created"
  ON "theory_question_reports" ("user_license_class_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_theory_question_reports_status_created"
  ON "theory_question_reports" ("status", "created_at" DESC);

-- ============================================================================
-- 9. ACTIVE STUDY SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "theory_study_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_license_class_id" UUID NOT NULL,
  "lesson_id" UUID,
  "session_type" VARCHAR(24) NOT NULL DEFAULT 'lesson',
  "status" VARCHAR(24) NOT NULL DEFAULT 'active',
  "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMPTZ(6),
  "active_seconds" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "theory_study_sessions_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "fk_theory_study_sessions_user_license_class"
    FOREIGN KEY ("user_license_class_id")
    REFERENCES "user_license_classes"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT "fk_theory_study_sessions_lesson"
    FOREIGN KEY ("lesson_id")
    REFERENCES "theory_lessons"("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_theory_study_sessions_type"
    CHECK ("session_type" IN ('lesson', 'practice', 'review', 'other')),

  CONSTRAINT "chk_theory_study_sessions_status"
    CHECK ("status" IN ('active', 'paused', 'completed', 'abandoned')),

  CONSTRAINT "chk_theory_study_sessions_active_seconds"
    CHECK ("active_seconds" >= 0)
);

CREATE INDEX IF NOT EXISTS "idx_theory_study_sessions_user_class_started"
  ON "theory_study_sessions" ("user_license_class_id", "started_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_theory_study_sessions_active"
  ON "theory_study_sessions" ("user_license_class_id", "status", "last_activity_at" DESC);

-- ============================================================================
-- 10. EXAM CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS "exam_configurations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "program_id" UUID NOT NULL,
  "version" VARCHAR(32) NOT NULL,
  "question_count" SMALLINT NOT NULL,
  "duration_seconds" INTEGER NOT NULL,
  "scoring_method" VARCHAR(32) NOT NULL,
  "passing_rule" JSONB NOT NULL,
  "status" VARCHAR(24) NOT NULL DEFAULT 'draft',
  "active_from" DATE,
  "active_until" DATE,
  "published_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "exam_configurations_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "uq_exam_configurations_program_version"
    UNIQUE ("program_id", "version"),

  CONSTRAINT "fk_exam_configurations_program"
    FOREIGN KEY ("program_id")
    REFERENCES "theory_programs"("id")
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,

  CONSTRAINT "chk_exam_configurations_question_count"
    CHECK ("question_count" > 0),

  CONSTRAINT "chk_exam_configurations_duration"
    CHECK ("duration_seconds" > 0),

  CONSTRAINT "chk_exam_configurations_status"
    CHECK ("status" IN ('draft', 'review', 'published', 'archived')),

  CONSTRAINT "chk_exam_configurations_dates"
    CHECK (
      "active_until" IS NULL
      OR "active_from" IS NULL
      OR "active_until" >= "active_from"
    )
);

CREATE INDEX IF NOT EXISTS "idx_exam_configurations_program_status_dates"
  ON "exam_configurations" ("program_id", "status", "active_from", "active_until");

-- Link attempts to the exact configuration, while keeping old attempts valid.
ALTER TABLE "exam_attempts"
  ADD COLUMN IF NOT EXISTS "exam_configuration_id" UUID,
  ADD COLUMN IF NOT EXISTS "configuration_snapshot" JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_exam_attempts_configuration'
  ) THEN
    ALTER TABLE "exam_attempts"
      ADD CONSTRAINT "fk_exam_attempts_configuration"
      FOREIGN KEY ("exam_configuration_id")
      REFERENCES "exam_configurations"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "idx_exam_attempts_configuration"
  ON "exam_attempts" ("exam_configuration_id");

-- ============================================================================
-- 11. RLS
-- ============================================================================
-- Existing project tables already use RLS. New tables follow the same posture.
-- No broad client policies are added here: server-side application access stays
-- authoritative until explicit policies are designed and audited.

ALTER TABLE "theory_programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_question_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_lesson_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_lesson_content_blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_lesson_content_block_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_lesson_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_question_favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_question_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_question_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_study_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_configurations" ENABLE ROW LEVEL SECURITY;

COMMIT;
