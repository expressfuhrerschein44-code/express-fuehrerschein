/**
 * Express-Führerschein
 * Safe Prisma schema patcher for the Theorie complementary migration.
 *
 * This script:
 * - NEVER replaces prisma/schema.prisma wholesale;
 * - preserves every unrelated model already present;
 * - refuses to continue when required anchors are missing;
 * - is idempotent for the fields/models it manages;
 * - creates prisma/schema.prisma.before-theory-complement.bak once.
 *
 * Run:
 *   node scripts/apply-theory-prisma-complement.mjs
 *   npx prisma format
 *   npx prisma validate
 */

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
const backupPath = path.join(
  projectRoot,
  "prisma",
  "schema.prisma.before-theory-complement.bak",
);

if (!fs.existsSync(schemaPath)) {
  throw new Error(
    `[Express-Führerschein] Prisma schema not found: ${schemaPath}`,
  );
}

let schema = fs.readFileSync(schemaPath, "utf8");

function findModelBounds(modelName) {
  const marker = `model ${modelName} {`;
  const start = schema.indexOf(marker);

  if (start < 0) {
    throw new Error(
      `[Express-Führerschein] Required Prisma model not found: ${modelName}`,
    );
  }

  let depth = 0;
  let opened = false;

  for (let index = start; index < schema.length; index += 1) {
    const char = schema[index];

    if (char === "{") {
      depth += 1;
      opened = true;
    } else if (char === "}") {
      depth -= 1;

      if (opened && depth === 0) {
        return {
          start,
          end: index + 1,
        };
      }
    }
  }

  throw new Error(
    `[Express-Führerschein] Could not determine Prisma model bounds: ${modelName}`,
  );
}

function getModel(modelName) {
  const { start, end } = findModelBounds(modelName);
  return schema.slice(start, end);
}

function replaceModel(modelName, newBlock) {
  const { start, end } = findModelBounds(modelName);
  schema =
    schema.slice(0, start) +
    newBlock +
    schema.slice(end);
}

function insertFieldBeforeRelations(modelName, fieldLine, uniqueToken) {
  if (getModel(modelName).includes(uniqueToken)) {
    return;
  }

  const block = getModel(modelName);
  const lines = block.split("\n");

  // Insert before the first obvious relation/@@ line after scalar fields.
  let insertion = lines.findIndex(
    (line, index) =>
      index > 0 &&
      (
        /^\s{2}[A-Za-z_][A-Za-z0-9_]*\s+[A-Za-z_][A-Za-z0-9_]*[?]?\s+@relation/.test(line) ||
        /^\s{2}[A-Za-z_][A-Za-z0-9_]*\s+[A-Za-z_][A-Za-z0-9_]*\[\]/.test(line) ||
        /^\s{2}@@/.test(line)
      ),
  );

  if (insertion < 0) {
    insertion = lines.length - 1;
  }

  lines.splice(insertion, 0, fieldLine);
  replaceModel(modelName, lines.join("\n"));
}

function insertRelationBeforeIndexes(modelName, relationLine, uniqueToken) {
  if (getModel(modelName).includes(uniqueToken)) {
    return;
  }

  const block = getModel(modelName);
  const lines = block.split("\n");

  let insertion = lines.findIndex(
    (line) => /^\s{2}@@/.test(line),
  );

  if (insertion < 0) {
    insertion = lines.length - 1;
  }

  lines.splice(insertion, 0, relationLine);
  replaceModel(modelName, lines.join("\n"));
}

function replaceLineInModel(modelName, matcher, replacement, required = true) {
  const block = getModel(modelName);

  if (block.includes(replacement.trim())) {
    return;
  }

  const next = block.replace(matcher, replacement);

  if (next === block && required) {
    throw new Error(
      `[Express-Führerschein] Expected Prisma line not found in ${modelName}. Refusing unsafe patch.`,
    );
  }

  replaceModel(modelName, next);
}

function appendModelIfMissing(modelName, block) {
  if (schema.includes(`model ${modelName} {`)) {
    return;
  }

  schema = `${schema.trimEnd()}\n\n${block.trim()}\n`;
}

// ---------------------------------------------------------------------------
// Existing relation-side updates.
// ---------------------------------------------------------------------------

insertRelationBeforeIndexes(
  "user_license_classes",
  "  user_lesson_progress    user_lesson_progress[]",
  "user_lesson_progress",
);

insertRelationBeforeIndexes(
  "user_license_classes",
  "  theory_question_favorites theory_question_favorites[]",
  "theory_question_favorites",
);

insertRelationBeforeIndexes(
  "user_license_classes",
  "  theory_question_notes   theory_question_notes[]",
  "theory_question_notes",
);

insertRelationBeforeIndexes(
  "user_license_classes",
  "  theory_question_reports theory_question_reports[]",
  "theory_question_reports",
);

insertRelationBeforeIndexes(
  "user_license_classes",
  "  theory_study_sessions   theory_study_sessions[]",
  "theory_study_sessions",
);

// theory_topics: add scalar scope.
insertFieldBeforeRelations(
  "theory_topics",
  "  country_code       String   @db.Char(2)",
  "country_code",
);

insertFieldBeforeRelations(
  "theory_topics",
  "  program_id         String   @db.Uuid",
  "program_id",
);

insertRelationBeforeIndexes(
  "theory_topics",
  "  theory_programs   theory_programs @relation(fields: [program_id], references: [id], onDelete: Restrict, onUpdate: NoAction, map: \"fk_theory_topics_program\")",
  "fk_theory_topics_program",
);

insertRelationBeforeIndexes(
  "theory_topics",
  "  lessons           theory_lessons[]",
  "theory_lessons[]",
);

// Replace the old unique that cannot support programme versions.
replaceLineInModel(
  "theory_topics",
  /^\s{2}@@unique\(\[license_class_code,\s*slug\],\s*map:\s*"uq_theory_topics_class_slug"\)\s*$/m,
  '  @@unique([program_id, slug], map: "uq_theory_topics_program_slug")',
);

insertRelationBeforeIndexes(
  "theory_topics",
  '  // Country/program indexes are also created by the SQL migration.',
  "Country/program indexes are also created",
);

// theory_questions publication/version fields.
for (const [line, token] of [
  ['  status             String    @default("published") @db.VarChar(24)', "status"],
  ["  version            Int       @default(1)", "version"],
  ['  difficulty         String    @default("standard") @db.VarChar(24)', "difficulty"],
  ["  valid_from         DateTime? @db.Date", "valid_from"],
  ["  valid_until        DateTime? @db.Date", "valid_until"],
  ["  published_at       DateTime? @db.Timestamptz(6)", "published_at"],
]) {
  insertFieldBeforeRelations(
    "theory_questions",
    line,
    token,
  );
}

for (const [line, token] of [
  ["  versions             theory_question_versions[]", "theory_question_versions[]"],
  ["  lesson_content_blocks theory_lesson_content_blocks[]", "theory_lesson_content_blocks[]"],
  ["  favorites            theory_question_favorites[]", "theory_question_favorites[]"],
  ["  notes                theory_question_notes[]", "theory_question_notes[]"],
  ["  reports              theory_question_reports[]", "theory_question_reports[]"],
]) {
  insertRelationBeforeIndexes(
    "theory_questions",
    line,
    token,
  );
}

// exam_attempts configuration.
insertFieldBeforeRelations(
  "exam_attempts",
  "  exam_configuration_id  String?   @db.Uuid",
  "exam_configuration_id",
);

insertFieldBeforeRelations(
  "exam_attempts",
  "  configuration_snapshot Json?",
  "configuration_snapshot",
);

insertRelationBeforeIndexes(
  "exam_attempts",
  '  exam_configurations   exam_configurations? @relation(fields: [exam_configuration_id], references: [id], onDelete: SetNull, onUpdate: NoAction, map: "fk_exam_attempts_configuration")',
  "fk_exam_attempts_configuration",
);

// ---------------------------------------------------------------------------
// New models.
// ---------------------------------------------------------------------------

const newModels = String.raw`
model theory_programs {
  id                 String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  country_code       String    @db.Char(2)
  license_class_code String    @db.VarChar(8)
  code               String    @unique(map: "uq_theory_programs_code") @db.VarChar(96)
  version            String    @db.VarChar(32)
  status             String    @default("draft") @db.VarChar(24)
  is_current         Boolean   @default(false)
  valid_from         DateTime? @db.Date
  valid_until        DateTime? @db.Date
  published_at       DateTime? @db.Timestamptz(6)
  created_at         DateTime  @default(now()) @db.Timestamptz(6)
  updated_at         DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  topics              theory_topics[]
  exam_configurations exam_configurations[]

  @@unique([country_code, license_class_code, version], map: "uq_theory_programs_country_class_version")
  @@index([country_code, license_class_code, status], map: "idx_theory_programs_country_class_status")
}

model theory_question_versions {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  question_id String   @db.Uuid
  version     Int
  snapshot    Json
  created_at  DateTime @default(now()) @db.Timestamptz(6)

  theory_questions theory_questions @relation(fields: [question_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_versions_question")

  @@unique([question_id, version], map: "uq_theory_question_versions_question_version")
  @@index([question_id, created_at(sort: Desc)], map: "idx_theory_question_versions_question_created")
}

model theory_lessons {
  id                         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  topic_id                   String    @db.Uuid
  slug                       String    @db.VarChar(96)
  sort_order                 Int       @default(0)
  estimated_duration_minutes Int?      @db.SmallInt
  status                     String    @default("draft") @db.VarChar(24)
  version                    Int       @default(1)
  valid_from                 DateTime? @db.Date
  valid_until                DateTime? @db.Date
  published_at               DateTime? @db.Timestamptz(6)
  created_at                 DateTime  @default(now()) @db.Timestamptz(6)
  updated_at                 DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  theory_topics  theory_topics @relation(fields: [topic_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_lessons_topic")
  translations   theory_lesson_translations[]
  content_blocks theory_lesson_content_blocks[]
  user_progress  user_lesson_progress[]
  notes          theory_question_notes[]
  study_sessions theory_study_sessions[]

  @@unique([topic_id, slug], map: "uq_theory_lessons_topic_slug")
  @@index([topic_id, status, sort_order], map: "idx_theory_lessons_topic_status_order")
}

model theory_lesson_translations {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lesson_id   String   @db.Uuid
  locale      String   @db.VarChar(8)
  title       String   @db.VarChar(180)
  description String?  @db.Text
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  updated_at  DateTime @default(now()) @updatedAt @db.Timestamptz(6)

  theory_lessons theory_lessons @relation(fields: [lesson_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_lesson_translations_lesson")

  @@unique([lesson_id, locale], map: "uq_theory_lesson_translations_lesson_locale")
  @@index([locale], map: "idx_theory_lesson_translations_locale")
}

model theory_lesson_content_blocks {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  lesson_id          String   @db.Uuid
  block_type         String   @db.VarChar(32)
  sort_order         Int      @default(0)
  media_storage_path String?  @db.VarChar(768)
  question_id        String?  @db.Uuid
  config_json        Json?
  is_active          Boolean  @default(true)
  created_at         DateTime @default(now()) @db.Timestamptz(6)
  updated_at         DateTime @default(now()) @updatedAt @db.Timestamptz(6)

  theory_lessons   theory_lessons    @relation(fields: [lesson_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_lesson_content_blocks_lesson")
  theory_questions theory_questions? @relation(fields: [question_id], references: [id], onDelete: SetNull, onUpdate: NoAction, map: "fk_theory_lesson_content_blocks_question")
  translations     theory_lesson_content_block_translations[]

  @@index([lesson_id, is_active, sort_order], map: "idx_theory_lesson_content_blocks_lesson_order")
  @@index([question_id], map: "idx_theory_lesson_content_blocks_question")
}

model theory_lesson_content_block_translations {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  block_id     String   @db.Uuid
  locale       String   @db.VarChar(8)
  title        String?  @db.VarChar(180)
  body_text    String?  @db.Text
  content_json Json?
  created_at   DateTime @default(now()) @db.Timestamptz(6)
  updated_at   DateTime @default(now()) @updatedAt @db.Timestamptz(6)

  theory_lesson_content_blocks theory_lesson_content_blocks @relation(fields: [block_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_lesson_block_translations_block")

  @@unique([block_id, locale], map: "uq_theory_lesson_block_translations_block_locale")
  @@index([locale], map: "idx_theory_lesson_block_translations_locale")
}

model user_lesson_progress {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_license_class_id String    @db.Uuid
  lesson_id             String    @db.Uuid
  progress_percent      Int       @default(0) @db.SmallInt
  current_block_index   Int       @default(0)
  completed             Boolean   @default(false)
  started_at            DateTime? @db.Timestamptz(6)
  completed_at          DateTime? @db.Timestamptz(6)
  last_activity_at      DateTime? @db.Timestamptz(6)
  total_active_seconds  Int       @default(0)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  user_license_classes user_license_classes @relation(fields: [user_license_class_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_user_lesson_progress_user_license_class")
  theory_lessons       theory_lessons       @relation(fields: [lesson_id], references: [id], onDelete: Restrict, onUpdate: NoAction, map: "fk_user_lesson_progress_lesson")

  @@unique([user_license_class_id, lesson_id], map: "uq_user_lesson_progress_user_class_lesson")
  @@index([user_license_class_id, last_activity_at(sort: Desc)], map: "idx_user_lesson_progress_user_class_activity")
  @@index([lesson_id], map: "idx_user_lesson_progress_lesson")
}

model theory_question_favorites {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_license_class_id String   @db.Uuid
  question_id           String   @db.Uuid
  created_at            DateTime @default(now()) @db.Timestamptz(6)

  user_license_classes user_license_classes @relation(fields: [user_license_class_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_favorites_user_license_class")
  theory_questions     theory_questions     @relation(fields: [question_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_favorites_question")

  @@unique([user_license_class_id, question_id], map: "uq_theory_question_favorites_user_class_question")
  @@index([user_license_class_id, created_at(sort: Desc)], map: "idx_theory_question_favorites_user_class_created")
}

model theory_question_notes {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_license_class_id String   @db.Uuid
  question_id           String?  @db.Uuid
  lesson_id             String?  @db.Uuid
  body                  String   @db.Text
  created_at            DateTime @default(now()) @db.Timestamptz(6)
  updated_at            DateTime @default(now()) @updatedAt @db.Timestamptz(6)

  user_license_classes user_license_classes @relation(fields: [user_license_class_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_notes_user_license_class")
  theory_questions     theory_questions?    @relation(fields: [question_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_notes_question")
  theory_lessons       theory_lessons?      @relation(fields: [lesson_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_notes_lesson")

  @@index([user_license_class_id, created_at(sort: Desc)], map: "idx_theory_question_notes_user_class_created")
  @@index([question_id], map: "idx_theory_question_notes_question")
  @@index([lesson_id], map: "idx_theory_question_notes_lesson")
}

model theory_question_reports {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_license_class_id String    @db.Uuid
  question_id           String    @db.Uuid
  reason                String    @db.VarChar(32)
  message               String?   @db.Text
  status                String    @default("open") @db.VarChar(24)
  resolved_at           DateTime? @db.Timestamptz(6)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  user_license_classes user_license_classes @relation(fields: [user_license_class_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_question_reports_user_license_class")
  theory_questions     theory_questions     @relation(fields: [question_id], references: [id], onDelete: Restrict, onUpdate: NoAction, map: "fk_theory_question_reports_question")

  @@index([user_license_class_id, created_at(sort: Desc)], map: "idx_theory_question_reports_user_class_created")
  @@index([status, created_at(sort: Desc)], map: "idx_theory_question_reports_status_created")
}

model theory_study_sessions {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_license_class_id String    @db.Uuid
  lesson_id             String?   @db.Uuid
  session_type          String    @default("lesson") @db.VarChar(24)
  status                String    @default("active") @db.VarChar(24)
  started_at            DateTime  @default(now()) @db.Timestamptz(6)
  last_activity_at      DateTime  @default(now()) @db.Timestamptz(6)
  ended_at              DateTime? @db.Timestamptz(6)
  active_seconds        Int       @default(0)
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  user_license_classes user_license_classes @relation(fields: [user_license_class_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "fk_theory_study_sessions_user_license_class")
  theory_lessons       theory_lessons?      @relation(fields: [lesson_id], references: [id], onDelete: SetNull, onUpdate: NoAction, map: "fk_theory_study_sessions_lesson")

  @@index([user_license_class_id, started_at(sort: Desc)], map: "idx_theory_study_sessions_user_class_started")
  @@index([user_license_class_id, status, last_activity_at(sort: Desc)], map: "idx_theory_study_sessions_active")
}

model exam_configurations {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  program_id       String    @db.Uuid
  version          String    @db.VarChar(32)
  question_count   Int       @db.SmallInt
  duration_seconds Int
  scoring_method   String    @db.VarChar(32)
  passing_rule     Json
  status           String    @default("draft") @db.VarChar(24)
  active_from      DateTime? @db.Date
  active_until     DateTime? @db.Date
  published_at     DateTime? @db.Timestamptz(6)
  created_at       DateTime  @default(now()) @db.Timestamptz(6)
  updated_at       DateTime  @default(now()) @updatedAt @db.Timestamptz(6)

  theory_programs theory_programs @relation(fields: [program_id], references: [id], onDelete: Restrict, onUpdate: NoAction, map: "fk_exam_configurations_program")
  exam_attempts   exam_attempts[]

  @@unique([program_id, version], map: "uq_exam_configurations_program_version")
  @@index([program_id, status, active_from, active_until], map: "idx_exam_configurations_program_status_dates")
}
`;

for (const modelName of [
  "theory_programs",
  "theory_question_versions",
  "theory_lessons",
  "theory_lesson_translations",
  "theory_lesson_content_blocks",
  "theory_lesson_content_block_translations",
  "user_lesson_progress",
  "theory_question_favorites",
  "theory_question_notes",
  "theory_question_reports",
  "theory_study_sessions",
  "exam_configurations",
]) {
  const match = newModels.match(
    new RegExp(
      `model ${modelName} \\{[\\s\\S]*?\\n\\}`,
    ),
  );

  if (!match) {
    throw new Error(
      `[Express-Führerschein] Internal patch model missing: ${modelName}`,
    );
  }

  appendModelIfMissing(
    modelName,
    match[0],
  );
}

// Add indexes represented in SQL but useful in Prisma schema.
if (
  !getModel("theory_topics").includes(
    "idx_theory_topics_program_active_order",
  )
) {
  insertRelationBeforeIndexes(
    "theory_topics",
    '  @@index([program_id, is_active, sort_order], map: "idx_theory_topics_program_active_order")',
    "idx_theory_topics_program_active_order",
  );
}

if (
  !getModel("theory_topics").includes(
    "idx_theory_topics_country_class_active_order",
  )
) {
  insertRelationBeforeIndexes(
    "theory_topics",
    '  @@index([country_code, license_class_code, is_active, sort_order], map: "idx_theory_topics_country_class_active_order")',
    "idx_theory_topics_country_class_active_order",
  );
}

if (
  !getModel("exam_attempts").includes(
    "idx_exam_attempts_configuration",
  )
) {
  insertRelationBeforeIndexes(
    "exam_attempts",
    '  @@index([exam_configuration_id], map: "idx_exam_attempts_configuration")',
    "idx_exam_attempts_configuration",
  );
}

// One-time backup.
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(
    schemaPath,
    backupPath,
  );
}

fs.writeFileSync(
  schemaPath,
  schema,
  "utf8",
);

console.log(
  "[Express-Führerschein] Theorie Prisma complement applied safely.",
);
console.log(
  `[Express-Führerschein] Schema: ${schemaPath}`,
);
console.log(
  `[Express-Führerschein] Backup: ${backupPath}`,
);
