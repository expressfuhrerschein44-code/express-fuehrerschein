-- Express-Führerschein
-- Read-only verification queries after the complementary Theorie migration.

SELECT
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'theory_programs',
    'theory_question_versions',
    'theory_lessons',
    'theory_lesson_translations',
    'theory_lesson_content_blocks',
    'theory_lesson_content_block_translations',
    'user_lesson_progress',
    'theory_question_favorites',
    'theory_question_notes',
    'theory_question_reports',
    'theory_study_sessions',
    'exam_configurations'
  )
ORDER BY table_name;

SELECT
  country_code,
  license_class_code,
  code,
  version,
  status,
  is_current
FROM theory_programs
ORDER BY country_code, license_class_code, version;

SELECT
  id,
  country_code,
  license_class_code,
  program_id,
  slug
FROM theory_topics
ORDER BY license_class_code, sort_order
LIMIT 100;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'exam_attempts'
  AND column_name IN (
    'exam_configuration_id',
    'configuration_snapshot'
  )
ORDER BY column_name;
