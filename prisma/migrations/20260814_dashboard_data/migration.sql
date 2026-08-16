-- ============================================================================
-- Express-Führerschein
-- Client Platform + Dashboard Data Foundation
--
-- Adds only NEW tables required for:
-- - real dashboard metrics
-- - theory/topic/question progress
-- - training and exam simulations
-- - appointments
-- - client document metadata (PDF/images stored in Supabase Storage)
-- - messages/support conversations
-- - subscriptions/payments
--
-- Existing authentication and client-foundation tables are NOT dropped,
-- renamed, or recreated.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- THEORY TOPICS
-- ---------------------------------------------------------------------------

CREATE TABLE "theory_topics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "license_class_code" VARCHAR(8) NOT NULL,
    "slug" VARCHAR(96) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_topics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_theory_topics_license_class_code"
      CHECK ("license_class_code" ~ '^[A-Z0-9]{1,8}$'),
    CONSTRAINT "chk_theory_topics_slug"
      CHECK (length(trim("slug")) > 0),
    CONSTRAINT "chk_theory_topics_sort_order"
      CHECK ("sort_order" >= 0)
);

CREATE UNIQUE INDEX "uq_theory_topics_class_slug"
ON "theory_topics"("license_class_code", "slug");

CREATE INDEX "idx_theory_topics_class_active_order"
ON "theory_topics"("license_class_code", "is_active", "sort_order");

-- ---------------------------------------------------------------------------
-- THEORY TOPIC TRANSLATIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "theory_topic_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" UUID NOT NULL,
    "locale" VARCHAR(8) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_topic_translations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_theory_topic_translations_locale"
      CHECK ("locale" IN ('de', 'fr', 'nl', 'es', 'it', 'en')),
    CONSTRAINT "chk_theory_topic_translations_title"
      CHECK (length(trim("title")) > 0)
);

CREATE UNIQUE INDEX "uq_theory_topic_translations_topic_locale"
ON "theory_topic_translations"("topic_id", "locale");

CREATE INDEX "idx_theory_topic_translations_locale"
ON "theory_topic_translations"("locale");

ALTER TABLE "theory_topic_translations"
ADD CONSTRAINT "fk_theory_topic_translations_topic"
FOREIGN KEY ("topic_id")
REFERENCES "theory_topics"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- THEORY QUESTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "theory_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" UUID NOT NULL,
    "external_ref" VARCHAR(128),
    "question_type" VARCHAR(32) NOT NULL DEFAULT 'single_choice',
    "penalty_points" SMALLINT NOT NULL DEFAULT 0,
    "media_storage_path" VARCHAR(768),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_theory_questions_type"
      CHECK ("question_type" IN (
        'single_choice',
        'multiple_choice',
        'number',
        'image',
        'video',
        'interactive'
      )),
    CONSTRAINT "chk_theory_questions_penalty_points"
      CHECK ("penalty_points" BETWEEN 0 AND 10)
);

CREATE UNIQUE INDEX "uq_theory_questions_topic_external_ref"
ON "theory_questions"("topic_id", "external_ref");

CREATE INDEX "idx_theory_questions_topic_active"
ON "theory_questions"("topic_id", "is_active");

ALTER TABLE "theory_questions"
ADD CONSTRAINT "fk_theory_questions_topic"
FOREIGN KEY ("topic_id")
REFERENCES "theory_topics"("id")
ON DELETE RESTRICT
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- THEORY QUESTION TRANSLATIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "theory_question_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "locale" VARCHAR(8) NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "answer_options" JSONB,
    "correct_answer" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_question_translations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_theory_question_translations_locale"
      CHECK ("locale" IN ('de', 'fr', 'nl', 'es', 'it', 'en')),
    CONSTRAINT "chk_theory_question_translations_prompt"
      CHECK (length(trim("prompt")) > 0)
);

CREATE UNIQUE INDEX "uq_theory_question_translations_question_locale"
ON "theory_question_translations"("question_id", "locale");

CREATE INDEX "idx_theory_question_translations_locale"
ON "theory_question_translations"("locale");

ALTER TABLE "theory_question_translations"
ADD CONSTRAINT "fk_theory_question_translations_question"
FOREIGN KEY ("question_id")
REFERENCES "theory_questions"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- USER TOPIC PROGRESS
-- ---------------------------------------------------------------------------

CREATE TABLE "user_topic_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_license_class_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "answered_questions" INTEGER NOT NULL DEFAULT 0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
    "progress_percent" SMALLINT NOT NULL DEFAULT 0,
    "mastery_score" SMALLINT NOT NULL DEFAULT 0,
    "last_trained_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_user_topic_progress_answered"
      CHECK ("answered_questions" >= 0),
    CONSTRAINT "chk_user_topic_progress_correct"
      CHECK ("correct_answers" >= 0),
    CONSTRAINT "chk_user_topic_progress_incorrect"
      CHECK ("incorrect_answers" >= 0),
    CONSTRAINT "chk_user_topic_progress_counts"
      CHECK (
        "correct_answers" + "incorrect_answers" <= "answered_questions"
      ),
    CONSTRAINT "chk_user_topic_progress_percent"
      CHECK ("progress_percent" BETWEEN 0 AND 100),
    CONSTRAINT "chk_user_topic_progress_mastery"
      CHECK ("mastery_score" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "uq_user_topic_progress_user_class_topic"
ON "user_topic_progress"("user_license_class_id", "topic_id");

CREATE INDEX "idx_user_topic_progress_user_class_progress"
ON "user_topic_progress"("user_license_class_id", "progress_percent");

CREATE INDEX "idx_user_topic_progress_last_trained"
ON "user_topic_progress"("last_trained_at" DESC);

ALTER TABLE "user_topic_progress"
ADD CONSTRAINT "fk_user_topic_progress_user_license_class"
FOREIGN KEY ("user_license_class_id")
REFERENCES "user_license_classes"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "user_topic_progress"
ADD CONSTRAINT "fk_user_topic_progress_topic"
FOREIGN KEY ("topic_id")
REFERENCES "theory_topics"("id")
ON DELETE RESTRICT
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- USER QUESTION PROGRESS
-- ---------------------------------------------------------------------------

CREATE TABLE "user_question_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_license_class_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "incorrect_count" INTEGER NOT NULL DEFAULT 0,
    "last_answer_correct" BOOLEAN,
    "is_mastered" BOOLEAN NOT NULL DEFAULT false,
    "needs_review" BOOLEAN NOT NULL DEFAULT false,
    "last_answered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_question_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_user_question_progress_attempts"
      CHECK ("attempt_count" >= 0),
    CONSTRAINT "chk_user_question_progress_correct"
      CHECK ("correct_count" >= 0),
    CONSTRAINT "chk_user_question_progress_incorrect"
      CHECK ("incorrect_count" >= 0),
    CONSTRAINT "chk_user_question_progress_counts"
      CHECK (
        "correct_count" + "incorrect_count" <= "attempt_count"
      )
);

CREATE UNIQUE INDEX "uq_user_question_progress_user_class_question"
ON "user_question_progress"("user_license_class_id", "question_id");

CREATE INDEX "idx_user_question_progress_review"
ON "user_question_progress"("user_license_class_id", "needs_review");

CREATE INDEX "idx_user_question_progress_last_answered"
ON "user_question_progress"("last_answered_at" DESC);

ALTER TABLE "user_question_progress"
ADD CONSTRAINT "fk_user_question_progress_user_license_class"
FOREIGN KEY ("user_license_class_id")
REFERENCES "user_license_classes"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "user_question_progress"
ADD CONSTRAINT "fk_user_question_progress_question"
FOREIGN KEY ("question_id")
REFERENCES "theory_questions"("id")
ON DELETE RESTRICT
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- TRAINING SESSIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_license_class_id" UUID NOT NULL,
    "topic_id" UUID,
    "session_type" VARCHAR(32) NOT NULL DEFAULT 'mixed',
    "questions_answered" INTEGER NOT NULL DEFAULT 0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
    "score_percent" SMALLINT,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_training_sessions_type"
      CHECK ("session_type" IN ('topic', 'mistakes', 'mixed', 'exam_prep')),
    CONSTRAINT "chk_training_sessions_questions"
      CHECK ("questions_answered" >= 0),
    CONSTRAINT "chk_training_sessions_correct"
      CHECK ("correct_answers" >= 0),
    CONSTRAINT "chk_training_sessions_incorrect"
      CHECK ("incorrect_answers" >= 0),
    CONSTRAINT "chk_training_sessions_counts"
      CHECK (
        "correct_answers" + "incorrect_answers" <= "questions_answered"
      ),
    CONSTRAINT "chk_training_sessions_score"
      CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
    CONSTRAINT "chk_training_sessions_duration"
      CHECK ("duration_seconds" >= 0),
    CONSTRAINT "chk_training_sessions_dates"
      CHECK ("completed_at" IS NULL OR "completed_at" >= "started_at")
);

CREATE INDEX "idx_training_sessions_user_class_started"
ON "training_sessions"("user_license_class_id", "started_at" DESC);

CREATE INDEX "idx_training_sessions_topic"
ON "training_sessions"("topic_id");

ALTER TABLE "training_sessions"
ADD CONSTRAINT "fk_training_sessions_user_license_class"
FOREIGN KEY ("user_license_class_id")
REFERENCES "user_license_classes"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "training_sessions"
ADD CONSTRAINT "fk_training_sessions_topic"
FOREIGN KEY ("topic_id")
REFERENCES "theory_topics"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- EXAM ATTEMPTS
-- ---------------------------------------------------------------------------

CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_license_class_id" UUID NOT NULL,
    "attempt_type" VARCHAR(32) NOT NULL DEFAULT 'theory_simulation',
    "status" VARCHAR(24) NOT NULL DEFAULT 'in_progress',
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "answered_questions" INTEGER NOT NULL DEFAULT 0,
    "correct_answers" INTEGER NOT NULL DEFAULT 0,
    "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
    "penalty_points" INTEGER NOT NULL DEFAULT 0,
    "score_percent" SMALLINT,
    "passed" BOOLEAN,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_exam_attempts_type"
      CHECK ("attempt_type" IN ('theory_simulation', 'official_theory', 'practice')),
    CONSTRAINT "chk_exam_attempts_status"
      CHECK ("status" IN ('in_progress', 'completed', 'abandoned')),
    CONSTRAINT "chk_exam_attempts_total"
      CHECK ("total_questions" >= 0),
    CONSTRAINT "chk_exam_attempts_answered"
      CHECK ("answered_questions" >= 0 AND "answered_questions" <= "total_questions"),
    CONSTRAINT "chk_exam_attempts_correct"
      CHECK ("correct_answers" >= 0),
    CONSTRAINT "chk_exam_attempts_incorrect"
      CHECK ("incorrect_answers" >= 0),
    CONSTRAINT "chk_exam_attempts_counts"
      CHECK (
        "correct_answers" + "incorrect_answers" <= "answered_questions"
      ),
    CONSTRAINT "chk_exam_attempts_penalty"
      CHECK ("penalty_points" >= 0),
    CONSTRAINT "chk_exam_attempts_score"
      CHECK ("score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100),
    CONSTRAINT "chk_exam_attempts_dates"
      CHECK ("completed_at" IS NULL OR "completed_at" >= "started_at")
);

CREATE INDEX "idx_exam_attempts_user_class_started"
ON "exam_attempts"("user_license_class_id", "started_at" DESC);

CREATE INDEX "idx_exam_attempts_user_class_status"
ON "exam_attempts"("user_license_class_id", "status");

CREATE INDEX "idx_exam_attempts_user_class_passed"
ON "exam_attempts"("user_license_class_id", "passed");

ALTER TABLE "exam_attempts"
ADD CONSTRAINT "fk_exam_attempts_user_license_class"
FOREIGN KEY ("user_license_class_id")
REFERENCES "user_license_classes"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- EXAM ATTEMPT ANSWERS
-- ---------------------------------------------------------------------------

CREATE TABLE "exam_attempt_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "answer_payload" JSONB,
    "is_correct" BOOLEAN,
    "penalty_points" SMALLINT NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempt_answers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_exam_attempt_answers_penalty"
      CHECK ("penalty_points" >= 0)
);

CREATE UNIQUE INDEX "uq_exam_attempt_answers_attempt_question"
ON "exam_attempt_answers"("exam_attempt_id", "question_id");

CREATE INDEX "idx_exam_attempt_answers_question"
ON "exam_attempt_answers"("question_id");

ALTER TABLE "exam_attempt_answers"
ADD CONSTRAINT "fk_exam_attempt_answers_attempt"
FOREIGN KEY ("exam_attempt_id")
REFERENCES "exam_attempts"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "exam_attempt_answers"
ADD CONSTRAINT "fk_exam_attempt_answers_question"
FOREIGN KEY ("question_id")
REFERENCES "theory_questions"("id")
ON DELETE RESTRICT
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- USER APPOINTMENTS
-- ---------------------------------------------------------------------------

CREATE TABLE "user_appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "user_license_class_id" UUID,
    "appointment_type" VARCHAR(32) NOT NULL DEFAULT 'other',
    "title" VARCHAR(160) NOT NULL,
    "location" VARCHAR(255),
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "status" VARCHAR(24) NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_appointments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_user_appointments_type"
      CHECK ("appointment_type" IN (
        'theory_exam',
        'practical_exam',
        'driving_lesson',
        'theory_lesson',
        'school_appointment',
        'document_appointment',
        'other'
      )),
    CONSTRAINT "chk_user_appointments_status"
      CHECK ("status" IN (
        'scheduled',
        'confirmed',
        'completed',
        'canceled',
        'missed'
      )),
    CONSTRAINT "chk_user_appointments_title"
      CHECK (length(trim("title")) > 0),
    CONSTRAINT "chk_user_appointments_dates"
      CHECK ("ends_at" IS NULL OR "ends_at" > "starts_at")
);

CREATE INDEX "idx_user_appointments_user_starts"
ON "user_appointments"("user_id", "starts_at");

CREATE INDEX "idx_user_appointments_user_status_starts"
ON "user_appointments"("user_id", "status", "starts_at");

CREATE INDEX "idx_user_appointments_user_license_class"
ON "user_appointments"("user_license_class_id");

ALTER TABLE "user_appointments"
ADD CONSTRAINT "fk_user_appointments_user"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "user_appointments"
ADD CONSTRAINT "fk_user_appointments_user_license_class"
FOREIGN KEY ("user_license_class_id")
REFERENCES "user_license_classes"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- USER DOCUMENTS
--
-- IMPORTANT:
-- PostgreSQL stores metadata only.
-- The binary file must be uploaded/deleted via Supabase Storage API.
-- ---------------------------------------------------------------------------

CREATE TABLE "user_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "document_type" VARCHAR(32) NOT NULL DEFAULT 'other',
    "title" VARCHAR(160),
    "original_filename" VARCHAR(255) NOT NULL,
    "storage_bucket" VARCHAR(63) NOT NULL,
    "storage_path" VARCHAR(768) NOT NULL,
    "preview_storage_path" VARCHAR(768),
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "checksum_sha256" CHAR(64),
    "status" VARCHAR(24) NOT NULL DEFAULT 'uploaded',
    "rejection_reason" TEXT,
    "expires_on" DATE,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_user_documents_type"
      CHECK ("document_type" IN (
        'identity',
        'residence',
        'biometric_photo',
        'eyesight_test',
        'first_aid',
        'existing_license',
        'application',
        'payment',
        'message_attachment',
        'other'
      )),
    CONSTRAINT "chk_user_documents_mime"
      CHECK ("mime_type" IN (
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif'
      )),
    CONSTRAINT "chk_user_documents_size"
      CHECK ("file_size_bytes" > 0),
    CONSTRAINT "chk_user_documents_checksum"
      CHECK (
        "checksum_sha256" IS NULL
        OR "checksum_sha256" ~ '^[0-9a-f]{64}$'
      ),
    CONSTRAINT "chk_user_documents_status"
      CHECK ("status" IN (
        'uploaded',
        'processing',
        'verified',
        'rejected',
        'deleted'
      )),
    CONSTRAINT "chk_user_documents_filename"
      CHECK (length(trim("original_filename")) > 0),
    CONSTRAINT "chk_user_documents_storage_bucket"
      CHECK (length(trim("storage_bucket")) > 0),
    CONSTRAINT "chk_user_documents_storage_path"
      CHECK (length(trim("storage_path")) > 0)
);

CREATE UNIQUE INDEX "uq_user_documents_storage_object"
ON "user_documents"("storage_bucket", "storage_path");

CREATE INDEX "idx_user_documents_user_status_created"
ON "user_documents"("user_id", "status", "created_at" DESC);

CREATE INDEX "idx_user_documents_user_type"
ON "user_documents"("user_id", "document_type");

ALTER TABLE "user_documents"
ADD CONSTRAINT "fk_user_documents_user"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- CONVERSATIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "conversation_type" VARCHAR(24) NOT NULL DEFAULT 'general',
    "subject" VARCHAR(200),
    "status" VARCHAR(24) NOT NULL DEFAULT 'open',
    "last_message_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_conversations_type"
      CHECK ("conversation_type" IN ('general', 'support', 'system')),
    CONSTRAINT "chk_conversations_status"
      CHECK ("status" IN ('open', 'closed', 'archived'))
);

CREATE INDEX "idx_conversations_user_status_last_message"
ON "conversations"("user_id", "status", "last_message_at" DESC);

ALTER TABLE "conversations"
ADD CONSTRAINT "fk_conversations_user"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- CONVERSATION MESSAGES
-- ---------------------------------------------------------------------------

CREATE TABLE "conversation_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_type" VARCHAR(16) NOT NULL,
    "sender_user_id" UUID,
    "body" TEXT,
    "attachment_document_id" UUID,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_conversation_messages_sender"
      CHECK ("sender_type" IN ('user', 'support', 'system')),
    CONSTRAINT "chk_conversation_messages_content"
      CHECK (
        ("body" IS NOT NULL AND length(trim("body")) > 0)
        OR "attachment_document_id" IS NOT NULL
      )
);

CREATE INDEX "idx_conversation_messages_conversation_created"
ON "conversation_messages"("conversation_id", "created_at");

CREATE INDEX "idx_conversation_messages_conversation_read"
ON "conversation_messages"("conversation_id", "read_at");

CREATE INDEX "idx_conversation_messages_document"
ON "conversation_messages"("attachment_document_id");

ALTER TABLE "conversation_messages"
ADD CONSTRAINT "fk_conversation_messages_conversation"
FOREIGN KEY ("conversation_id")
REFERENCES "conversations"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "conversation_messages"
ADD CONSTRAINT "fk_conversation_messages_document"
FOREIGN KEY ("attachment_document_id")
REFERENCES "user_documents"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_code" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "provider_customer_id" VARCHAR(255),
    "provider_subscription_id" VARCHAR(255),
    "status" VARCHAR(24) NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMPTZ(6),
    "current_period_end" TIMESTAMPTZ(6),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_subscriptions_status"
      CHECK ("status" IN (
        'trialing',
        'active',
        'past_due',
        'incomplete',
        'canceled',
        'expired'
      )),
    CONSTRAINT "chk_subscriptions_plan"
      CHECK (length(trim("plan_code")) > 0),
    CONSTRAINT "chk_subscriptions_provider"
      CHECK (length(trim("provider")) > 0),
    CONSTRAINT "chk_subscriptions_period"
      CHECK (
        "current_period_end" IS NULL
        OR "current_period_start" IS NULL
        OR "current_period_end" >= "current_period_start"
      )
);

CREATE UNIQUE INDEX "uq_subscriptions_provider_subscription_id"
ON "subscriptions"("provider_subscription_id");

CREATE INDEX "idx_subscriptions_user_status"
ON "subscriptions"("user_id", "status");

CREATE INDEX "idx_subscriptions_provider_customer"
ON "subscriptions"("provider", "provider_customer_id");

ALTER TABLE "subscriptions"
ADD CONSTRAINT "fk_subscriptions_user"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------

CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "subscription_id" UUID,
    "provider" VARCHAR(32) NOT NULL,
    "provider_payment_id" VARCHAR(255),
    "amount_cents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "status" VARCHAR(24) NOT NULL DEFAULT 'pending',
    "description" VARCHAR(255),
    "paid_at" TIMESTAMPTZ(6),
    "refunded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_payments_amount"
      CHECK ("amount_cents" >= 0),
    CONSTRAINT "chk_payments_currency"
      CHECK ("currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "chk_payments_status"
      CHECK ("status" IN (
        'pending',
        'succeeded',
        'failed',
        'refunded',
        'partially_refunded',
        'canceled'
      )),
    CONSTRAINT "chk_payments_provider"
      CHECK (length(trim("provider")) > 0)
);

CREATE UNIQUE INDEX "uq_payments_provider_payment_id"
ON "payments"("provider_payment_id");

CREATE INDEX "idx_payments_user_created"
ON "payments"("user_id", "created_at" DESC);

CREATE INDEX "idx_payments_subscription"
ON "payments"("subscription_id");

CREATE INDEX "idx_payments_status"
ON "payments"("status");

ALTER TABLE "payments"
ADD CONSTRAINT "fk_payments_user"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "payments"
ADD CONSTRAINT "fk_payments_subscription"
FOREIGN KEY ("subscription_id")
REFERENCES "subscriptions"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;

-- ---------------------------------------------------------------------------
-- RLS HARDENING
--
-- These public-schema tables are server-side application tables.
-- No anon/authenticated browser policy is added here.
-- Prisma accesses them server-side through the database connection.
-- ---------------------------------------------------------------------------

ALTER TABLE "theory_topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_topic_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theory_question_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_topic_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_question_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_attempt_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
