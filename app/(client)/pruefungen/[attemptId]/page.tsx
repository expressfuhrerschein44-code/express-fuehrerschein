import {
  notFound,
} from "next/navigation";

import {
  ExamPlayer,
} from "@/components/exams/exam-player";

import {
  ExamResult,
} from "@/components/exams/exam-result";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryExamAttemptPageData,
} from "@/lib/server/theory/theory-exam-service";

export const dynamic =
  "force-dynamic";

export default async function PruefungAttemptPage(
  {
    params,
  }: {
    params:
      Promise<{
        attemptId:
          string;
      }>;
  },
) {
  const {
    attemptId:
      rawAttemptId,
  } =
    await params;

  const attemptId =
    decodeURIComponent(
      rawAttemptId,
    ).trim();

  if (!attemptId) {
    notFound();
  }

  const session =
    await requireClientSession();

  const data =
    await getTheoryExamAttemptPageData({
      userId:
        session.user.id,
      locale:
        session.user
          .preferredLocale,
      attemptId,
    });

  if (!data) {
    notFound();
  }

  if (
    data.result
  ) {
    return (
      <ExamResult
        result={
          data.result
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />
    );
  }

  return (
    <ExamPlayer
      data={
        data
      }
    />
  );
}
