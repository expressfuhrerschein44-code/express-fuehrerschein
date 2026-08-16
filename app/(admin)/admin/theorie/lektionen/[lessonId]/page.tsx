import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryLessonEditor,
} from "@/components/admin/theory/admin-theory-lesson-editor";

import {
  AdminTheoryServiceError,
  getAdminTheoryLessonDetail,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { lessonId } =
    await params;

  try {
    const [
      lesson,
      pageData,
    ] =
      await Promise.all([
        getAdminTheoryLessonDetail(lessonId),
        getAdminTheoryPageData(),
      ]);

    return (
      <AdminTheoryLessonEditor
        lesson={lesson}
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
