import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryTopicEditor,
} from "@/components/admin/theory/admin-theory-topic-editor";

import {
  AdminTheoryServiceError,
  getAdminTheoryTopicDetail,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { topicId } =
    await params;

  try {
    const [
      topic,
      pageData,
    ] =
      await Promise.all([
        getAdminTheoryTopicDetail(topicId),
        getAdminTheoryPageData(),
      ]);

    return (
      <AdminTheoryTopicEditor
        topic={topic}
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
