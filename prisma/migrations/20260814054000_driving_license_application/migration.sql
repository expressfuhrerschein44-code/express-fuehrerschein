-- ============================================================================
-- Express-Führerschein
-- Minimal driving-license application persistence
--
-- SAFE / ADDITIVE MIGRATION:
-- - creates 2 new tables only;
-- - creates indexes/constraints only for those tables;
-- - adds no column to existing tables;
-- - modifies no existing data;
-- - drops nothing.
--
-- Existing authentication, profile, dashboard, learning, documents,
-- conversations, subscriptions and payments tables remain untouched.
-- ============================================================================

CREATE TABLE "driving_license_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "selected_classes" VARCHAR(8)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(8)[],
    "theory_passed" BOOLEAN,
    "practical_passed" BOOLEAN,
    "classes_total_cents" INTEGER NOT NULL DEFAULT 0,
    "processing_fee_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "signature_type" VARCHAR(16),
    "signature_path" VARCHAR(768),
    "status" VARCHAR(24) NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driving_license_applications_pkey"
      PRIMARY KEY ("id"),

    CONSTRAINT "chk_driving_license_applications_status"
      CHECK (
        "status" IN (
          'draft',
          'submitted',
          'in_review',
          'approved',
          'rejected'
        )
      ),

    CONSTRAINT "chk_driving_license_applications_amounts"
      CHECK (
        "classes_total_cents" >= 0
        AND "processing_fee_cents" >= 0
        AND "total_cents" >= 0
        AND "total_cents" = "classes_total_cents" + "processing_fee_cents"
      ),

    CONSTRAINT "chk_driving_license_applications_currency"
      CHECK ("currency" = 'EUR'),

    CONSTRAINT "chk_driving_license_applications_signature"
      CHECK (
        (
          "signature_type" IS NULL
          AND "signature_path" IS NULL
        )
        OR
        (
          "signature_type" IN ('drawn', 'uploaded')
          AND "signature_path" IS NOT NULL
        )
      ),

    CONSTRAINT "chk_driving_license_applications_submission"
      CHECK (
        (
          "status" = 'draft'
          AND "submitted_at" IS NULL
        )
        OR
        (
          "status" <> 'draft'
          AND "submitted_at" IS NOT NULL
        )
      )
);

CREATE TABLE "application_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" VARCHAR(32) NOT NULL,
    "storage_bucket" VARCHAR(63) NOT NULL DEFAULT 'driving-license-documents',
    "storage_path" VARCHAR(768) NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_documents_pkey"
      PRIMARY KEY ("id"),

    CONSTRAINT "chk_application_documents_type"
      CHECK (
        "document_type" IN (
          'id_front',
          'id_back',
          'portrait_photo'
        )
      ),

    CONSTRAINT "chk_application_documents_size"
      CHECK (
        "file_size_bytes" > 0
        AND "file_size_bytes" <= 5242880
      )
);

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

ALTER TABLE "driving_license_applications"
  ADD CONSTRAINT "fk_driving_license_applications_user"
  FOREIGN KEY ("user_id")
  REFERENCES "users"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

ALTER TABLE "application_documents"
  ADD CONSTRAINT "fk_application_documents_application"
  FOREIGN KEY ("application_id")
  REFERENCES "driving_license_applications"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

ALTER TABLE "application_documents"
  ADD CONSTRAINT "fk_application_documents_user"
  FOREIGN KEY ("user_id")
  REFERENCES "users"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

-- ============================================================================
-- UNIQUES
-- ============================================================================

CREATE UNIQUE INDEX "uq_application_documents_application_type"
  ON "application_documents"("application_id", "document_type");

CREATE UNIQUE INDEX "uq_application_documents_storage_object"
  ON "application_documents"("storage_bucket", "storage_path");

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX "idx_driving_license_applications_user_status_updated"
  ON "driving_license_applications"(
    "user_id",
    "status",
    "updated_at" DESC
  );

CREATE INDEX "idx_driving_license_applications_submitted_at"
  ON "driving_license_applications"("submitted_at" DESC);

CREATE INDEX "idx_driving_license_applications_status"
  ON "driving_license_applications"("status");

CREATE INDEX "idx_application_documents_user_created"
  ON "application_documents"(
    "user_id",
    "created_at" DESC
  );

CREATE INDEX "idx_application_documents_application"
  ON "application_documents"("application_id");

CREATE INDEX "idx_application_documents_type"
  ON "application_documents"("document_type");

-- ============================================================================
-- SUPABASE RLS
-- ============================================================================
-- The application accesses these tables through the server-side PostgreSQL
-- connection. RLS is enabled so browser/anon Data API access is denied unless
-- explicit policies are added later.
-- ============================================================================

ALTER TABLE "driving_license_applications"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "application_documents"
  ENABLE ROW LEVEL SECURITY;
