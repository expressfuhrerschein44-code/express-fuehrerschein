"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AdminTheoryCandidatesTable,
} from "@/components/admin/theory/admin-theory-candidates-table";

import {
  AdminTheoryExamEditor,
} from "@/components/admin/theory/admin-theory-exam-editor";

import {
  AdminTheoryExamsTable,
} from "@/components/admin/theory/admin-theory-exams-table";

import {
  AdminTheoryFilters,
  type AdminTheoryFilterState,
} from "@/components/admin/theory/admin-theory-filters";

import {
  AdminTheoryHeader,
} from "@/components/admin/theory/admin-theory-header";

import {
  AdminTheoryLessonEditor,
} from "@/components/admin/theory/admin-theory-lesson-editor";

import {
  AdminTheoryLessonsTable,
} from "@/components/admin/theory/admin-theory-lessons-table";

import {
  AdminTheoryNavigation,
  type AdminTheorySection,
} from "@/components/admin/theory/admin-theory-navigation";

import {
  AdminTheoryProgramForm,
} from "@/components/admin/theory/admin-theory-program-form";

import {
  AdminTheoryProgramsTable,
} from "@/components/admin/theory/admin-theory-programs-table";

import {
  AdminTheoryQuestionEditor,
} from "@/components/admin/theory/admin-theory-question-editor";

import {
  AdminTheoryQuestionsTable,
} from "@/components/admin/theory/admin-theory-questions-table";

import {
  AdminTheoryReportsTable,
} from "@/components/admin/theory/admin-theory-reports-table";

import {
  AdminTheoryStats,
} from "@/components/admin/theory/admin-theory-stats";

import {
  AdminTheoryTopicEditor,
} from "@/components/admin/theory/admin-theory-topic-editor";

import {
  AdminTheoryTopicsTable,
} from "@/components/admin/theory/admin-theory-topics-table";

import type {
  AdminTheoryPageData,
} from "@/types/admin-theory";

const EMPTY_FILTERS: AdminTheoryFilterState = {
  search: "",
  country: "",
  licenseClass: "",
  status: "",
};

function contains(
  search: string,
  ...values: Array<string | null | undefined>
) {
  if (!search) return true;

  const haystack =
    values
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  return haystack.includes(search);
}

export function AdminTheoryPage({
  initialData,
}: {
  initialData: AdminTheoryPageData;
}) {
  const router = useRouter();

  const [section, setSection] =
    useState<AdminTheorySection>("programs");
  const [filters, setFilters] =
    useState<AdminTheoryFilterState>(EMPTY_FILTERS);
  const [creating, setCreating] =
    useState(false);
  const [refreshing, startRefresh] =
    useTransition();

  const countries =
    useMemo(
      () =>
        Array.from(
          new Set([
            ...initialData.programs.map((row) => row.countryCode),
            ...initialData.candidates.map((row) => row.countryCode),
          ]),
        ).sort(),
      [initialData],
    );

  const licenseClasses =
    useMemo(
      () =>
        Array.from(
          new Set([
            ...initialData.programs.map((row) => row.licenseClassCode),
            ...initialData.candidates.map((row) => row.licenseClassCode),
          ]),
        ).sort((a, b) =>
          a.localeCompare(b, "de", { numeric: true }),
        ),
      [initialData],
    );

  const statuses =
    useMemo(() => {
      const set = new Set<string>();

      if (section === "programs") {
        initialData.programs.forEach((row) => set.add(row.status));
      } else if (section === "topics") {
        set.add("active");
        set.add("inactive");
      } else if (section === "lessons") {
        initialData.lessons.forEach((row) => set.add(row.status));
      } else if (section === "questions") {
        initialData.questions.forEach((row) => set.add(row.status));
      } else if (section === "exams") {
        initialData.exams.forEach((row) => set.add(row.status));
      } else if (section === "reports") {
        initialData.reports.forEach((row) => set.add(row.status));
      } else {
        initialData.candidates.forEach((row) => set.add(row.classStatus));
      }

      return Array.from(set).filter(Boolean).sort();
    }, [initialData, section]);

  const programById =
    useMemo(
      () =>
        new Map(
          initialData.programs.map((program) => [
            program.id,
            program,
          ]),
        ),
      [initialData.programs],
    );

  const topicById =
    useMemo(
      () =>
        new Map(
          initialData.topics.map((topic) => [
            topic.id,
            topic,
          ]),
        ),
      [initialData.topics],
    );

  const search =
    filters.search.trim().toLowerCase();

  const visible = useMemo(() => {
    const countryOk =
      (country: string | undefined) =>
        !filters.country ||
        country === filters.country;

    const classOk =
      (licenseClass: string | undefined) =>
        !filters.licenseClass ||
        licenseClass === filters.licenseClass;

    if (section === "programs") {
      return {
        programs:
          initialData.programs.filter((row) =>
            countryOk(row.countryCode) &&
            classOk(row.licenseClassCode) &&
            (!filters.status || row.status === filters.status) &&
            contains(search, row.code, row.version),
          ),
      };
    }

    if (section === "topics") {
      return {
        topics:
          initialData.topics.filter((row) =>
            countryOk(row.countryCode) &&
            classOk(row.licenseClassCode) &&
            (
              !filters.status ||
              (filters.status === "active" && row.isActive) ||
              (filters.status === "inactive" && !row.isActive)
            ) &&
            contains(search, row.title, row.description, row.slug),
          ),
      };
    }

    if (section === "lessons") {
      return {
        lessons:
          initialData.lessons.filter((row) => {
            const program =
              programById.get(row.programId);

            return (
              countryOk(program?.countryCode) &&
              classOk(program?.licenseClassCode) &&
              (!filters.status || row.status === filters.status) &&
              contains(
                search,
                row.title,
                row.topicTitle,
                row.programCode,
                row.slug,
              )
            );
          }),
      };
    }

    if (section === "questions") {
      return {
        questions:
          initialData.questions.filter((row) => {
            const topic =
              topicById.get(row.topicId);

            return (
              countryOk(topic?.countryCode) &&
              classOk(topic?.licenseClassCode) &&
              (!filters.status || row.status === filters.status) &&
              contains(
                search,
                row.prompt,
                row.topicTitle,
                row.externalRef,
                row.questionType,
              )
            );
          }),
      };
    }

    if (section === "exams") {
      return {
        exams:
          initialData.exams.filter((row) =>
            countryOk(row.countryCode) &&
            classOk(row.licenseClassCode) &&
            (!filters.status || row.status === filters.status) &&
            contains(
              search,
              row.programCode,
              row.version,
              row.scoringMethod,
            ),
          ),
      };
    }

    if (section === "reports") {
      return {
        reports:
          initialData.reports.filter((row) =>
            classOk(row.candidate.licenseClassCode) &&
            (!filters.status || row.status === filters.status) &&
            contains(
              search,
              row.reason,
              row.message,
              row.question.prompt,
              row.question.topicTitle,
              row.candidate.fullName,
              row.candidate.email,
            ),
          ),
      };
    }

    return {
      candidates:
        initialData.candidates.filter((row) =>
          countryOk(row.countryCode) &&
          classOk(row.licenseClassCode) &&
          (!filters.status || row.classStatus === filters.status) &&
          contains(
            search,
            row.fullName,
            row.email,
            row.licenseClassCode,
          ),
        ),
    };
  }, [
    filters,
    initialData,
    programById,
    search,
    section,
    topicById,
  ]);

  function changeSection(next: AdminTheorySection) {
    setSection(next);
    setCreating(false);
    setFilters(EMPTY_FILTERS);
  }

  const canCreate =
    section !== "reports" &&
    section !== "candidates";

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-6">
      <AdminTheoryHeader
        refreshing={refreshing}
        onRefresh={() =>
          startRefresh(() => {
            router.refresh();
          })
        }
        canCreate={canCreate}
        onCreate={
          canCreate
            ? () => setCreating((current) => !current)
            : undefined
        }
      />

      <div className="mt-4">
        <AdminTheoryStats stats={initialData.stats} />
      </div>

      <div className="mt-4">
        <AdminTheoryNavigation
          value={section}
          onChange={changeSection}
        />
      </div>

      {creating ? (
        <div className="mt-4">
          {section === "programs" ? (
            <AdminTheoryProgramForm
              onSaved={() => setCreating(false)}
            />
          ) : section === "topics" ? (
            <AdminTheoryTopicEditor
              createMode
              pageData={initialData}
              onSaved={() => setCreating(false)}
            />
          ) : section === "lessons" ? (
            <AdminTheoryLessonEditor
              createMode
              pageData={initialData}
              onSaved={() => setCreating(false)}
            />
          ) : section === "questions" ? (
            <AdminTheoryQuestionEditor
              createMode
              pageData={initialData}
              onSaved={() => setCreating(false)}
            />
          ) : section === "exams" ? (
            <AdminTheoryExamEditor
              createMode
              pageData={initialData}
              onSaved={() => setCreating(false)}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <AdminTheoryFilters
          value={filters}
          onChange={setFilters}
          countries={countries}
          licenseClasses={licenseClasses}
          statuses={statuses}
        />
      </div>

      <div className="mt-4">
        {section === "programs" ? (
          <AdminTheoryProgramsTable
            programs={visible.programs ?? []}
          />
        ) : section === "topics" ? (
          <AdminTheoryTopicsTable
            topics={visible.topics ?? []}
          />
        ) : section === "lessons" ? (
          <AdminTheoryLessonsTable
            lessons={visible.lessons ?? []}
          />
        ) : section === "questions" ? (
          <AdminTheoryQuestionsTable
            questions={visible.questions ?? []}
          />
        ) : section === "exams" ? (
          <AdminTheoryExamsTable
            exams={visible.exams ?? []}
          />
        ) : section === "reports" ? (
          <AdminTheoryReportsTable
            reports={visible.reports ?? []}
          />
        ) : (
          <AdminTheoryCandidatesTable
            candidates={visible.candidates ?? []}
          />
        )}
      </div>
    </main>
  );
}

export default AdminTheoryPage;
