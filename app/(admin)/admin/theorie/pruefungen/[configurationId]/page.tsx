import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryExamEditor,
} from "@/components/admin/theory/admin-theory-exam-editor";

import {
  AdminTheoryServiceError,
  getAdminTheoryExamDetail,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    configurationId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { configurationId } =
    await params;

  try {
    const [
      exam,
      pageData,
    ] =
      await Promise.all([
        getAdminTheoryExamDetail(configurationId),
        getAdminTheoryPageData(),
      ]);

    return (
      <AdminTheoryExamEditor
        exam={exam}
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
