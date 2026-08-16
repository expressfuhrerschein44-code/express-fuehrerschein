import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryQuestionEditor,
} from "@/components/admin/theory/admin-theory-question-editor";

import {
  AdminTheoryServiceError,
  getAdminTheoryQuestionDetail,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    questionId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { questionId } =
    await params;

  try {
    const [
      question,
      pageData,
    ] =
      await Promise.all([
        getAdminTheoryQuestionDetail(questionId),
        getAdminTheoryPageData(),
      ]);

    return (
      <AdminTheoryQuestionEditor
        question={question}
        pageData={pageData}
      />
    );
  } catch (error) {
    if (
      error instanceof AdminTheoryServiceError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect("/admin/login");
    }

    if (
      error instanceof AdminTheoryServiceError &&
      error.code === "NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }
}
