import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryProgramDetail,
} from "@/components/admin/theory/admin-theory-program-detail";

import {
  AdminTheoryServiceError,
  getAdminTheoryProgramDetail,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    programId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { programId } =
    await params;

  try {
    const [
      program,
      pageData,
    ] =
      await Promise.all([
        getAdminTheoryProgramDetail(programId),
        getAdminTheoryPageData(),
      ]);

    return (
      <AdminTheoryProgramDetail
        program={program}
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
